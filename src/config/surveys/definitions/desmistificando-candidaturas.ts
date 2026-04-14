import { SurveyConfig } from "@/types/survey";

/**
 * BPlen HUB — Survey Definition: Desmistificando Candidaturas 🧬✨
 * Objetivo: Desmistificar estilos de currículos em diferentes plataformas e coletar feedback.
 */
export const desmistificandoCandidaturasSurvey: SurveyConfig = {
  id: "desmistificando_candidaturas",
  kind: "survey",
  title: "Desmistificando Candidaturas",
  steps: [
    {
      id: "intro",
      question: "Olá, {{User_Nickname}}! Antes de iniciarmos a preparação da sua carreira, vamos desmistificar algumas coisas, ok?",
      nextLabel: "Ok!",
      fields: [
        {
          id: "intro_info",
          type: "info",
          label: "Introdução"
        }
      ]
    },
    {
      id: "plataformas_summary",
      question: "{{User_Nickname}}, não há um único estilo de currículo que atenda as demandas de todos os locais de recrutamento. A seguir, veja como cada tipo de plataforma funciona:",
      description: "• Linkedin: Foco em SEO e conexões;\n• Catho: Estrutura clássica e palavras-chave;\n• Gupy: IA e triagem automatizada;\n• Outros: Adaptação conforme a cultura.",
      nextLabel: "OK",
      fields: [
        {
          id: "plataformas_info",
          type: "info",
          label: "Resumo das Plataformas"
        }
      ]
    },
    {
      id: "feedback_step",
      question: "{{User_Nickname}}, o quanto esse conteúdo foi útil para você?",
      fields: [
        {
          id: "utilidade",
          type: "likert",
          label: "Nível de Utilidade",
          options: ["Nada Útil", "Pouco Útil", "Neutro", "Útil", "Muito Útil"],
          required: true
        },
        {
          id: "comentários",
          type: "textarea",
          label: "Feedback Adicional",
          placeholder: "Conte mais sobre o que achou ou o que podemos melhorar...",
          required: false
        }
      ]
    }
  ],
  analytics: {
    surveyId: "desmistificando_candidaturas",
    domain: "CONTEUDO",
    context: "carreira_preparacao",
    version: "1.0"
  },
  policy: {
    editable: true,
    allowReset: true
  },
  submitLabel: "Enviar Feedback"
};
