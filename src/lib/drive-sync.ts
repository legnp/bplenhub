import { getDriveClient, getSheetsClient } from "@/lib/google-auth";
import { serverEnv } from "@/env";
import { ensureFolder, createSpreadsheet, syncDataToSheet } from "@/lib/drive-utils";

/**
 * BPlen HUB — Drive Sync Service (🏁)
 * Coordena a hierarquia de pastas e sincronização de dados no Google Drive/Sheets.
 * Centraliza a inteligência de onde salvar cada dado baseada no tipo de usuário e matrícula.
 */

interface SurveySyncConfig {
  matricula: string;
  surveyTitle: string;
  headers: string[];
  rowData: (string | number | boolean | null)[];
}

/**
 * Sincroniza dados de uma pesquisa para a pasta do usuário no Google Drive.
 * Padrão: 2.x (B2B/B2C) -> {Matricula} -> 1.Surveys -> {SurveyTitle}.
 * 
 * @param config Configuração da pesquisa e dados a sincronizar.
 * @returns O ID da planilha criada ou atualizada.
 */
export async function syncSurveyToUserDrive(config: SurveySyncConfig) {
  const { matricula, surveyTitle, headers, rowData } = config;

  try {
    const drive = await getDriveClient();
    const sheets = await getSheetsClient();
    const baseFolderId = serverEnv.GOOGLE_DRIVE_USUARIOS_ID;

    // 1. Resolver categoria (B2B vs B2C)
    const isPJ = matricula.includes("-PJ-");
    const categoryName = isPJ ? "2.3.B2B" : "2.2.B2C";

    // 2. Garantir hierarquia (Cascata 🛰️)
    const catFolderId = await ensureFolder(drive, baseFolderId, categoryName);
    const userFolderId = await ensureFolder(drive, catFolderId, matricula);
    const surveyFolderId = await ensureFolder(drive, userFolderId, "1.Surveys");

    // 3. Criar/Atualizar Planilha
    const { id: spreadsheetId } = await createSpreadsheet(drive, surveyFolderId, `${surveyTitle} - ${matricula}`);

    // 4. Sincronizar Dados
    await syncDataToSheet(sheets, spreadsheetId, headers, rowData);

    console.log(`✅ [DriveSync] Dados sincronizados: ${surveyTitle} -> ${matricula}`);
    return spreadsheetId;

  } catch (err) {
    // Fail-soft: Logs erro mas não derruba a execução principal das server actions
    console.error(`❌ [DriveSync] Falha crítica na sincronização (${surveyTitle}):`, err);
    throw err;
  }
}

/**
 * Helper para obter a pasta raiz de um usuário.
 */
export async function getUserRootFolder(matricula: string) {
  const drive = await getDriveClient();
  const baseFolderId = serverEnv.GOOGLE_DRIVE_USUARIOS_ID;
  const isPJ = matricula.includes("-PJ-");
  const categoryName = isPJ ? "2.3.B2B" : "2.2.B2C";

  const catFolderId = await ensureFolder(drive, baseFolderId, categoryName);
  return await ensureFolder(drive, catFolderId, matricula);
}
