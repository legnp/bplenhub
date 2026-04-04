"use server";

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getDriveClient, getSheetsClient } from "@/lib/google-auth";
import { serverEnv } from "@/env";
import { FormConfig, FormResponse, FormRecord } from "@/types/forms";
import { 
  checkKeySignature, 
  ensureFolder, 
  createSpreadsheet, 
  syncDataToSheet 
} from "@/lib/drive-utils";

/**
 * BPlen HUB — Generic Form Submission (V2.0 📡)
 * Recebe respostas da Plataforma e as persiste de forma hierárquica e operacional.
 * Aderente à Forms_Global e Governança de Dados (Privacidade por Design).
 */
export async function submitGenericForm(config: FormConfig, response: FormResponse, userUid: string) {
  try {
    checkKeySignature();

    // 1. Obter Matrícula do Usuário (Lookup no _AuthMap)
    const authMapRef = doc(db, "_AuthMap", userUid);
    const authMapSnap = await getDoc(authMapRef);
    const matricula = authMapSnap.exists() ? authMapSnap.data().matricula : `BP-ANON-${new Date().getTime()}`;

    // 2. Gravar no Firestore (Persistência Hierárquica Oficial 🛡️)
    // Registro Operacional conforme Forms_Global
    const operationalRef = doc(db, "User", matricula, "Forms", config.id);

    const recordPayload: FormRecord = {
      formId: config.id,
      matricula,
      userUid,
      mode: "submitted", // No envio inicial
      status: "submitted",
      data: response,
      submittedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      workflow: config.workflow
    };

    // Salvamento Operacional Direto
    await setDoc(operationalRef, recordPayload, { merge: true });

    // 3. Sincronização Google Drive / Sheets
    const drive = await getDriveClient();
    const sheets = await getSheetsClient();
    
    // Raiz de Segurança
    const baseFolderId = serverEnv.GOOGLE_DRIVE_USUARIOS_ID; 

    // A. Identificar se é B2C (PF) ou B2B (PJ) pela matrícula
    const isPJ = matricula.includes("-PJ-");
    const subFolderName = isPJ ? "2.3.B2B" : "2.2.B2C"; 

    // B. Garantir Estrutura de Pastas (Auto-Healing)
    const categoryFolderId = await ensureFolder(drive, baseFolderId, subFolderName);
    const userFolderId = await ensureFolder(drive, categoryFolderId, matricula);
    const themeFolderId = await ensureFolder(drive, userFolderId, config.driveFolder || config.id);

    // C. Criar/Preparar Planilha
    const fileName = `${config.sheetNamePrefix || config.id} - ${matricula}`;
    const spreadsheetId = await createSpreadsheet(drive, themeFolderId, fileName);

    // D. Formatar Dados para Sheets
    const headers = ["Timestamp", "Formulário", "Matrícula", ...Object.keys(response)];
    const rowData = [
      new Date().toLocaleString("pt-BR"),
      config.id,
      matricula,
      ...Object.values(response).map(v => Array.isArray(v) ? v.join(", ") : v)
    ];

    await syncDataToSheet(sheets, spreadsheetId, headers, rowData);

    console.log(`✅ [Generic Form] Persistência Hierárquica Concluída: ${config.id} - ${matricula}`);
    return { success: true, matricula };
  } catch (err: unknown) {
    const error = err as Error;
    console.error(`❌ Erro [submitGenericForm] para ${config.id}:`, error);
    throw new Error(error.message || "Falha na submissão do formulário.");
  }
}
