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
    
    // 1. Resolver Matrícula e Identidade (Soberania de Acesso 🧬)
    let matricula: string = "";
    const authMapRef = db.doc(`_AuthMap/${userUid}`);
    const authMapSnap = await authMapRef.get();

    if (authMapSnap.exists()) {
      matricula = authMapSnap.data()?.matricula;
    } else if (config.id === "welcome_survey") {
      // Geração Atômica de Matrícula para Novos Usuários 🛡️
      matricula = await db.runTransaction(async (transaction: admin.firestore.Transaction) => {
        const counterRef = db.doc("_internal/counters/user/global");
        const counterSnap = await transaction.get(counterRef);
        
        let count = 1;
        if (counterSnap.exists()) {
          count = (counterSnap.data()?.count || 0) + 1;
          transaction.update(counterRef, { count, lastUpdated: admin.firestore.FieldValue.serverTimestamp() });
        } else {
          transaction.set(counterRef, { count: 1, createdAt: admin.firestore.FieldValue.serverTimestamp() });
        }

        const seq = count.toString().padStart(3, "0");
        const userTypeRaw = (responses.userType as string) || "PF";
        const type = userTypeRaw.includes("empresa") || userTypeRaw.includes("PJ") ? "PJ" : "PF";
        
        const now = new Date();
        const aammdd = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
        
        const newMat = `BP-${seq}-${type}-${aammdd}`;
        
        // Criar o mapeamento de identidade imediatamente 🔗
        transaction.set(authMapRef, { matricula: newMat, createdAt: admin.firestore.FieldValue.serverTimestamp() });
        
        return newMat;
      });
    } else {
      matricula = `BP-ANON-${new Date().getTime()}`;
    }

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

    // 4. Efeitos Colaterais Automatizados e Sincronia 🧬
    if (config.id === "welcome_survey") {
      const userRef = db.doc(`User/${matricula}`);
      const nickname = (responses.nickname as string) || "";
      const userTypeRaw = (responses.userType as string) || "member";
      const userType = userTypeRaw.includes("empresa") || userTypeRaw.includes("PJ") ? "PJ" : "PF";

      // A. Atualizar Perfil Raiz do Usuário 👤
      await userRef.set({
        hasCompletedWelcome: true,
        User_Nickname: nickname || null,
        User_Type: userType,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // B. Sincronização Google Drive (Resiliência 🛰️)
      try {
        const { getDriveClient, getSheetsClient } = await import("@/lib/google-auth");
        const { serverEnv } = await import("@/env");
        const { checkKeySignature, ensureFolder, createSpreadsheet, syncDataToSheet } = await import("@/lib/drive-utils");

        const drive = await getDriveClient();
        const sheets = await getSheetsClient();
        const baseFolderId = serverEnv.GOOGLE_DRIVE_USUARIOS_ID;

        const catFolderId = await ensureFolder(drive, baseFolderId, userType === "PJ" ? "2.3.B2B" : "2.2.B2C");
        const userFolderId = await ensureFolder(drive, catFolderId, matricula);
        const spreadsheetId = await createSpreadsheet(drive, userFolderId, `User_Welcome - ${matricula}`);

        const headers = ["Timestamp", "Matrícula", "UID", "Nickname", "Interesses", "Origem"];
        const rowData: (string | number | boolean | null)[] = [
          new Date().toLocaleString("pt-BR"),
          matricula,
          userUid,
          nickname,
          Array.isArray(responses.topics) ? responses.topics.join(", ") : String(responses.topics || ""),
          String(responses.origin || "N/A")
        ];

        await syncDataToSheet(sheets, spreadsheetId, headers, rowData);
        console.log(`✅ [SurveyEngine Onboarding] Sincronização Drive Concluída: ${matricula}`);
      } catch (driveErr) {
        console.warn(`⚠️ [SurveyEngine Onboarding] Erro na Sincronização Drive (Ignorado):`, driveErr);
      }

      console.log(`✨ [SurveyEngine Onboarding] Fluxo Completo Finalizado: ${matricula}`);
    }

    console.log(`✅ [SurveyEngine Admin] Resposta enviada com sucesso: ${config.id} - ${matricula}`);
    return { success: true, matricula };
  } catch (err: unknown) {
    const error = err as Error;
    console.error(`❌ Erro [submitSurvey] para ${config.id}:`, error);
    throw new Error(error.message || "Falha ao processar pesquisa.");
  }
}
