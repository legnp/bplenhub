"use server";

import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getDriveClient, getSheetsClient } from "@/lib/google-auth";
import { serverEnv } from "@/env";
import { WelcomeSurveyData } from "@/types/survey";
import { getNextUserSequence } from "@/lib/transaction-utils";
import { 
  checkKeySignature, 
  ensureFolder, 
  createSpreadsheet, 
  syncDataToSheet 
} from "@/lib/drive-utils";

import { submitSurvey } from "./submit-survey";
import { welcomeSurveyConfig } from "@/config/surveys/welcome";

/**
 * BPlen HUB — Welcome Survey Action (Institucional 🧬)
 * Gerencia a matrícula BPlen, gravação no Firestore conforme Survey_Global e sincronização Drive/Sheets.
 */
export async function submitWelcomeSurvey(responses: Record<string, string | string[]>, authData: { uid: string, email: string, name: string }) {
  try {
    // 1. Gerar Matrícula BPlen (Blindagem por Transação 🛡️)
    const count = await getNextUserSequence();

    const seq = count.toString().padStart(3, "0");
    const userTypeRaw = responses.userType as string;
    const type = userTypeRaw.includes("empresa") || userTypeRaw.includes("PJ") ? "PJ" : "PF";

    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const aammdd = `${yy}${mm}${dd}`;

    const matricula = `BP-${seq}-${type}-${aammdd}`;

    // 2. Persistência Institucional (Survey_Global 🧬)
    // Isso já grava em User/{matricula}/Surveys/welcome_survey
    await submitSurvey(welcomeSurveyConfig, responses as any, authData.uid);

    // 3. Atualizar Perfil Raiz do Usuário
    const userRef = doc(db, "User", matricula);
    await setDoc(userRef, {
      uid: authData.uid,
      email: authData.email,
      Authentication_Name: authData.name,
      User_Nickname: responses.nickname,
      User_Type: type,
      createdAt: serverTimestamp(),
      hasCompletedWelcome: true,
      lastUpdated: serverTimestamp(),
      // Mantemos uma cópia legacy por compatibilidade imediata se necessário, 
      // mas o "Source of Truth" de pesquisa agora é Surveys/welcome_survey
      User_Welcome: {
        ...responses,
        matricula,
        submittedAt: serverTimestamp()
      }
    }, { merge: true });

    // 4. Mapear UID -> Matrícula
    const uidMapRef = doc(db, "_AuthMap", authData.uid);
    await setDoc(uidMapRef, { matricula });

    // 5. Sincronização Google Drive / Sheets
    await syncToDrive(matricula, authData, responses);

    return { success: true, matricula };
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Erro na Welcome Action Institucional:", error);
    throw new Error(error.message || "Falha ao processar cadastro inicial.");
  }
}

/**
 * Sincronização Google Drive / Sheets (Orquestrada 📡)
 */
async function syncToDrive(matricula: string, authData: { email: string, uid: string }, responses: any) {
  try {
    checkKeySignature();
    
    const drive = await getDriveClient();
    const sheets = await getSheetsClient();
    const baseFolderId = serverEnv.GOOGLE_DRIVE_USUARIOS_ID;

    // A. Estrutura de Pastas (Auto-Healing)
    const b2cFolderId = await ensureFolder(drive, baseFolderId, "2.2.B2C");
    const userFolderId = await ensureFolder(drive, b2cFolderId, matricula);
    
    // B. Planilha de Dados
    const spreadsheetId = await createSpreadsheet(
      drive, 
      userFolderId, 
      `User_Welcome - ${matricula}`
    );

    const headers = [
      "Timestamp", "Matrícula", "UID", "Email", 
      "Nickname", "Interesses", "Demanda", "Origem"
    ];
    
    const rowData = [
      new Date().toLocaleString("pt-BR"),
      matricula,
      authData.uid,
      authData.email,
      responses.nickname,
      Array.isArray(responses.topics) ? responses.topics.join(", ") : responses.topics,
      responses.demand,
      responses.origin
    ];

    await syncDataToSheet(sheets, spreadsheetId, headers, rowData);

    console.log(`✅ [Welcome Survey] Drive Sincronizado: ${matricula}`);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Erro na Sincronização Global do Drive:", error);
    throw error;
  }
}
