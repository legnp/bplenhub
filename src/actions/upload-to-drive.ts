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
