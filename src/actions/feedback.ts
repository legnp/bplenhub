"use server";

import { submitGenericForm } from "@/actions/generic-form";
import { submitSurvey } from "@/actions/submit-survey";
import { themeSuggestionFormConfig } from "@/config/forms/theme-suggestion";
import { contentEvaluationSurveyConfig } from "@/config/surveys/content-evaluation";
import { FormResponse } from "@/types/forms";
import { SurveyValue } from "@/types/survey";

/**
 * BPlen HUB — Feedback Actions (Institucionalizadas 🧬)
 * Gerencia a captação de voz do usuário (Avaliações e Sugestões) seguindo Forms_Global e Survey_Global.
 */

/**
 * Salva uma avaliação de conteúdo específico (Survey).
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
    const fallbackId = `lead_eval_${new Date().getTime()}`;
    const userUid = data.uid || fallbackId;

    // 1. Preparar Payload da Survey
    const responses: Record<string, SurveyValue> = {
      postId: data.postId,
      title: data.title,
      platform: data.platform,
      publishedAt: data.publishedAt,
      rating: data.rating,
      comment: data.comment
    };

    // 2. Delegar para submitSurvey Institutional
    const dynamicConfig = { 
      ...contentEvaluationSurveyConfig, 
      id: `${contentEvaluationSurveyConfig.id}_${data.postId}` 
    };

    const res = await submitSurvey(dynamicConfig, responses, userUid);
    
    return { success: true, matricula: res.matricula };
  } catch (error) {
    console.error("Erro ao salvar feedback de conteúdo:", error);
    throw new Error("Falha ao registrar sua avaliação.");
  }
}

/**
 * Salva uma nova sugestão de tema/conteúdo (Form).
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
     // Identificador de soberania: prioriza UID, fallback para hash do e-mail se disponível, ou timestamp
    const emailHash = data.contact?.email ? `lead_${Buffer.from(data.contact.email).toString('base64').substring(0, 10)}` : null;
    const userUid = data.uid || emailHash || `lead_theme_${new Date().getTime()}`;

    // 1. Mapear para FormResponse
    const response: FormResponse = {
      suggestion: data.suggestion,
      justification: data.justification,
      channels: data.channels,
      contact_name: data.contact?.name || "",
      contact_email: data.contact?.email || "",
      contact_phone: data.contact?.phone || ""
    };

    // 2. Delegar para submitGenericForm Institutional
    const res = await submitGenericForm(themeSuggestionFormConfig, response, userUid);
    
    return { success: true, matricula: res.matricula };
  } catch (error) {
    console.error("Erro ao salvar sugestão de tema:", error);
    throw new Error("Falha ao enviar sua sugestão.");
  }
}
