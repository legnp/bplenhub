"use server";

import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";
import { SurveyValue } from "@/types/survey";

/**
 * BPlen HUB — Survey Effects Manager (🧠)
 * Centraliza a lógica de negócio e "efeitos colaterais" de todas as pesquisas.
 * Garante que o salvamento principal seja genérico e extensível.
 */

/**
 * Resolve ou Gera a Matrícula do usuário.
 * Se for um Welcome Survey de um novo usuário, gera a matrícula de forma atômica.
 */
export async function resolveUserIdentity(surveyId: string, responses: Record<string, SurveyValue>, userUid: string): Promise<string> {
  const db: admin.firestore.Firestore = getAdminDb();
  const authMapRef = db.doc(`_AuthMap/${userUid}`);
  const authMapSnap = await authMapRef.get();

  if (authMapSnap.exists) {
    return authMapSnap.data()?.matricula;
  }

  // Se não existe mapa e é a Welcome Survey, geramos agora 🛡️
  if (surveyId === "welcome_survey") {
    return await db.runTransaction(async (transaction) => {
      const counterRef = db.doc("_internal/counters/user/global");
      const counterSnap = await transaction.get(counterRef);
      
      let count = 1;
      if (counterSnap.exists) {
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
      transaction.set(authMapRef, { matricula: newMat, createdAt: admin.firestore.FieldValue.serverTimestamp() });
      
      return newMat;
    });
  }

  // Fallback para anônimos/rastreio
  return `BP-ANON-${new Date().getTime()}`;
}

/**
 * Processa todos os efeitos colaterais após o salvamento da pesquisa.
 * Bloqueante por design conforme solicitado (o usuário deve esperar).
 */
export async function handleSurveySideEffects(surveyId: string, responses: Record<string, SurveyValue>, matricula: string, userUid: string) {
  const db = getAdminDb();

  // EFEITOS: Welcome Survey 🧬
  if (surveyId === "welcome_survey") {
    console.log(`📡 [Effects] Iniciando processamento pós-onboarding: ${matricula}`);
    
    const userRef = db.doc(`User/${matricula}`);
    const nickname = (responses.nickname as string) || "";
    const userTypeRaw = (responses.userType as string) || "member";
    const userType = userTypeRaw.includes("empresa") || userTypeRaw.includes("PJ") ? "PJ" : "PF";

    // 1. Sincronizar Identidade (Auth -> Root Profile) 🛡️
    let authName = "Membro BPlen";
    let authEmail = "";
    try {
      const authAdmin = getAdminAuth();
      const userAuth = await authAdmin.getUser(userUid);
      authName = userAuth.displayName || userAuth.email?.split("@")[0] || authName;
      authEmail = userAuth.email || "";
    } catch (authErr) {
      console.warn("⚠️ [Effects] Falha ao buscar metadados do Auth:", authErr);
    }

    await userRef.set({
      hasCompletedWelcome: true,
      Authentication_Name: authName,
      email: authEmail,
      User_Nickname: nickname || null,
      User_Type: userType,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // 2. Sincronização Google Drive / Sheets 🛰️
    try {
      const { getDriveClient, getSheetsClient } = await import("@/lib/google-auth");
      const { serverEnv } = await import("@/env");
      const { ensureFolder, createSpreadsheet, syncDataToSheet } = await import("@/lib/drive-utils");

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
    } catch (driveErr) {
      // Nota: Como o usuário deve esperar, aqui o erro poderia travar se quiséssemos, 
      // mas mantemos o log amigável para não impedir o onboarding se o Google cair.
      console.error(`❌ [Effects] Erro crítico na Sincronização Drive:`, driveErr);
    }

    console.log(`✨ [Effects] Fluxo de Onboarding finalizado: ${matricula}`);
  }

  // EFEITOS: Check-in de Carreira 📊
  if (surveyId === "check_in_v1") {
    console.log(`📡 [Effects] Iniciando processamento Check-in: ${matricula}`);
    
    try {
      const { getDriveClient, getSheetsClient } = await import("@/lib/google-auth");
      const { serverEnv } = await import("@/env");
      const { ensureFolder, createSpreadsheet, syncDataToSheet } = await import("@/lib/drive-utils");

      const drive = await getDriveClient();
      const sheets = await getSheetsClient();
      const baseFolderId = serverEnv.GOOGLE_DRIVE_USUARIOS_ID;

      const isPJ = matricula.includes("-PJ-");
      const catFolderId = await ensureFolder(drive, baseFolderId, isPJ ? "2.3.B2B" : "2.2.B2C");
      const userFolderId = await ensureFolder(drive, catFolderId, matricula);
      
      // Pasta específica para Surveys/Checkins dentro do usuário
      const surveyFolderId = await ensureFolder(drive, userFolderId, "1.Surveys");
      const spreadsheetId = await createSpreadsheet(drive, surveyFolderId, `Check-in - ${matricula}`);

      const headers = ["Timestamp", "Matrícula", "Nicho", "Desafios", "Objetivos", "Regime"];
      const rowData: (string | number | boolean | null)[] = [
        new Date().toLocaleString("pt-BR"),
        matricula,
        String((responses.nicho_cascata as any)?.primary || "N/A"),
        Array.isArray(responses.desafios_multi) ? responses.desafios_multi.join(", ") : "N/A",
        String(responses.objetivos_timeline || "N/A"),
        String(responses.regime_choice || "N/A")
      ];

      await syncDataToSheet(sheets, spreadsheetId, headers, rowData);
      console.log(`✅ [Effects] Check-in sincronizado com Drive: ${matricula}`);
    } catch (driveErr) {
      console.error(`❌ [Effects] Erro na sincronização Drive do Check-in:`, driveErr);
    }
  }
}
