"use server";

import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  serverTimestamp,
  collectionGroup,
  revalidatePath
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { requireAdmin } from "@/lib/auth-guards";
import { AdminUser, UserRole, UserServices } from "@/types/users";

/**
 * BPlen HUB — User Management Actions (Governança 👥🏗️)
 * Controle centralizado de Papéis (Roles) e Serviços (Entitlements).
 */

/**
 * Retorna a lista completa de usuários para o painel administrativo.
 * Resolve permissões via Collection Group e normaliza papéis.
 */
export async function getAdminUsersList(adminToken?: string): Promise<AdminUser[]> {
  try {
    // 🛡️ Segurança Real no Servidor
    await requireAdmin(adminToken);

    // 1. Puxar todos os usuários da base principal
    const usersRef = collection(db, "User");
    const usersSnap = await getDocs(usersRef);

    // 2. Puxar todas as permissões administrativas via Collection Group
    const permissionsRef = collectionGroup(db, "User_Permissions");
    const permissionsSnap = await getDocs(permissionsRef);

    // Mapear dados de permissão por matrícula para busca O(1)
    const permissionsMap = new Map<string, { role?: UserRole; services?: UserServices; admin?: boolean }>();
    permissionsSnap.forEach(docSnap => {
       if (docSnap.id === "access") {
          const pathSegments = docSnap.ref.path.split('/');
          const matricula = pathSegments[1];
          permissionsMap.set(matricula, docSnap.data() as any);
       }
    });

    // 3. Montar a lista consolidada
    const adminUsers: AdminUser[] = [];

    usersSnap.forEach(docSnap => {
      const data = docSnap.data();
      const matricula = docSnap.id;
      const perm = permissionsMap.get(matricula) || {};
      
      const welcome = data.User_Welcome || {};
      const name = welcome.Authentication_Name || data.User_Name || data.Authentication_Name || "Membro BPlen";
      const nickname = welcome.User_Nickname || data.User_Nickname;

      // Normalização de Papel (Role)
      // Se não houver 'role' definido, inferimos 'admin' se flagLegacyAdmin for true, senão 'member'.
      let resolvedRole: UserRole = perm.role || (perm.admin ? "admin" : "member");

      adminUsers.push({
        matricula,
        name,
        nickname,
        email: data.User_Email || welcome.User_Email || "",
        isAdmin: resolvedRole === "admin",
        role: resolvedRole,
        services: perm.services || {},
        onboardStatus: data.User_Welcome ? "completed" : "pending",
        createdAt: data.createdAt || null,
      });
    });

    return adminUsers.sort((a, b) => a.name.localeCompare(b.name));

  } catch (error: any) {
    console.error("❌ [Users Admin] Falha ao listar usuários:", error.message);
    throw new Error(error.message || "Falha ao carregar lista de usuários.");
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
    await requireAdmin(adminToken);

    const permissionsRef = doc(db, "User", targetMatricula, "User_Permissions", "access");
    
    // Preparar dados para salvar
    const dataToSave: any = {
      ...updates,
      updatedAt: serverTimestamp(),
      updatedBy: "ADMIN_GOVERNANCE"
    };

    // Manter compatibilidade com a flag legado 'admin'
    if (updates.role) {
      dataToSave.admin = updates.role === "admin";
    }

    await setDoc(permissionsRef, dataToSave, { merge: true });

    revalidatePath("/admin/users");
    
    console.log(`✅ [Governance Admin] Permissões atualizadas para ${targetMatricula}: Role=${updates.role || 'unchanged'}`);
    return { success: true };

  } catch (error: any) {
    console.error("❌ [Governance Admin] Falha ao atualizar permissões:", error.message);
    throw new Error(error.message || "Falha ao atualizar governança do usuário.");
  }
}
