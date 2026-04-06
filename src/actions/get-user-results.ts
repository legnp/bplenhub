"use server";

import { getAdminDb } from "@/lib/firebase-admin";

/**
 * BPlen HUB — Robust Results Connection (🧬🛡️)
 * Este helper garante que o usuário sempre encontre sua matrícula, 
 * mesmo que o mapeamento inicial tenha falhado.
 */
async function resolveMatricula(userUid: string, email?: string): Promise<string | null> {
  const db = getAdminDb();
  console.log(`🔍 [GetResults:resolveMatricula] Resolvendo para UID: ${userUid}, Email: ${email}`);
  
  // 1. Tentar Mapeamento Direto (AuthMap) - Alta Performance
  const authMapSnap = await db.doc(`_AuthMap/${userUid}`).get();
  if (authMapSnap.exists && authMapSnap.data()?.matricula) {
    const mat = authMapSnap.data()?.matricula;
    console.log(`🔍 [GetResults:resolveMatricula] Matrícula via AuthMap: ${mat}`);
    return mat;
  }

  // 2. Fallback: Buscar na base User por ID de Autenticação (UID)
  const userByUidSnap = await db.collection("User").where("uid", "==", userUid).limit(1).get();
  if (!userByUidSnap.empty) {
    const matricula = userByUidSnap.docs[0].id;
    console.log(`🔍 [GetResults:resolveMatricula] Matrícula via UID Search: ${matricula}`);
    // Auto-Healing: Grava no AuthMap para a próxima vez
    await db.doc(`_AuthMap/${userUid}`).set({ matricula, recoveredAt: new Date() }, { merge: true });
    return matricula;
  }

  // 3. Last Resort: Buscar por E-mail (Normalizado)
  if (email) {
    const normalizedEmail = email.trim().toLowerCase();
    const userByEmailSnap = await db.collection("User").where("email", "==", normalizedEmail).limit(1).get();
    if (!userByEmailSnap.empty) {
      const matricula = userByEmailSnap.docs[0].id;
      console.log(`🔍 [GetResults:resolveMatricula] Matrícula via Email Search: ${matricula}`);
      
      // Auto-Healing: Vincula o UID atual à matrícula e atualiza o AuthMap
      await userByEmailSnap.docs[0].ref.update({ uid: userUid });
      await db.doc(`_AuthMap/${userUid}`).set({ matricula, recoveredAt: new Date() }, { merge: true });
      return matricula;
    }
  }

  console.warn(`⚠️ [GetResults:resolveMatricula] Nenhuma matrícula legítima para UID: ${userUid}`);
  return null;
}

/**
 * Funções de Busca com Resolução Robusta
 */

export async function getGestaoTempoResult(userUid: string, email?: string) {
  const db = getAdminDb();
  const matricula = await resolveMatricula(userUid, email);
  if (!matricula) return null;

  const resPath = `User/${matricula}/results/gestao_tempo`;
  const resultSnap = await db.doc(resPath).get();
  console.log(`🔍 [GetResults:GestaoTempo] Lendo de ${resPath} | Existe: ${resultSnap.exists}`);
  return resultSnap.exists ? resultSnap.data() : null;
}

export async function getPreferenciasAprendizadoResult(userUid: string, email?: string) {
  const db = getAdminDb();
  const matricula = await resolveMatricula(userUid, email);
  if (!matricula) return null;

  const resPath = `User/${matricula}/results/preferencias_aprendizado`;
  const resultSnap = await db.doc(resPath).get();
  console.log(`🔍 [GetResults:Aprendizado] Lendo de ${resPath} | Existe: ${resultSnap.exists}`);
  return resultSnap.exists ? resultSnap.data() : null;
}

export async function getPreferenciasReconhecimentoResult(userUid: string, email?: string) {
  const db = getAdminDb();
  const matricula = await resolveMatricula(userUid, email);
  if (!matricula) return null;

  const resPath = `User/${matricula}/results/preferencias_reconhecimento`;
  const resultSnap = await db.doc(resPath).get();
  console.log(`🔍 [GetResults:Reconhecimento] Lendo de ${resPath} | Existe: ${resultSnap.exists}`);
  return resultSnap.exists ? resultSnap.data() : null;
}

export async function getPreAnaliseComportamentalResult(userUid: string, email?: string) {
  const db = getAdminDb();
  const matricula = await resolveMatricula(userUid, email);
  if (!matricula) return null;

  const resPath = `User/${matricula}/results/pre_analise_comportamental`;
  const resultSnap = await db.doc(resPath).get();
  console.log(`🔍 [GetResults:PreAnalise] Lendo de ${resPath} | Existe: ${resultSnap.exists}`);
  return resultSnap.exists ? resultSnap.data() : null;
}




