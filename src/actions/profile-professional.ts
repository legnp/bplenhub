"use server";

import { getAdminDb } from "@/lib/firebase-admin";
import admin from "firebase-admin";
import { requireAuth } from "@/lib/auth-guards";
import { resolveMatricula } from "./get-user-results";

/**
 * BPlen HUB — Profile Professional Actions 🧬🏛️
 * Motor de soberania para gestão de carreira e networking.
 */

export interface ContactItem {
  value: string;
  isPublic: boolean;
}

export interface ProfessionalProfileData {
  // Dados Internos (Survey Sync)
  regime_choice?: string;
  beneficios_pacote?: string[];
  cv_upload?: any;
  portfolio_upload?: any;
  linkedin_url?: string;
  instagram_url?: string;
  web_url?: string;
  portfolio_url?: string;
  comentarios_carreira?: string;

  // Dados de Networking (Novos)
  participation_talent_bank: boolean;
  networking_visibility: boolean;
  cv_networking_visibility: boolean;
  portfolio_networking_visibility: boolean;
  sales_pitch: string;
  hashtags: string[];
  contacts: {
    email: ContactItem;
    phone: ContactItem;
    whatsapp: ContactItem;
    instagram: ContactItem;
    linkedin: ContactItem;
    tiktok: ContactItem;
    discord: ContactItem;
    site: ContactItem;
  };
}

/**
 * Busca o Perfil Profissional consolidado
 */
export async function getProfessionalProfileAction(idToken?: string) {
  try {
    const session = await requireAuth(idToken);
    const matricula = await resolveMatricula(session.uid, session.email || "");
    
    if (!matricula) throw new Error("Matrícula não identificada.");

    const db = getAdminDb();
    
    // 1. Buscar Dados da Survey Check-in
    const surveySnap = await db.doc(`User/${matricula}/results/check_in`).get();
    const surveyData = surveySnap.exists ? surveySnap.data() : {};

    // 2. Buscar Dados de Networking/Profile
    const networkingSnap = await db.doc(`User/${matricula}/profile/networking`).get();
    const netData = networkingSnap.exists ? networkingSnap.data() : {};

    const defaultContact = { value: "", isPublic: false };

    // 3. Consolidar Objeto de Resposta
    const profile: ProfessionalProfileData = {
      // Dados da Survey (Fallbacks)
      regime_choice: surveyData?.regime_choice || "",
      beneficios_pacote: surveyData?.beneficios_pacote || [],
      cv_upload: surveyData?.cv_upload || null,
      portfolio_upload: surveyData?.portfolio_upload || null,
      linkedin_url: surveyData?.linkedin_url || "",
      instagram_url: surveyData?.instagram_url || "",
      web_url: surveyData?.web_url || "",
      portfolio_url: surveyData?.portfolio_url || "",
      comentarios_carreira: surveyData?.comentarios_carreira || "",

      // Dados de Networking
      participation_talent_bank: netData?.participation_talent_bank ?? (surveyData?.banco_talentos === "Sim, quero fazer parte"),
      networking_visibility: netData?.networking_visibility ?? false,
      cv_networking_visibility: netData?.cv_networking_visibility ?? false,
      portfolio_networking_visibility: netData?.portfolio_networking_visibility ?? false,
      sales_pitch: netData?.sales_pitch || "",
      hashtags: netData?.hashtags || ["", "", "", "", ""],
      contacts: {
        email: netData?.contacts?.email || { value: session.email || "", isPublic: false },
        phone: netData?.contacts?.phone || defaultContact,
        whatsapp: netData?.contacts?.whatsapp || defaultContact,
        instagram: netData?.contacts?.instagram || defaultContact,
        linkedin: netData?.contacts?.linkedin || { value: surveyData?.linkedin_url || "", isPublic: false },
        tiktok: netData?.contacts?.tiktok || defaultContact,
        discord: netData?.contacts?.discord || defaultContact,
        site: netData?.contacts?.site || { value: surveyData?.web_url || "", isPublic: false },
      }
    };

    return { success: true, data: profile, matricula };
  } catch (error: any) {
    console.error("❌ [GetProfessionalProfile] Erro:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Atualiza o Perfil Profissional de forma atômica
 */
export async function updateProfessionalProfileAction(data: ProfessionalProfileData, idToken?: string) {
  try {
    const session = await requireAuth(idToken);
    const matricula = await resolveMatricula(session.uid, session.email || "");
    if (!matricula) throw new Error("Matrícula não identificada.");

    const db = getAdminDb();

    // 🏛️ Operação Atômica de Sincronização
    const batch = db.batch();

    // 1. Atualizar Documento de Networking
    const netRef = db.doc(`User/${matricula}/profile/networking`);
    batch.set(netRef, {
      participation_talent_bank: data.participation_talent_bank,
      networking_visibility: data.networking_visibility,
      cv_networking_visibility: data.cv_networking_visibility,
      portfolio_networking_visibility: data.portfolio_networking_visibility,
      sales_pitch: data.sales_pitch,
      hashtags: data.hashtags,
      contacts: data.contacts,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // 2. Sincronizar campos na Survey Check-in (Soberania de Dados 🛡️)
    const surveyRef = db.doc(`User/${matricula}/results/check_in`);
    batch.set(surveyRef, {
      regime_choice: data.regime_choice,
      beneficios_pacote: data.beneficios_pacote,
      linkedin_url: data.linkedin_url,
      instagram_url: data.instagram_url,
      web_url: data.web_url,
      portfolio_url: data.portfolio_url,
      comentarios_carreira: data.comentarios_carreira,
      banco_talentos: data.participation_talent_bank ? "Sim, quero fazer parte" : "Não, obrigado",
      syncWithProfileAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    await batch.commit();

    return { success: true };
  } catch (error: any) {
    console.error("❌ [UpdateProfessionalProfile] Erro:", error);
    return { success: false, error: error.message };
  }
}
