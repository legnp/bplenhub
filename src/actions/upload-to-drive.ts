"use server";

import { getAdminAuth } from "@/lib/firebase-admin";
import { getDriveClient } from "@/lib/google-auth";
import { ensureFolder, uploadFileToDrive } from "@/lib/drive-utils";
import { serverEnv } from "@/env";
import { Readable } from "stream";

/**
 * BPlen HUB — Server Action: Upload Direto ao Google Drive 📡
 * Recebe o arquivo do cliente (Multipart) e realiza o bypass para o Workspace do Membro.
 * Substitui a necessidade de Firebase Storage, mantendo a soberania de dados no Drive.
 */
export async function uploadToUserDrive(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const matricula = formData.get("matricula") as string;
    const idToken = formData.get("idToken") as string;
    const type = formData.get("type") as string; // CV ou Portfolio

    if (!file || !matricula || !idToken) {
      throw new Error("Dados incompletos para upload (File, Matricula ou Token ausentes).");
    }

    // 1. Validar Sessão e Segurança 🛡️
    // Verificamos o token vindo do cliente para garantir que a requisição é legítima.
    const auth = getAdminAuth();
    await auth.verifyIdToken(idToken);

    // 2. Governança de Tamanho 📏
    // CV: 5MB | Portfolio: 20MB
    const MAX_SIZE = type === "CV" ? 5 * 1024 * 1024 : 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error(`Arquivo excede o limite. Máximo permitido para ${type}: ${type === "CV" ? "5MB" : "20MB"}`);
    }

    // 3. Preparar estrutura de pastas no Drive 🗄️
    const drive = await getDriveClient();
    const baseFolderId = serverEnv.GOOGLE_DRIVE_USUARIOS_ID;
    
    // Caminho Hierárquico: Categoria (B2B/B2C) -> Matrícula -> 2.Documentos
    const isPJ = matricula.includes("-PJ-");
    const categoryFolderId = await ensureFolder(drive, baseFolderId, isPJ ? "2.3.B2B" : "2.2.B2C");
    const userFolderId = await ensureFolder(drive, categoryFolderId, matricula);
    const docsFolderId = await ensureFolder(drive, userFolderId, "2.Documentos");

    // 4. Conversão para Stream compatível com a API Google 🔄
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = Readable.from(buffer);

    // 5. Executar o Upload
    // Nomenclatura Governamental: [TIPO]_[DATA]_[NOME_ORIGINAL]
    const dateStr = new Date().toISOString().split('T')[0];
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const fileName = `${type.toUpperCase()}_${dateStr}_${cleanFileName}`;

    const result = await uploadFileToDrive(
      drive,
      docsFolderId,
      fileName,
      file.type,
      stream
    );

    console.log(`✅ [Upload Drive] Concluído: ${fileName} | Membro: ${matricula}`);

    return { 
      success: true, 
      url: result.webViewLink, 
      fileId: result.id,
      fileName: file.name
    };
  } catch (err: any) {
    console.error("❌ [Upload Drive] Crítico:", err);
    return { success: false, error: err.message || "Erro interno no processamento do arquivo." };
  }
}

/**
 * Upload de Documentos de Pós-Evento (Ata ou Doc Individual)
 * Garante a estrutura: 2.Documentos/Eventos/{eventId}/
 */
export async function uploadPostEventDocAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const matricula = formData.get("matricula") as string;
    const eventId = formData.get("eventId") as string;
    const idToken = formData.get("idToken") as string;

    if (!file || !matricula || !eventId || !idToken) {
      throw new Error("Dados incompletos para upload (File, Matricula, EventId ou Token ausentes).");
    }

    // 1. Validar Sessão 🛡️
    const auth = getAdminAuth();
    await auth.verifyIdToken(idToken);

    // 2. Preparar estrutura de pastas no Drive 🗄️
    // Caminho: Categoria -> Matrícula -> 2.Documentos -> Eventos -> {eventId}
    const drive = await getDriveClient();
    const baseFolderId = serverEnv.GOOGLE_DRIVE_USUARIOS_ID;
    
    const isPJ = matricula.includes("-PJ-");
    const categoryFolderId = await ensureFolder(drive, baseFolderId, isPJ ? "2.3.B2B" : "2.2.B2C");
    const userFolderId = await ensureFolder(drive, categoryFolderId, matricula);
    const docsFolderId = await ensureFolder(drive, userFolderId, "2.Documentos");
    const eventsBaseFolderId = await ensureFolder(drive, docsFolderId, "Eventos");
    const eventFolderId = await ensureFolder(drive, eventsBaseFolderId, eventId);

    // 3. Conversão para Stream 🔄
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = Readable.from(buffer);

    // 4. Executar o Upload
    const dateStr = new Date().toISOString().split('T')[0];
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const fileName = `POST_EVENT_${dateStr}_${cleanFileName}`;

    const result = await uploadFileToDrive(
      drive,
      eventFolderId,
      fileName,
      file.type,
      stream
    );

    console.log(`✅ [PostEvent Upload] Concluído: ${fileName} | Membro: ${matricula} | Evento: ${eventId}`);

    return { 
      success: true, 
      url: result.webViewLink, 
      fileId: result.id,
      fileName: file.name,
      uploadedAt: new Date().toISOString()
    };
  } catch (err: any) {
    console.error("❌ [PostEvent Upload] Crítico:", err);
    return { success: false, error: err.message || "Erro interno no upload de pós-evento." };
  }
}

