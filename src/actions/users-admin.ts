"use server";

import { getAdminDb } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";
import { requireAdmin } from "@/lib/auth-guards";
import { AdminUser, UserRole, UserServices } from "@/types/users";
import { revalidatePath } from "next/cache";

/**
 * Constantes de Governança (Allowlist 🛡️)
 */
const ALLOWED_ROLES: UserRole[] = ["visitor", "member", "admin"];
const ALLOWED_SERVICE_KEYS = [
  "hub_community",
  "survey_welcome",
  "content_premium",
  "mentoria_1to1",
  "career_planning",
  "behavioral_analysis",
  "member_area_access"
];

/**
 * Retorna a lista completa de usuários para o painel administrativo.
 * Resolve permissões via Collection Group e normaliza papéis.
 */
export async function getAdminUsersList(adminToken?: string): Promise<{ success: boolean; data?: AdminUser[]; error?: string }> {
  try {
    // 🛡️ Segurança Real no Servidor
    await requireAdmin(adminToken);

    // 1. Puxar todos os usuários da base principal (Node Admin SDK)
    const usersRef = getAdminDb().collection("User");
    const usersSnap = await usersRef.get();

    // 2. Puxar todas as permissões administrativas via Collection Group
    const permissionsRef = getAdminDb().collectionGroup("User_Permissions");
    const permissionsSnap = await permissionsRef.get();

    // Mapear dados de permissão por matrícula para busca O(1)
    interface AccessDocData {
      role?: UserRole;
      services?: UserServices;
      admin?: boolean;
    }
    
    const permissionsMap = new Map<string, AccessDocData>();
    permissionsSnap.forEach(docSnap => {
       if (docSnap.id === "access") {
          // Obtém a matrícula do documento "pai" do "pai" (User/{matricula}/User_Permissions/access)
          const matricula = docSnap.ref.parent.parent?.id;
          if (matricula) {
             permissionsMap.set(matricula, docSnap.data() as AccessDocData);
          }
       }
    });

    // 3. Montar a lista consolidada
    const adminUsers: AdminUser[] = [];

    usersSnap.forEach(docSnap => {
      const data = docSnap.data();
      const matricula = docSnap.id;
      const perm = permissionsMap.get(matricula) || {};
      
      const name = data.Authentication_Name || data.User_Name || data.User_Welcome?.Authentication_Name || "Membro BPlen";
      const nickname = data.User_Nickname || data.User_Welcome?.User_Nickname;

      // Normalização de Papel (Role)
      let resolvedRole: UserRole = perm.role || (perm.admin ? "admin" : "member");

      // SERIALIZAÇÃO SEGURA: Converte Timestamps para ISO Strings 🛡️
      let createdAtData: string | undefined = undefined;
      if (data.createdAt) {
         if (typeof data.createdAt === 'object' && 'toDate' in data.createdAt) {
            createdAtData = (data.createdAt as admin.firestore.Timestamp).toDate().toISOString();
         } else if (typeof data.createdAt === 'string') {
            createdAtData = data.createdAt;
         }
      }

      adminUsers.push({
        matricula,
        name,
        nickname,
        email: data.email || data.User_Email || data.User_Welcome?.email || data.User_Welcome?.User_Email || "",
        isAdmin: resolvedRole === "admin",
        role: resolvedRole,
        services: perm.services || {},
        onboardStatus: (data.hasCompletedWelcome || data.User_Welcome) ? "completed" : "pending",
        createdAt: createdAtData,
      });
    });

    return { success: true, data: adminUsers.sort((a, b) => a.name.localeCompare(b.name)) };

  } catch (error: any) {
    console.error("❌ [Users Admin] Falha ao listar usuários:", error.message);
    return { success: false, error: error.message || "Falha ao carregar lista de usuários." };
  }
}

/**
 * Atualiza permissões granulares de um usuário (Papel e Serviços).
 */
export async function updateUserPermissions(
  targetMatricula: string, 
  updates: { role?: UserRole; services?: UserServices },
  adminToken?: string
) {
  try {
    // 🛡️ Segurança Real no Servidor
    const session = await requireAdmin(adminToken);

    // 1. Validação de Payload (Enforcement de Tipagem no Servidor) 🛡️
    const dataToSave: {
       updatedAt: admin.firestore.FieldValue;
       updatedBy: string;
       role?: UserRole;
       admin?: boolean;
       services?: UserServices;
    } = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: `ADMIN:${session.email || session.uid}`
    };

    if (updates.role) {
       if (!ALLOWED_ROLES.includes(updates.role)) {
          throw new Error(`Papel inválido: ${updates.role}`);
       }
       dataToSave.role = updates.role;
       dataToSave.admin = updates.role === "admin";
    }

    if (updates.services) {
       const validatedServices: any = {};
       Object.entries(updates.services).forEach(([key, value]) => {
          if (ALLOWED_SERVICE_KEYS.includes(key)) {
             validatedServices[key] = value === true;
          } else {
             console.warn(`⚠️ [Governance] Ignorando chave de serviço inválida enviada: ${key}`);
          }
       });
       dataToSave.services = validatedServices;
    }

    // 2. Proteção Anti-Lockout 🚨
    // Se o admin está tentando se rebaixar, verificamos se ele é o último.
    const isSelfEdit = session.uid === targetMatricula || (session.email && session.email === updates.role); 
    // Nota: UID e Matrícula podem variar. Idealmente comparamos o email ou UID se disponível.
    // Para simplificar, focaremos na regra de "Mínimo de 1 Admin na base".
    
    if (updates.role && updates.role !== "admin") {
      const allAdminsSnap = await getAdminDb()
        .collectionGroup("User_Permissions")
        .where("admin", "==", true)
        .limit(2) // Só preciso saber se tem mais de um
        .get();
      
      if (allAdminsSnap.size <= 1) {
         throw new Error("Operação Bloqueada: Você não pode remover o último administrador do sistema.");
      }
    }

    const permissionsPath = `User/${targetMatricula}/User_Permissions/access`;
    const permissionsRef = getAdminDb().doc(permissionsPath);

    // Escrita Soberana via Admin SDK
    await permissionsRef.set(dataToSave, { merge: true });

    revalidatePath("/admin/users");
    
    console.log(`✅ [Governance Admin] Permissões atualizadas para ${targetMatricula} no path: ${permissionsPath}`);
    return { success: true };

  } catch (error: any) {
    console.error("❌ [Governance Admin] Falha ao atualizar permissões:", error.message);
    throw new Error(error.message || "Falha ao atualizar governança do usuário.");
  }
}
