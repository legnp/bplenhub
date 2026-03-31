"use server";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * BPlen HUB — One-to-One Settings Actions
 * Gerencia os tipos de serviços 1-to-1 para o dropdown do usuário.
 */

const SETTINGS_DOC_ID = "OneToOne";
const SETTINGS_COLLECTION = "Settings";

export async function getOneToOneTypes(): Promise<string[]> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().types || [];
    }
    return [];
  } catch (error) {
    console.error("Erro ao buscar tipos 1-to-1:", error);
    return [];
  }
}

export async function updateOneToOneTypes(types: string[]) {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    await setDoc(docRef, { types }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar tipos 1-to-1:", error);
    return { success: false, message: "Erro ao salvar configurações." };
  }
}
