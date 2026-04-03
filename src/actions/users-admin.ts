"use server";

import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  serverTimestamp,
  collectionGroup,
  query,
  getDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { requireAdmin } from "@/lib/auth-guards";
import { AdminUser } from "@/types/users";
import { revalidatePath } from "next/cache";

/**
 * BPlen HUB — User Management Actions (Seguro e Otimizado ⚡)
 * Centraliza a administração de perfis e acessos administrativos.
 */

/**
 * Retorna a lista completa de usuários para o painel administrativo.
 * Resolve permissões via Collection Group para eficiência (Apenas 2 queries ao banco).
 */
export async function getAdminUsersList(adminToken?: string): Promise<AdminUser[]> {
  try {
    // 🛡️ Segurança Real no Servidor
    await requireAdmin(adminToken);

    // 1. Puxar todos os usuários da base principal
    const usersRef = collection(db, "User");
    const usersSnap = await getDocs(usersRef);

    // 2. Puxar todas as permissões administrativas via Collection Group
    // Isso busca todos os docs chamados 'access' dentro de qualquer subcoleção 'User_Permissions'
    const permissionsRef = collectionGroup(db, "User_Permissions");
    const permissionsSnap = await getDocs(permissionsRef);

    // Mapear administradores por matrícula para busca O(1)
    const adminMap = new Set<string>();
    permissionsSnap.forEach(docSnap => {
       if (docSnap.id === "access" && docSnap.data().admin === true) {
          // O path do doc no Collection Group é User/{matricula}/User_Permissions/access
          const pathSegments = docSnap.ref.path.split('/');
          const matricula = pathSegments[1]; // Pegamos a matrícula da URL do documento
          adminMap.add(matricula);
       }
    });

    // 3. Montar a lista consolidada
    const adminUsers: AdminUser[] = [];

    usersSnap.forEach(docSnap => {
      const data = docSnap.data();
      const matricula = docSnap.id;
      const welcome = data.User_Welcome || {};
      
      // Resolução de Nome/Nickname conforme hierarquia de governança
      const name = welcome.Authentication_Name || data.User_Name || data.Authentication_Name || "Membro BPlen";
      const nickname = welcome.User_Nickname || data.User_Nickname;

      adminUsers.push({
        matricula,
        name,
        nickname,
        email: data.User_Email || welcome.User_Email || "",
        isAdmin: adminMap.has(matricula),
        onboardStatus: data.User_Welcome ? "completed" : "pending",
        createdAt: data.createdAt || null,
        // Espaço para evolução futura
        role: adminMap.has(matricula) ? "Admin" : "Membro",
        services: data.User_Services || {} 
      });
    });

    // Ordenar por nome
    return adminUsers.sort((a, b) => a.name.localeCompare(b.name));

  } catch (error: any) {
    console.error("❌ [Users Admin] Falha ao listar usuários:", error.message);
    throw new Error(error.message || "Falha ao carregar lista de usuários.");
  }
}

/**
 * Concede ou remove o status de Administrador de um usuário.
 */
export async function toggleUserAdminStatus(
  targetMatricula: string, 
  newStatus: boolean, 
  adminToken?: string
) {
  try {
    // 🛡️ Segurança Real no Servidor
    await requireAdmin(adminToken);

    // Referência oficial do documento de permissões
    const permissionsRef = doc(db, "User", targetMatricula, "User_Permissions", "access");
    
    await setDoc(permissionsRef, {
      admin: newStatus,
      updatedAt: serverTimestamp(),
      updatedBy: "ADMIN_CONSOLE"
    }, { merge: true });

    revalidatePath("/admin/users");
    
    console.log(`✅ [Users Admin] Permissão alterada para ${targetMatricula}: Admin=${newStatus}`);
    return { success: true };

  } catch (error: any) {
    console.error("❌ [Users Admin] Falha ao alterar permissão:", error.message);
    throw new Error(error.message || "Falha ao atualizar permissões do usuário.");
  }
}
