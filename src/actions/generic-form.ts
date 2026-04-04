"use server";

import { getAdminDb } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";
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
 * Aderente à Forms_Global e Soberania de Dados (Server-Authoritative) 🛡️.
 */
export async function submitGenericForm(config: FormConfig, response: FormResponse, userUid: string) {
  try {
    checkKeySignature();
    const db = getAdminDb();

    // 1. Obter Matrícula do Usuário (Lookup no _AuthMap Admin)
    const authMapRef = db.doc(`_AuthMap/${userUid}`);
    const authMapSnap = await authMapRef.get();
    const matricula = authMapSnap.exists ? authMapSnap.data()?.matricula : `BP-ANON-${new Date().getTime()}`;

    // 2. Gravar no Firestore (Persistência Hierárquica Oficial 🛡️)
    // Registro Operacional conforme Forms_Global
    const operationalRef = db.doc(`User/${matricula}/Forms/${config.id}`);

    const recordPayload: FormRecord = {
      formId: config.id,
      matricula,
      userUid,
      mode: "submitted",
      status: "submitted",
      data: response,
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      workflow: config.workflow
    };

    // Salvamento Operacional Direto (Soberania Admin)
    await operationalRef.set(recordPayload, { merge: true });

    // 3. Sincronização Google Drive / Sheets (Resiliência: Operação Secundária 🛰️)
    try {
      const drive = await getDriveClient();
      const sheets = await getSheetsClient();
      
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
      console.log(`✅ [Generic Form] Sincronização Sheets Concluída: ${matricula}`);
    } catch (driveErr) {
      // Falha no Drive/Sheets não deve impedir o usuário de ver a confirmação, 
      // pois o dado operacional JÁ ESTÁ SALVO no Firestore (Admin).
      console.error(`⚠️ [Generic Form] Erro na Sincronização Drive (Ignorado):`, driveErr);
    }

    console.log(`✅ [Generic Form] Persistência Hierárquica Concluída: ${config.id} - ${matricula}`);
    return { success: true, matricula };
  } catch (err: unknown) {
    const error = err as Error;
    console.error(`❌ Erro [submitGenericForm] para ${config.id}:`, error);
    throw new Error(error.message || "Falha na submissão do formulário.");
  }
}
