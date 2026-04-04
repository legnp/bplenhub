import { SurveyConfig } from "@/types/survey";

/**
 * Pilot: Pesquisa de Clima e UX BPlen HUB 📊
 * Utilizada para validar o motor SurveyEngine V2.0.
 */
export const pilotSurveyConfig: SurveyConfig = {
  id: "pilot_climate_check",
  kind: "survey",
  title: "Clima e UX Corporativa",
  analytics: {
    surveyId: "pilot_climate_check",
    version: "1.0.0",
    context: "admin_test",
    tags: ["qa", "ux_validation"]
  },
  policy: {
    editable: false,
    allowReset: true
  },
  steps: [
    {
      id: "intro",
      question: "Bem-vindo ao novo motor de Inteligência do BPlen HUB.\nComo você avalia sua experiência de navegação hoje?",
      description: "Sua opinião nos ajuda a refinar a interface para usuários finais.",
      fields: [
        {
          id: "ux_score",
          type: "scale",
          required: true,
          options: ["Muito Ruim", "Ruim", "Ok", "Boa", "Incrível"]
        }
      ]
    },
    {
      id: "preference",
      question: "Qual aspecto da nova arquitetura narrativa você achou mais relevante?",
      fields: [
        {
          id: "key_benefit",
          type: "choice",
          required: true,
          options: [
            "Fluidez do TypedText",
            "Isolamento Hierárquico de Dados",
            "Separação entre Survey e Forms",
            "Estética Dark Premium"
          ]
        }
      ]
    },
    {
      id: "feedback",
      question: "Existe alguma funcionalidade que você sente falta para escalar novas pesquisas?",
      fields: [
        {
          id: "user_suggestion",
          type: "text",
          placeholder: "Digite sua sugestão aqui...",
          required: false
        }
      ]
    },
    {
      id: "conclusion",
      question: "Obrigado por validar o SurveyEngine.\nPodemos processar seu registro analítico agora?",
      description: "Ao clicar em concluir, os dados serão salvos em sua subcoleção privada.",
      fields: [
        {
          id: "confirm_info",
          type: "info",
          label: "Os dados coletados são anônimos dentro do contexto de infraestrutura, vinculados apenas à sua matrícula de teste."
        }
      ]
    }
  ]
};
