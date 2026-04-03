import { getServerSession, Session } from "./server-session";
import { revalidateTag } from "next/cache";

/**
 * BPlen HUB — Autenticação e Autorização Protegida (Guards 🛡️)
 * Camada reutilizável para bloquear execuções no servidor quando não autorizado.
 */

export class AuthorizationError extends Error {
  constructor(message = "Acesso Negado: Ação restrita a administradores.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Exige permissão Administrativa para continuar a execução.
 * 
 * @param idToken Token de Identidade opcional (atualmente obrigatório enquanto não houver cookies).
 * @returns Objeto Session se autenticado e autorizado.
 * @throws {AuthorizationError} Se a identidade não for resolvida ou o usuário não for admin.
 */
export async function requireAdmin(idToken?: string): Promise<Session> {
  const session = await getServerSession(idToken);

  if (!session) {
    console.error("❌ [Authorization] Falha na identificação do chamador.");
    throw new AuthorizationError("Sessão inválida ou expirada. Autentique-se novamente.");
  }

  if (!session.isAdmin) {
    console.error(`❌ [Authorization] Acesso bloqueado para o UID: ${session.uid}`);
    throw new AuthorizationError("Você não tem permissão para realizar esta operação.");
  }

  // Se passou, logamos o acesso legítimo (Auditoria 🕵️)
  console.log(`✅ [Authorization] Acesso administrativo autorizado para: ${session.email}`);
  
  return session;
}
