import { getAdminAuth } from "./firebase-admin";
import { fetchUserPermissionsStatus } from "@/actions/auth-permissions";
import { UserRole, UserServices } from "@/types/users";
import { cookies } from "next/headers";

export interface Session {
  uid: string;
  email?: string;
  isAdmin: boolean;
  role?: UserRole;
  services?: UserServices;
}

/**
 * Resolve a identidade do chamador no servidor.
 * Suporta ID Token JWT (Alta Segurança) ou Cookie de Sessão (Transparência).
 * 
 * @param idToken Token de identidade opcional.
 * @returns Objeto Session ou null se inválido.
 */
export async function getServerSession(idToken?: string): Promise<Session | null> {
  let uid: string | null = null;
  let email: string | undefined = undefined;

  try {
    // 1. Prioridade: ID Token JWT (Vindo do cliente via argumento)
    if (idToken) {
      const decodedToken = await getAdminAuth().verifyIdToken(idToken);
      uid = decodedToken.uid;
      email = decodedToken.email;
    } 
    // 2. Fallback: Cookies do Servidor (Transparência para Admin/Member Area)
    else {
      const cookieStore = await cookies();
      uid = cookieStore.get("bplen_session_uid")?.value || null;
    }

    if (!uid) return null;

    // 3. Resolver o Papel (Role) e Serviços do Usuário via Admin SDK/Firestore
    const { isAdmin, role, services } = await fetchUserPermissionsStatus(uid);

    return {
      uid,
      email,
      isAdmin,
      role,
      services
    };
  } catch (error) {
    console.error("❌ [Server Session] Falha ao resolver identidade:", error);
    return null;
  }
}
