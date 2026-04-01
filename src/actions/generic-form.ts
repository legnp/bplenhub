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

    const drive = await getDriveClient();
    const sheets = await getSheetsClient();
    
    // 3. Raiz de Segurança (Sempre Users para a Opção A)
    const baseFolderId = serverEnv.GOOGLE_DRIVE_USUARIOS_ID; 

    // A. Identificar se é B2C (PF) ou B2B (PJ) pela matrícula
    const isPJ = matricula.includes("-PJ-");
    const subFolderName = isPJ ? "2.3.B2B" : "2.2.B2C"; // TODO: Validar nome da pasta B2B futuramente

    // B. Garantir Pasta de Categoria (Auto-Healing)
    const categoryFolderId = await ensureFolder(drive, baseFolderId, subFolderName);

    // C. Encontrar ou Criar Pasta Pessoal do Usuário
    const userFolderId = await ensureFolder(drive, categoryFolderId, matricula);

    // D. Garantir Pasta Temática DENTRO do Usuário (ex: 'Showroom')
    const themeFolderId = await ensureFolder(drive, userFolderId, config.driveFolder || config.id);

    // E. Criar/Preparar Planilha
    const fileName = `${config.sheetNamePrefix || config.id} - ${matricula}`;
    const spreadsheetId = await createSpreadsheet(drive, themeFolderId, fileName);

    // F. Formatar Dados para Sheets
    const headers = ["Timestamp", "Formulário", "Matrícula", ...Object.keys(response)];
    const rowData = [
      new Date().toLocaleString("pt-BR"),
      config.id,
      matricula,
      ...Object.values(response).map(v => Array.isArray(v) ? v.join(", ") : v)
    ];

    await syncDataToSheet(sheets, spreadsheetId, headers, rowData);

    console.log(`✅ [Generic Form] Submissão Concluída: ${config.id} - ${matricula}`);
    return { success: true, matricula };
  } catch (err: unknown) {
    const error = err as Error;
    console.error(`❌ Erro [submitGenericForm] para ${config.id}:`, error);
    throw new Error(error.message || "Falha na submissão do formulário.");
  }
}
