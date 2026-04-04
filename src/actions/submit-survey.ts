"use server";

import { getAdminDb } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";
import { SurveyConfig, SurveyResponse, SurveyValue } from "@/types/survey";

/**
 * BPlen HUB — Submit Institutional Survey (📡)
 * Persiste as respostas de uma survey de forma hierárquica por usuário.
 * Aderente à Survey_Global e Soberania de Dados (Server-Authoritative).
 */
export async function submitSurvey(config: SurveyConfig, responses: Record<string, SurveyValue>, userUid: string) {
  try {
    const db = getAdminDb();

    // 1. Obter Matrícula do Usuário (Lookup no _AuthMap)
    const authMapRef = db.doc(`_AuthMap/${userUid}`);
    const authMapSnap = await authMapRef.get();
    const matricula = authMapSnap.exists ? authMapSnap.data()?.matricula : `BP-ANON-${new Date().getTime()}`;

    // 2. Preparar Payload de Resposta (SurveyResponse)
    // Localização: User/{matricula}/Surveys/{surveyId}
    const surveyRef = db.doc(`User/${matricula}/Surveys/${config.id}`);

    const payload: SurveyResponse = {
      surveyId: config.id,
      matricula,
      status: "completed",
      data: responses,
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      metadata: config.analytics
    };

    // 3. Persistir Record conforme Survey_Global (Escrita Soberana 🛡️)
    await surveyRef.set(payload, { merge: true });

    console.log(`✅ [SurveyEngine Admin] Resposta enviada com sucesso: ${config.id} - ${matricula}`);
    return { success: true, matricula };
  } catch (err: unknown) {
    const error = err as Error;
    console.error(`❌ Erro [submitSurvey] para ${config.id}:`, error);
    throw new Error(error.message || "Falha ao enviar respostas da pesquisa.");
  }
}
