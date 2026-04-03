"use server";

import { 
  collection, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * BPlen HUB — Feedback Actions 📡🗳️
 * Gerencia a captação de voz do usuário (Avaliações e Sugestões).
 */

/**
 * Salva uma avaliação de conteúdo específico.
 */
export async function submitContentFeedback(data: {
  postId: string;
  title: string;
  platform: string;
  publishedAt: string;
  rating: number;
  comment: string;
  uid?: string | null;
  matricula?: string | null;
}) {
  try {
    const feedbackRef = collection(db, "content_feedbacks");
    await addDoc(feedbackRef, {
      ...data,
      timestamp: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar feedback de conteúdo:", error);
    throw new Error("Falha ao registrar sua avaliação.");
  }
}

/**
 * Salva uma nova sugestão de tema/conteúdo.
 */
export async function submitThemeSuggestion(data: {
  suggestion: string;
  justification: string;
  channels: string[];
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  uid?: string | null;
  matricula?: string | null;
}) {
  try {
    const suggestionRef = collection(db, "theme_suggestions");
    await addDoc(suggestionRef, {
      ...data,
      timestamp: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar sugestão de tema:", error);
    throw new Error("Falha ao enviar sua sugestão.");
  }
}
