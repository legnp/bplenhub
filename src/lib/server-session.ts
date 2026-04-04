import { getAdminAuth } from "./firebase-admin";
import { fetchUserPermissionsStatus } from "@/actions/auth-permissions";
import { UserRole, UserServices } from "@/types/users";

export interface Session {
  uid: string;
  email?: string;
  isAdmin: boolean;
  role?: UserRole;
  services?: UserServices;
}

/**
 * Resolve a identidade do chamador no servidor.
 * Atualmente utiliza ID Token enviado como argumento; no futuro, lerá de cookies.
 * 
 * @param idToken Token de identidade opcional (obrigatório enquanto não houver cookies).
 * @returns Objeto Session ou null se inválido.
 */
export async function getServerSession(idToken?: string): Promise<Session | null> {
  // TODO: Futura implementação de cookies aqui (migração de uma linha)
  // const sessionCookie = cookies().get("__session")?.value;
  // if (sessionCookie) return resolveFromCookie(sessionCookie);

  if (!idToken) return null;

  try {
    // 1. Validar a Autenticidade do Token (Segurança Real ✅)
    const decodedToken = await getAdminAuth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // 2. Resolver o Papel (Role) e Serviços do Usuário
    // Usamos a fonte oficial de permissões definida em auth-permissions.ts
    const { isAdmin, role, services } = await fetchUserPermissionsStatus(uid);

    return {
      uid,
      email: decodedToken.email,
      isAdmin,
      role,
      services
    };
  } catch (error) {
    console.error("❌ [Server Session] Falha ao resolver identidade:", error);
    return null;
  }
}
