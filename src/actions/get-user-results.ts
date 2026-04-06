"use server";

import { getAdminDb } from "@/lib/firebase-admin";

/**
 * BPlen HUB — Robust Results Connection (🧬🛡️)
 * Este helper garante que o usuário sempre encontre sua matrícula, 
 * mesmo que o mapeamento inicial tenha falhado.
 */
async function resolveMatricula(userUid: string, email?: string): Promise<string | null> {
  const db = getAdminDb();
  
  // 1. Tentar Mapeamento Direto (AuthMap) - Alta Performance
  const authMapSnap = await db.doc(`_AuthMap/${userUid}`).get();
  if (authMapSnap.exists && authMapSnap.data()?.matricula) {
    return authMapSnap.data()?.matricula;
  }

  // 2. Fallback: Buscar na base User por ID de Autenticação
  const userByUidSnap = await db.collection("User").where("uid", "==", userUid).limit(1).get();
  if (!userByUidSnap.empty) {
    const matricula = userByUidSnap.docs[0].id;
    // Auto-Healing: Grava no AuthMap para a próxima vez
    await db.doc(`_AuthMap/${userUid}`).set({ matricula }, { merge: true });
    return matricula;
  }

  // 3. Last Resort: Buscar por E-mail (Compatibilidade com Importações Legadas)
  if (email) {
    const userByEmailSnap = await db.collection("User").where("email", "==", email).limit(1).get();
    if (!userByEmailSnap.empty) {
      const matricula = userByEmailSnap.docs[0].id;
      // Auto-Healing: Vincula o UID atual à matrícula e atualiza o AuthMap
      await userByEmailSnap.docs[0].ref.update({ uid: userUid });
      await db.doc(`_AuthMap/${userUid}`).set({ matricula }, { merge: true });
      return matricula;
    }
  }

  return null;
}

/**
 * Funções de Busca com Resolução Robusta
 */

export async function getGestaoTempoResult(userUid: string, email?: string) {
  const db = getAdminDb();
  const matricula = await resolveMatricula(userUid, email);
  if (!matricula) return null;

  const resultSnap = await db.doc(`User/${matricula}/results/gestao_tempo`).get();
  return resultSnap.exists ? resultSnap.data() : null;
}

export async function getPreferenciasAprendizadoResult(userUid: string, email?: string) {
  const db = getAdminDb();
  const matricula = await resolveMatricula(userUid, email);
  if (!matricula) return null;

  const resultSnap = await db.doc(`User/${matricula}/results/preferencias_aprendizado`).get();
  return resultSnap.exists ? resultSnap.data() : null;
}

export async function getPreferenciasReconhecimentoResult(userUid: string, email?: string) {
  const db = getAdminDb();
  const matricula = await resolveMatricula(userUid, email);
  if (!matricula) return null;

  const resultSnap = await db.doc(`User/${matricula}/results/preferencias_reconhecimento`).get();
  return resultSnap.exists ? resultSnap.data() : null;
}

export async function getPreAnaliseComportamentalResult(userUid: string, email?: string) {
  const db = getAdminDb();
  const matricula = await resolveMatricula(userUid, email);
  if (!matricula) return null;

  const resultSnap = await db.doc(`User/${matricula}/results/pre_analise_comportamental`).get();
  return resultSnap.exists ? resultSnap.data() : null;
}




