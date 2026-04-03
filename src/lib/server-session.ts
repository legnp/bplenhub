import { adminAuth } from "./firebase-admin";
import { fetchUserPermissionsStatus } from "@/actions/auth-permissions";

/**
 * BPlen HUB — Server-Side Session Abstraction 🏗️
 * Desacopla as Server Actions da fonte de identidade (ID Token ou Cookies).
 */

export interface Session {
  uid: string;
  email?: string;
  isAdmin: boolean;
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
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // 2. Resolver o Papel (Role) Administrativo do Usuário
    // Usamos a fonte oficial de permissões definida em auth-permissions.ts
    const isAdmin = await fetchUserPermissionsStatus(uid);

    return {
      uid,
      email: decodedToken.email,
      isAdmin,
    };
  } catch (error) {
    console.error("❌ [Server Session] Falha ao resolver identidade:", error);
    return null;
  }
}
