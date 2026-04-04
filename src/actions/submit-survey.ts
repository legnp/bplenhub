"use server";

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SurveyConfig, SurveyResponse, SurveyValue } from "@/types/survey";

/**
 * BPlen HUB — Submit Institutional Survey (📡)
 * Persiste as respostas de uma survey de forma hierárquica por usuário.
 * Aderente à Survey_Global.
 */
export async function submitSurvey(config: SurveyConfig, responses: Record<string, SurveyValue>, userUid: string) {
  try {
    // 1. Obter Matrícula do Usuário (Lookup no _AuthMap)
    const authMapRef = doc(db, "_AuthMap", userUid);
    const authMapSnap = await getDoc(authMapRef);
    const matricula = authMapSnap.exists() ? authMapSnap.data().matricula : `BP-ANON-${new Date().getTime()}`;

    // 2. Preparar Payload de Resposta (SurveyResponse)
    // Localização: User/{matricula}/Surveys/{surveyId}
    const surveyRef = doc(db, "User", matricula, "Surveys", config.id);

    const payload: SurveyResponse = {
      surveyId: config.id,
      matricula,
      status: "completed",
      data: responses,
      submittedAt: serverTimestamp(),
      metadata: config.analytics
    };

    // 3. Persistir Record conforme Survey_Global
    await setDoc(surveyRef, payload, { merge: true });

    console.log(`✅ [SurveyEngine] Resposta enviada com sucesso: ${config.id} - ${matricula}`);
    return { success: true, matricula };
  } catch (err: unknown) {
    const error = err as Error;
    console.error(`❌ Erro [submitSurvey] para ${config.id}:`, error);
    throw new Error(error.message || "Falha ao enviar respostas da pesquisa.");
  }
}
