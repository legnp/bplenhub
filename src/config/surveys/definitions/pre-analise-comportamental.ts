import { SurveyConfig } from "@/types/survey";

/**
 * Survey: Pré-Análise Comportamental 🧬
 * Identificação preliminar do perfil comportamental.
 */
export const preAnaliseComportamentalSurvey: SurveyConfig = {
  id: "pre_analise_comportamental",
  kind: "survey",
  title: "Pré-Análise Comportamental",
  analytics: {
    surveyId: "pre_analise_comportamental",
    domain: "COMPORTAMENTO",
    tags: ["perfil", "psicometrico", "assessment"]
  },
  policy: {
    editable: false,
    allowReset: false
  },
  submitLabel: "Finalizar Análise",
  completionMessage: "Parabéns por concluir sua Pré-Análise Comportamental! \n\nEstes dados são fundamentais para o início do seu processo de mentoria. Nossos especialistas estão analisando seu perfil e entraremos em contato na sua reunião estratégica.",
  steps: [
    {
      id: "apresentacao",
      question: "Objetivo da Análise",
      description: "Olá {User_Nickname}! Este instrumento visa a identificação preliminar do seu perfil comportamental.\n\nTempo estimado: 10 minutos.\n\nInstruções Importantes:\n• Reserve um lugar silencioso e sem distrações;\n• Uma vez iniciado, não será possível pausar;\n• Suas respostas não ficam salvas até a conclusão total.",
      nextLabel: "De acordo",
      fields: []
    },
    {
      id: "tracos_comportamentais",
      question: "Quais dos itens a seguir poderiam te descrever?",
      description: "Selecione de 5 a 9 itens que mais ressoam com você.",
      fields: [
        {
          id: "tracos",
          type: "multi_select",
          cols: 4,
          options: [
            "Introvertido", "Extrovertido", "Confiante", "Inseguro", "Crítico", "Acolhedor", 
            "Entusiasta", "Controlado", "Organizado", "Desorganizado", "Líder", "Seguidor", 
            "Empático", "Indiferente", "Nervoso", "Relaxado", "Estressado", "Resiliente", 
            "Competitivo", "Colaborativo", "Controlador", "Acomodado", "Reativo", "Proativo", 
            "Controlado", "Impulsivo", "Pessimista", "Otimista"
          ],
          validation: {
            minSelections: 5,
            maxSelections: 9
          },
          required: true
        }
      ]
    },
    {
      id: "afirmacoes_vida",
      question: "Afirmações de Vida",
      description: "Em uma escala de 1 a 10, classifique o quanto você acredita que as afirmações são verdadeiras na sua vida (1 = Não são; 10 = São totalmente verdadeiras).",
      fields: [
        {
          id: "afirmacoes",
          type: "likert_group",
          options: [
            "A minha vida depende do destino ou da sorte",
            "É o caráter que molda o destino",
            "Eu confio nas opiniões de outras pessoas",
            "Eu vivo da forma como eu quero"
          ],
          required: true
        }
      ]
    },
    {
      id: "solucao_conflito",
      question: "Solução de Conflito",
      description: "Como você geralmente soluciona uma situação difícil ou de conflito?",
      fields: [
        {
          id: "conflito",
          type: "choice",
          options: ["Evitando-a", "Adaptando-se a ela", "Aceitando-a", "Outro"],
          required: true
        }
      ]
    },
    {
      id: "frases_guia",
      question: "Frases e Pensamentos",
      description: "Quais são as 3 frases e/ou pensamentos que guiam a sua vida?",
      fields: [
        {
          id: "frases_vida",
          type: "textarea",
          placeholder: "Ex: 'A sorte favorece os audazes'...",
          required: true
        }
      ]
    },
    {
      id: "referencia_humana",
      question: "Referências",
      description: "Qual é sua maior referência como humano? Como essa pessoa impactou sua vida?",
      fields: [
        {
          id: "referencia_humana",
          type: "textarea",
          required: true
        }
      ]
    },
    {
      id: "foco_temporal",
      question: "Foco Temporal",
      description: "Nas suas reflexões sobre a sua vida, você geralmente pensa mais no passado, no presente ou no futuro?",
      fields: [
        {
          id: "reflexao_tempo",
          type: "textarea",
          required: true
        }
      ]
    },
    {
      id: "autodescricao",
      question: "Autodescrição",
      description: "Escreva uma breve autodescrição em terceira pessoa.",
      fields: [
        {
          id: "autodescricao_3p",
          type: "textarea",
          required: true
        }
      ]
    },
    {
      id: "qualidades_admiradas",
      question: "Admiração e Respeito",
      description: "Quais são as qualidades e atitudes que você mais admira e respeita nos outros?",
      fields: [
        {
          id: "qualidades_outros",
          type: "textarea",
          required: true
        }
      ]
    },
    {
      id: "palavra_resumo",
      question: "Resumo em uma palavra",
      description: "Qual palavra você usaria para resumir o tipo de pessoa que você é?",
      fields: [
        {
          id: "resumo_pessoa",
          type: "text",
          required: true
        }
      ]
    }
  ]
};
