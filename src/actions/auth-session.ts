"use server";

import { cookies } from "next/headers";

/**
 * BPlen HUB — Auth Session Actions (Segurança 🛡️)
 * Gerencia cookies de sessão para permitir Proteção de Rota Server-Side.
 */

const SESSION_COOKIE_NAME = "bplen_session_uid";

/**
 * Sincroniza a sessão do cliente com o servidor via Cookies.
 * Usado pelo AuthContext para permitir que Layouts (Server Components) identifiquem a sessão.
 */
export async function syncSessionCookie(uid: string | null) {
  const cookieStore = await cookies();
  
  if (!uid) {
    cookieStore.delete(SESSION_COOKIE_NAME);
    return { success: true, action: "deleted" };
  }

  // Define um cookie simples com o UID do usuário (Segurança em camadas 🛡️)
  // Nota: Não é um token assinado (JWT), mas serve para o Route Gate básico.
  // A autoridade real continua nas Server Actions que validam o ID Token completo.
  cookieStore.set(SESSION_COOKIE_NAME, uid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });

  return { success: true, action: "set" };
}

/**
 * Verifica se existe uma sessão ativa no servidor.
 */
export async function hasServerSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.has(SESSION_COOKIE_NAME);
}

/**
 * Obtém o UID da sessão atual.
 */
export async function getSessionUid(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
}
