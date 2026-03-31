import { drive_v3, google, sheets_v4 } from "googleapis";
import { getDriveClient, getSheetsClient } from "./google-auth";
import { serverEnv } from "@/env";

/**
 * BPlen HUB — Drive Utilities (Espinha Dorsal 🛡️)
 * Centralização de operações Google Workspace para escala e resiliência.
 */

// ──────────────────────────────
// 1. Diagnóstico de Chave Privada
// ──────────────────────────────
export function checkKeySignature() {
  const key = serverEnv.FIREBASE_PRIVATE_KEY;
  if (!key.includes("-----BEGIN PRIVATE KEY-----") || !key.includes("-----END PRIVATE KEY-----")) {
    throw new Error("Chave Privada malformada detectada. Verifique as variáveis de ambiente.");
  }
}

// ──────────────────────────────
// 2. Navegador de Pastas Inteligente (Auto-Healing)
// ──────────────────────────────
/**
 * Garante que uma pasta existe. Se não existir, ela será criada.
 */
export async function ensureFolder(
  drive: drive_v3.Drive,
  parentFolderId: string,
  folderName: string
): Promise<string> {
  const listFolders = await drive.files.list({
    q: `'${parentFolderId}' in parents and name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id)",
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  if (listFolders.data.files && listFolders.data.files.length > 0) {
    return listFolders.data.files[0].id!;
  }

  const createFolder = await drive.files.create({
    supportsAllDrives: true,
    requestBody: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentFolderId],
    },
    fields: "id",
  });

  if (!createFolder.data.id) throw new Error(`Falha ao criar pasta: ${folderName}`);
  return createFolder.data.id;
}

// ──────────────────────────────
// 3. Gerenciador de Planilhas
// ──────────────────────────────
/**
 * Cria uma planilha do Google Sheets dentro de uma pasta específica.
 */
export async function createSpreadsheet(
  drive: drive_v3.Drive,
  parentFolderId: string,
  fileName: string
): Promise<string> {
  const sheetFile = await drive.files.create({
    supportsAllDrives: true,
    requestBody: {
      name: fileName,
      mimeType: "application/vnd.google-apps.spreadsheet",
      parents: [parentFolderId],
    },
    fields: "id",
  });

  if (!sheetFile.data.id) throw new Error(`Falha ao criar planilha: ${fileName}`);
  return sheetFile.data.id;
}

/**
 * Grava ou Atualiza dados na planilha.
 */
export async function syncDataToSheet(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  headers: string[],
  rowData: any[]
) {
  // Identificar o nome da aba (Sheet1, Página1, etc)
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetTitle = spreadsheet.data.sheets?.[0].properties?.title || "Sheet1";

  // Se o intervalo for A1:?, ele cria cabeçalho e insere dados
  // Aqui usamos um range flexível dependendo do número de colunas
  const lastColLetter = String.fromCharCode(64 + headers.length); // Ex: A, B, C...

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetTitle}!A1:${lastColLetter}2`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [headers, rowData],
    },
  });
}
