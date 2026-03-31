"use server";

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getDriveClient, getSheetsClient } from "@/lib/google-auth";
import { serverEnv } from "@/env";
import { FormConfig, FormResponse } from "@/types/forms";
import { 
  checkKeySignature, 
  ensureFolder, 
  createSpreadsheet, 
  syncDataToSheet 
} from "@/lib/drive-utils";

/**
 * BPlen HUB — Generic Form Submission (Universal 📡)
 * Recebe respostas de qualquer formulário da Plataforma e sincroniza com o Drive/Sheets.
 */
export async function submitGenericForm(config: FormConfig, response: FormResponse, userUid: string) {
  try {
    checkKeySignature();

    // 1. Obter Matrícula do Usuário (Lookup no _AuthMap)
    const authMapRef = doc(db, "_AuthMap", userUid);
    const authMapSnap = await getDoc(authMapRef);
    const matricula = authMapSnap.exists() ? authMapSnap.data().matricula : `BP-ANON-${new Date().getTime()}`;

    // 2. Gravar no Firestore (Histórico de Submissões)
    const submissionRef = doc(db, "FormSubmissions", `${config.id}_${matricula}_${new Date().getTime()}`);
    await setDoc(submissionRef, {
      formId: config.id,
      matricula,
      userUid,
      data: response,
      submittedAt: serverTimestamp(),
    });

    // 3. Sincronização Google Drive
    const drive = await getDriveClient();
    const sheets = await getSheetsClient();
    
    // Raiz: Pasta definida na Config ou Pasta de Usuários como fallback
    const rootFolderId = serverEnv.GOOGLE_DRIVE_ROOT_ID; 

    // A. Garantir Pasta do Módulo (ex: 'Showroom', 'Pesquisas')
    const moduleFolderName = config.driveFolder || "General_Forms";
    const moduleFolderId = await ensureFolder(drive, rootFolderId, moduleFolderName);

    // B. Garantir Pasta do Usuário dentro do Módulo
    const userFolderId = await ensureFolder(drive, moduleFolderId, matricula);

    // C. Criar/Preparar Planilha
    const fileName = `${config.sheetNamePrefix || config.id} - ${matricula}`;
    const spreadsheetId = await createSpreadsheet(drive, userFolderId, fileName);

    // D. Formatar Dados para Sheets
    const headers = ["Timestamp", "ID Formulário", "Matrícula", ...Object.keys(response)];
    const rowData = [
      new Date().toLocaleString("pt-BR"),
      config.id,
      matricula,
      ...Object.values(response).map(v => Array.isArray(v) ? v.join(", ") : v)
    ];

    await syncDataToSheet(sheets, spreadsheetId, headers, rowData);

    console.log(`✅ [Generic Form] Submissão Concluída: ${config.id} - ${matricula}`);
    return { success: true, matricula };
  } catch (error: any) {
    console.error(`❌ Erro [submitGenericForm] para ${config.id}:`, error);
    throw new Error(error.message || "Falha na submissão do formulário.");
  }
}
