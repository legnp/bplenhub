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

/**
 * BPlen HUB — Welcome Survey Action (Versão Final Refatorada 🛡️)
 * Gerencia a matrícula BPlen, gravação no Firestore e sincronização Drive/Sheets.
 */

export async function submitWelcomeSurvey(data: WelcomeSurveyData) {
  try {
    // 1. Gerar Matrícula BPlen (Blindagem por Transação 🛡️)
    const count = await getNextUserSequence();

    const seq = count.toString().padStart(3, "0");
    const type = data.User_Type;

    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const aammdd = `${yy}${mm}${dd}`;

    const matricula = `BP-${seq}-${type}-${aammdd}`;

    // 2. Gravar no Firestore (Ecossistema de Usuários)
    const userRef = doc(db, "User", matricula);
    await setDoc(userRef, {
      uid: data.uid,
      email: data.email,
      Authentication_Name: data.Authentication_Name,
      createdAt: serverTimestamp(),
      hasCompletedWelcome: true,
      lastUpdated: serverTimestamp(),
      User_Welcome: {
        ...data,
        matricula,
        submittedAt: serverTimestamp()
      }
    }, { merge: true });

    const uidMapRef = doc(db, "_AuthMap", data.uid);
    await setDoc(uidMapRef, { matricula });

    // 3. Sincronização Google Drive / Sheets (Via Drive Utils)
    await syncToDrive(matricula, data);

    return { success: true, matricula };
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Erro na Welcome Action:", error);
    throw new Error(error.message || "Falha ao processar cadastro inicial.");
  }
}

/**
 * Sincronização Google Drive / Sheets (Orquestrada 📡)
 */
async function syncToDrive(matricula: string, data: WelcomeSurveyData) {
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
      "Timestamp", "Matrícula", "UID", "Email", "Nome Autenticação", 
      "Como devemos te chamar?", "Tipo", "Temas Buscados", 
      "Demanda", "Origem"
    ];
    
    const rowData = [
      new Date().toLocaleString("pt-BR"),
      matricula,
      data.uid,
      data.email,
      data.Authentication_Name,
      data.User_Nickname,
      data.User_Type,
      data.Customer_FirstTopics.join(", "),
      data.Customer_FirstDemand,
      data.Customer_Origin
    ];

    await syncDataToSheet(sheets, spreadsheetId, headers, rowData);

    console.log(`✅ [Welcome Survey] Drive Sincronizado: ${matricula}`);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Erro na Sincronização Global do Drive:", error);
    throw error;
  }
}
