"use server";

import { getAdminDb } from "@/lib/firebase-admin";
import { getDriveClient, getSheetsClient } from "@/lib/google-auth";
import { serverEnv } from "@/env";
import { FormConfig, FormResponse } from "@/types/forms";
import { ensureFolder, createSpreadsheet, syncDataToSheet } from "@/lib/drive-utils";

/**
 * BPlen HUB — Form Effects Manager (📡)
 * Centraliza efeitos colaterais de formulários genéricos.
 */

export async function handleFormSideEffects(config: FormConfig, response: FormResponse, matricula: string) {
  try {
    console.log(`📡 [Form Effects] Iniciando sincronização Drive: ${matricula} - ${config.id}`);
    
    const drive = await getDriveClient();
    const sheets = await getSheetsClient();
    const baseFolderId = serverEnv.GOOGLE_DRIVE_USUARIOS_ID;

    // A. Lógica de Negócio: Identificar Segmento (B2B/B2C)
    const isPJ = matricula.includes("-PJ-");
    const subFolderName = isPJ ? "2.3.B2B" : "2.2.B2C";

    // B. Garantir Estrutura de Pastas
    const categoryFolderId = await ensureFolder(drive, baseFolderId, subFolderName);
    const userFolderId = await ensureFolder(drive, categoryFolderId, matricula);
    const themeFolderId = await ensureFolder(drive, userFolderId, config.driveFolder || config.id);

    // C. Criar/Preparar Planilha
    const fileName = `${config.sheetNamePrefix || config.id} - ${matricula}`;
    const spreadsheetId = await createSpreadsheet(drive, themeFolderId, fileName);

    // D. Formatar Dados para Sheets
    const headers = ["Timestamp", "Formulário", "Matrícula", ...Object.keys(response)];
    const rowData: (string | number | boolean | null)[] = [
      new Date().toLocaleString("pt-BR"),
      config.id,
      matricula,
      ...Object.values(response).map(v => {
        if (Array.isArray(v)) return v.join(", ");
        return v ?? null;
      })
    ];

    await syncDataToSheet(sheets, spreadsheetId, headers, rowData);
    console.log(`✅ [Form Effects] Sincronização Sheets Concluída: ${matricula}`);

  } catch (driveErr) {
    console.error(`⚠️ [Form Effects] Erro na Sincronização Drive (Ignorado):`, driveErr);
  }
}
