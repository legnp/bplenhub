"use server";

import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { getDriveClient } from "@/lib/google-auth";
import { ensureFolder, uploadFileToDrive } from "@/lib/drive-utils";
import { serverEnv } from "@/env";

/**
 * BPlen HUB — Profile Actions 🧬🛡️
 * Motor de sincronização de identidade (Foto -> Drive -> Firestore).
 */

export async function updateProfileImageAction(matricula: string, base64Image: string) {
  try {
    const drive = await getDriveClient();
    
    // 1. Localizar/Criar pasta raiz do Usuário no Drive
    // Caminho: Usuarios / [MATRICULA]
    const userFolderId = await ensureFolder(drive, serverEnv.GOOGLE_DRIVE_USUARIOS_ID, matricula);
    
    // 2. Garantir que a pasta "Identidade" existe
    const identidadFolderId = await ensureFolder(drive, userFolderId, "Identidade");
    
    // 3. Converter Base64 para Buffer (WebP processado no Client)
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    
    // 4. Upload ou Substituição do arquivo
    // Drive aceita duplicados, mas vamos manter o padrão foto_profile_matricula.webp
    const fileName = `foto_profile_${matricula}.webp`;
    
    const result = await uploadFileToDrive(
      drive,
      identidadFolderId,
      fileName,
      "image/webp",
      buffer
    );

    // 5. Atualizar o Firestore do Membro
    const userRef = doc(db, "User", matricula);
    await updateDoc(userRef, {
      photoUrl: result.webViewLink,
      photoDriveId: result.id,
      lastPhotoUpdate: new Date().toISOString()
    });

    return { 
      success: true, 
      photoUrl: result.webViewLink 
    };
  } catch (error: any) {
    console.error("❌ [ProfileAction] Erro ao atualizar foto:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Remove a foto de perfil e retorna para as iniciais.
 */
export async function deleteProfileImageAction(matricula: string) {
  try {
    const userRef = doc(db, "User", matricula);
    await updateDoc(userRef, {
      photoUrl: null,
      photoDriveId: null,
      lastPhotoUpdate: new Date().toISOString()
    });
    
    return { success: true };
  } catch (error: any) {
    console.error("❌ [ProfileAction] Erro ao remover foto:", error);
    return { success: false };
  }
}
