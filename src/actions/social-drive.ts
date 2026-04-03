"use server";

import { getDriveClient } from "@/lib/google-auth";
import { ensureFolder } from "@/lib/drive-utils";
import { serverEnv } from "@/env";
import { Readable } from "stream";

/**
 * BPlen HUB — Social Drive Engine 📁🧬
 * Gerenciamento de ativos de mídia diretamente no Google Drive.
 */

const SOCIAL_FOLDER_NAME = "Social_Media";

/**
 * Realiza o upload da miniatura para o Google Drive.
 * Configura permissões públicas e retorna a URL de visualização direta.
 */
export async function uploadSocialThumbnailToDrive(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) throw new Error("Nenhum arquivo enviado para upload.");

    const drive = await getDriveClient();

    // 1. Garantir que a pasta Social_Media existe dentro de Portfólio
    console.log(`[Drive] Buscando/Criando pasta ${SOCIAL_FOLDER_NAME} em ${serverEnv.GOOGLE_DRIVE_PORTFOLIO_ID}`);
    const socialFolderId = await ensureFolder(
      drive, 
      serverEnv.GOOGLE_DRIVE_PORTFOLIO_ID, 
      SOCIAL_FOLDER_NAME
    );

    // 2. Preparar o arquivo para upload
    const buffer = Buffer.from(await file.arrayBuffer());
    const media = {
      mimeType: file.type,
      body: Readable.from(buffer),
    };

    const fileName = `${Date.now()}_social_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    
    // 3. Criar o arquivo no Drive (Sincronizado com o Lab de Testes)
    console.log(`[Drive] Iniciando upload do arquivo: ${fileName}`);
    const driveFile = await drive.files.create({
      supportsAllDrives: true, // Habilita suporte a Shared Drives / Pastas de Equipe
      requestBody: {
        name: fileName,
        parents: [socialFolderId],
      },
      media: media,
      fields: "id, webViewLink",
    });

    const fileId = driveFile.data.id;
    if (!fileId) throw new Error("Falha ao obter ID do arquivo após upload.");

    // 4. Configurar permissão pública (Leitor para qualquer pessoa com o link)
    console.log(`[Drive] Configurando permissões públicas para o arquivo ${fileId}`);
    await drive.permissions.create({
      fileId: fileId,
      supportsAllDrives: true,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    // 5. Retornar a URL de visualização direta (lh3.googleusercontent.com)
    // Esse padrão ignora o visualizador do Drive e serve a imagem bruta para o site.
    const directUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
    
    console.log(`[Drive] Upload concluído com sucesso. URL: ${directUrl}`);
    return { success: true, url: directUrl, fileId: fileId };

  } catch (error: any) {
    console.error("❌ Erro no upload para o Drive:", error?.message || error);
    // Se for erro de permissão ou 404, logar detalhes para diagnóstico
    if (error?.code === 404) {
      console.error("[Drive Debug] Erro 404 pode indicar que o Service Account não tem acesso à pasta pai.");
    }
    throw new Error(error?.message || "Erro ao processar upload para o Google Drive.");
  }
}

/**
 * Remove um arquivo do Google Drive.
 */
export async function deleteSocialThumbnailFromDrive(urlOrId: string) {
  try {
    if (!urlOrId) return;

    // Extrair ID se for uma URL do lh3
    let fileId = urlOrId;
    if (urlOrId.includes("lh3.googleusercontent.com/d/")) {
      fileId = urlOrId.split("/d/")[1];
    }

    const drive = await getDriveClient();
    console.log(`[Drive] Removendo arquivo órfão: ${fileId}`);
    
    await drive.files.delete({ 
      fileId,
      supportsAllDrives: true 
    });
    
    return { success: true };
  } catch (error: any) {
    // Se o arquivo já não existir, ignoramos o erro (limpeza silenciosa)
    if (error?.code === 404) {
      console.warn(`[Drive] Arquivo ${urlOrId} já não existia para remoção.`);
      return { success: true };
    }
    console.error("❌ Erro ao deletar do Drive:", error);
    return { success: false, error: error.message };
  }
}
