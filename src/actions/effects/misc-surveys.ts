"use server";

import { SurveyValue } from "@/types/survey";
import { syncSurveyToUserDrive } from "@/lib/drive-sync";

/**
 * EFEITO: Check-in BPlen 📊
 * Coleta objetivos, desafios e links iniciais de carreira.
 */
export async function handleCheckInEffect(
  responses: Record<string, SurveyValue>,
  matricula: string
) {
  console.log(`📡 [Effects:CheckIn] Processando resultados: ${matricula}`);
  
  try {
    await syncSurveyToUserDrive({
      matricula,
      surveyTitle: "Check-in",
      headers: [
        "Timestamp", "Matrícula", "Nicho", "Desafios", "Objetivos", "Regime",
        "CV Drive", "Portfólio Drive", "LinkedIn", "Instagram", "Web/Portfolio", "Banco Talentos", "Comentários Carreira"
      ],
      rowData: [
        new Date().toLocaleString("pt-BR"),
        matricula,
        String((responses.nicho_cascata as any)?.primary || "N/A"),
        Array.isArray(responses.desafios_multi) ? responses.desafios_multi.join(", ") : "N/A",
        String(responses.objetivos_timeline || "N/A"),
        String(responses.regime_choice || "N/A"),
        (responses.cv_upload as any)?.url || "N/A",
        (responses.portfolio_upload as any)?.url || "N/A",
        String(responses.linkedin_url || "N/A"),
        String(responses.instagram_url || "N/A"),
        `${responses.web_url || ""} | ${responses.portfolio_url || ""}`,
        String(responses.banco_talentos || "N/A"),
        String(responses.comentarios_carreira || "N/A")
      ]
    });
  } catch (err) {
    console.error(`❌ [Effects:CheckIn] Erro na sincronização Drive:`, err);
  }
}

/**
 * EFEITO: Feedback de Conteúdo 📋
 */
export async function handleContentFeedbackEffect(
  responses: Record<string, SurveyValue>,
  matricula: string,
  surveyTitle: string
) {
  try {
    await syncSurveyToUserDrive({
      matricula,
      surveyTitle,
      headers: ["Timestamp", "Matrícula", "Utilidade (Likert)", "Comentários/Feedback"],
      rowData: [
        new Date().toLocaleString("pt-BR"),
        matricula,
        String(responses.utilidade || "N/A"),
        String(responses.comentários || "N/A")
      ]
    });
  } catch (err) {
    console.error(`❌ [Effects:Feedback] Erro na sincronização Drive:`, err);
  }
}

/**
 * EFEITO: Revisão de Currículo 📄
 */
export async function handleCVReviewEffect(
  responses: Record<string, SurveyValue>,
  matricula: string
) {
  try {
    await syncSurveyToUserDrive({
      matricula,
      surveyTitle: "Revisão de Currículo",
      headers: ["Timestamp", "Matrícula", "Possuía Resumo?", "Resumo Original/Criado", "Alinhamento (Escala)", "Resumo Otimizado", "Descrição Formação"],
      rowData: [
        new Date().toLocaleString("pt-BR"),
        matricula,
        responses.has_resumo === "sim" ? "Sim" : "Não",
        String(responses.resumo_atual || responses.resumo_criado || "N/A"),
        String(responses.alinhamento || "N/A"),
        String(responses.resumo_otimizado || "N/A"),
        String(responses.descricao_formacao || "N/A")
      ]
    });
  } catch (err) {
    console.error(`❌ [Effects:CV Review] Erro na sincronização Drive:`, err);
  }
}
