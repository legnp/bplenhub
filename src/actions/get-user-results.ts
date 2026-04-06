"use server";

import { getAdminDb } from "@/lib/firebase-admin";

/**
 * getGestaoTempoResult
 * Busca o resultado da pesquisa de gestão do tempo para o usuário logado.
 */
export async function getGestaoTempoResult(userUid: string) {
  const db = getAdminDb();
  
  // 1. Resolver Matrícula
  const authMapSnap = await db.doc(`_AuthMap/${userUid}`).get();
  if (!authMapSnap.exists) return null;
  
  const matricula = authMapSnap.data()?.matricula;
  if (!matricula) return null;

  // 2. Buscar Resultado
  const resultSnap = await db.doc(`User/${matricula}/results/gestao_tempo`).get();
  if (!resultSnap.exists) return null;
  
  return resultSnap.data();
}

/**
 * getPreferenciasAprendizadoResult
 * Busca o resultado da pesquisa de preferências de aprendizado (VACD).
 */
export async function getPreferenciasAprendizadoResult(userUid: string) {
  const db = getAdminDb();
  
  const authMapSnap = await db.doc(`_AuthMap/${userUid}`).get();
  if (!authMapSnap.exists) return null;
  
  const matricula = authMapSnap.data()?.matricula;
  if (!matricula) return null;

  const resultSnap = await db.doc(`User/${matricula}/results/preferencias_aprendizado`).get();
  if (!resultSnap.exists) return null;
  
  return resultSnap.data();
}

/**
 * getPreferenciasReconhecimentoResult
 * Busca o resultado da pesquisa de preferências de reconhecimento (Linguagens).
 */
export async function getPreferenciasReconhecimentoResult(userUid: string) {
  const db = getAdminDb();
  
  const authMapSnap = await db.doc(`_AuthMap/${userUid}`).get();
  if (!authMapSnap.exists) return null;
  
  const matricula = authMapSnap.data()?.matricula;
  if (!matricula) return null;

  const resultSnap = await db.doc(`User/${matricula}/results/preferencias_reconhecimento`).get();
  if (!resultSnap.exists) return null;
  
  return resultSnap.data();
}

/**
 * getPreAnaliseComportamentalResult
 */
export async function getPreAnaliseComportamentalResult(userUid: string) {
  const db = getAdminDb();
  const authMapSnap = await db.doc(`_AuthMap/${userUid}`).get();
  if (!authMapSnap.exists) return null;
  const matricula = authMapSnap.data()?.matricula;
  if (!matricula) return null;
  const resultSnap = await db.doc(`User/${matricula}/results/pre_analise_comportamental`).get();
  if (!resultSnap.exists) return null;
  return resultSnap.data();
}


