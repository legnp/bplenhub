import { getAdminDb } from "@/lib/firebase-admin";

/**
 * BPlen HUB — Identity Resolver (🕵️‍♂️)
 * Converte um UID do Firebase em uma identidade amigável (Nickname).
 * Essencial para a personalização de e-mails e comunicações premium.
 */
export async function resolveUserNickname(uid: string): Promise<string> {
  if (!uid) return "Membro";

  try {
    const db = getAdminDb();
    
    // 1. Buscar a Matrícula vinculada ao UID (_AuthMap)
    const authMapSnap = await db.collection("_AuthMap").doc(uid).get();
    
    if (!authMapSnap.exists) {
      console.warn(`⚠️ [Identity] UID ${uid} não encontrado no _AuthMap.`);
      return "Membro";
    }

    const matricula = authMapSnap.data()?.matricula;

    if (!matricula) return "Membro";

    // 2. Buscar o Nickname no perfil do usuário
    const userSnap = await db.collection("User").doc(matricula).get();
    
    if (!userSnap.exists) {
      return "Membro";
    }

    const userData = userSnap.data();
    
    // Retorna o Nickname, ou o Nome de Autenticação, ou fallback
    return userData?.User_Nickname || userData?.Authentication_Name || "Membro";

  } catch (error) {
    console.error(`❌ [Identity] Erro ao resolver nickname para UID ${uid}:`, error);
    return "Membro";
  }
}
