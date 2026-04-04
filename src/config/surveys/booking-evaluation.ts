import { SurveyConfig } from "@/types/survey";

/**
 * Configuração: Avaliação de Agendamento (Micro-Survey 🧬)
 */
export const bookingEvaluationSurveyConfig: SurveyConfig = {
  id: "booking_evaluation",
  kind: "survey",
  title: "Avaliação da Experiência BPlen",
  steps: [
    {
      id: "evaluation",
      question: "Avaliação da Reunião",
      fields: [
        {
          id: "rating",
          type: "scale",
          label: "Nota Likert (1-5)",
          min: 1,
          max: 5,
          required: true
        },
        {
          id: "feedback",
          type: "textarea",
          label: "Como foi sua experiência? (Opcional)",
          placeholder: "Compartilhe algum ponto de melhoria ou elogio..."
        }
      ]
    }
  ],
  analytics: {
    surveyId: "booking_evaluation",
    domain: "PRODUTO",
    version: "1.0"
  },
  policy: {
    editable: false
  },
  submitLabel: "Enviar Avaliação"
};
