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
    const db: admin.firestore.Firestore = getAdminDb();
    
    // 1. Resolver Matrícula e Identidade (Soberania de Acesso via Effects 🧬)
    const { resolveUserIdentity, handleSurveySideEffects } = await import("./survey-effects");
    const matricula = await resolveUserIdentity(config.id, responses, userUid);

    // 2. Preparar Payload de Resposta (SurveyResponse)
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

    // 4. Disparar Efeitos Colaterais (Business Logic 🧠)
    // O usuário espera aqui conforme solicitado (await) para garantir integridade.
    await handleSurveySideEffects(config.id, responses, matricula, userUid);

    console.log(`✅ [SurveyEngine Admin] Resposta enviada com sucesso: ${config.id} - ${matricula}`);
    return { success: true, matricula };
  } catch (err: unknown) {
    const error = err as Error;
    console.error(`❌ Erro [submitSurvey] para ${config.id}:`, error);
    throw new Error(error.message || "Falha ao processar pesquisa.");
  }
}
