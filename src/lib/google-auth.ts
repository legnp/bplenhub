import { google } from "googleapis";
import { serverEnv } from "@/env";

/**
 * BPlen HUB — Google Auth (Service Account)
 * Central de autenticação para APIs do Google (Calendar, Drive, Sheets).
 * Utiliza a conta de serviço configurada no Firebase Admin.
 */

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/spreadsheets",
];

/**
 * Retorna um cliente autenticado para uso nas APIs do Google.
 */
export async function getGoogleAuthClient() {
  const auth = new google.auth.JWT({
    email: serverEnv.FIREBASE_CLIENT_EMAIL,
    key: serverEnv.FIREBASE_PRIVATE_KEY,
    scopes: SCOPES,
  });

  return auth;
}

/** Instância do Google Calendar */
export async function getCalendarClient() {
  const auth = await getGoogleAuthClient();
  return google.calendar({ version: "v3", auth });
}

/** Instância do Google Drive */
export async function getDriveClient() {
  const auth = await getGoogleAuthClient();
  return google.drive({ version: "v3", auth });
}

/** Instância do Google Sheets */
export async function getSheetsClient() {
  const auth = await getGoogleAuthClient();
  return google.sheets({ version: "v4", auth });
}
