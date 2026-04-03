import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";
import { storage } from "./firebase";

/**
 * BPlen HUB — Storage Utilities 📁
 * Gerencia o upload e limpeza de arquivos do Firebase Storage.
 */

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export async function uploadSocialThumbnail(file: File): Promise<string> {
  // 1. Validação de Tamanho
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Arquivo muito grande. O limite é de 2MB.");
  }

  // 2. Validação de Tipo
  if (!file.type.startsWith("image/")) {
    throw new Error("Formato inválido. Por favor, selecione uma imagem.");
  }

  // 3. Gerar Caminho Único
  const timestamp = Date.now();
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
  const storagePath = `social-media/thumbnails/${timestamp}_${cleanFileName}`;
  const storageRef = ref(storage, storagePath);

  // 4. Executar Upload
  const snapshot = await uploadBytes(storageRef, file);
  
  // 5. Retornar URL Pública
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}

/**
 * Remove um arquivo do Storage a partir da sua URL de download.
 * Útil para evitar arquivos órfãos ao substituir/apagar posts.
 */
export async function deleteStorageFile(url: string | null | undefined) {
  if (!url || !url.includes("firebasestorage.googleapis.com")) return;

  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
    console.log(`✅ Arquivo removido do Storage: ${url}`);
  } catch (error) {
    console.warn(`⚠️ Falha ao remover arquivo do Storage (pode já ter sido removido):`, error);
  }
}
