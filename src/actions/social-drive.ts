"use server";

import { getDriveClient } from "@/lib/google-auth";
import { ensureFolder } from "@/lib/drive-utils";
import { serverEnv } from "@/env";
import { Readable } from "stream";
import { revalidatePath } from "next/cache";

/**
 * BPlen HUB — Google Drive Media Engine 📁
 * Gerencia o upload de imagens sociais para o Drive como alternativa gratuita ao Storage.
 */

const SOCIAL_FOLDER_NAME = "Social_Media";

export async function uploadSocialThumbnailToDrive(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) throw new Error("Nenhum arquivo enviado.");

    const drive = await getDriveClient();
    
    // 1. Garantir que a pasta Social_Media existe dentro de Portfólio
    const socialFolderId = await ensureFolder(
      drive, 
      serverEnv.GOOGLE_DRIVE_PORTFOLIO_ID, 
      SOCIAL_FOLDER_NAME
    );

    // 2. Converter File para Stream legível pela API do Google
    const buffer = Buffer.from(await file.arrayBuffer());
    const media = {
      mimeType: file.type,
      body: Readable.from(buffer),
    };

    // 3. Executar Upload
    const fileName = `${Date.now()}_social_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const driveFile = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [socialFolderId],
      },
      media: media,
      fields: "id",
    });

    const fileId = driveFile.data.id;
    if (!fileId) throw new Error("Falha ao obter ID do arquivo no Drive.");

    // 4. Configurar Permissão como Pública (Leitura para qualquer um com o link)
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    // 5. Retornar URL Otimizada para Exibição Direta (lh3.googleusercontent.com)
    // Este padrão é excelente para tags <img> e evita bloqueios de CORS.
    const displayURL = `https://lh3.googleusercontent.com/d/${fileId}`;

    return { success: true, url: displayURL, fileId: fileId };
  } catch (error: any) {
    console.error("❌ Erro no upload para o Drive:", error);
    throw new Error(error.message || "Falha ao enviar imagem para o Google Drive.");
  }
}

/**
 * Remove um arquivo do Google Drive a partir do seu ID ou URL.
 */
export async function deleteSocialThumbnailFromDrive(urlOrId: string | null | undefined) {
  if (!urlOrId) return;

  try {
    const drive = await getDriveClient();
    
    // Extrair ID se for uma URL (lh3.../d/ID)
    let fileId = urlOrId;
    if (urlOrId.includes("lh3.googleusercontent.com/d/")) {
      fileId = urlOrId.split("/d/")[1];
    }

    // Apenas tenta apagar se tiver o formato de ID do Drive (longo alfanumérico)
    if (fileId.length > 10) {
      await drive.files.delete({ fileId });
      console.log(`✅ Arquivo removido do Drive: ${fileId}`);
    }
  } catch (error) {
    console.warn(`⚠️ Falha ao remover arquivo do Drive (pode já não existir):`, error);
  }
}
