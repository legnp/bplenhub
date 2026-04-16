import { SurveyConfig } from "@/types/survey";

/**
 * Survey: Análise de Perfil Comportamental (DISC) 🧬
 * Estratégia de Redirecionamento para Portal Externo.
 */
export const discSurvey: SurveyConfig = {
  id: "disc",
  kind: "survey",
  title: "Perfil Comportamental (DISC)",
  description: "Mapeamento de perfil",
  analytics: {
    surveyId: "disc",
    domain: "BEHAVIORAL",
    tags: ["disc", "comportamento", "perfil"]
  },
  policy: {
    editable: false,
    allowReset: false
  },
  submitLabel: "Finalizar Processo DISC",
  completionMessage: "Excelente! Sua participação foi registrada. Nossa equipe analisará os resultados do portal externo e sua devolutiva personalizada será disponibilizada em breve no seu dashboard.",
  steps: [
    {
      id: "intro_disc",
      question: "Análise de Perfil Comportamental (DISC)",
      description: "Olá {User_Nickname}! A metodologia DISC é uma das ferramentas mais poderosas do mundo para compreender padrões de comportamento e comunicação.\n\nPara garantir a máxima precisão técnica, utilizamos uma plataforma parceira especializada para esta coleta específica.",
      nextLabel: "Entendido",
      fields: []
    },
    {
      id: "portal_bridge",
      question: "Acesso ao Portal de Diagnóstico",
      description: "Ao clicar no botão abaixo, você será levado ao portal externo para realizar o seu teste. \n\n**IMPORTANTE:** Após concluir o teste no portal externo, retorne a esta aba e clique em 'Finalizar' para registrar sua participação no BPlen HUB.",
      nextLabel: "Já concluí no Portal",
      fields: [
        {
          id: "disc_portal",
          type: "portal_link",
          required: true
        }
      ]
    },
    {
      id: "confirmacao_final",
      question: "Confirmação de Conclusão",
      description: "Você confirmou que concluiu todas as etapas no portal externo?\n\nIsso sinaliza para nossa equipe que já podemos buscar seus dados para a devolutiva.",
      fields: []
    }
  ]
};
