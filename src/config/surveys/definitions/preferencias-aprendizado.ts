import { SurveyConfig } from "@/types/survey";

/**
 * Survey: Mapa de Preferências de Aprendizado 🧠
 * Focado em identificar o Sistema Representacional predominante (V-A-C-D).
 */
export const preferenciasAprendizadoSurvey: SurveyConfig = {
  id: "preferencias_aprendizado",
  kind: "survey",
  title: "Mapa de Preferências de Aprendizado",
  description: "Estilos de absorção",
  analytics: {
    surveyId: "preferencias_aprendizado",
    domain: "APRENDIZADO",
    tags: ["comportamento", "aprendizado", "vacd"]
  },
  policy: {
    editable: false,
    allowReset: false
  },
  submitLabel: "Finalizar Mapa",
  completionMessage: "Parabéns por concluir seu Mapa de Preferências! \n\nSua forma única de processar informações é a chave para acelerar seu desenvolvimento intelectual. Nossos especialistas estão analisando seu perfil e os resultados detalhados estarão disponíveis em breve na sua área de resultados.",
  steps: [
    {
      id: "apresentacao",
      question: "Objetivo do Mapa",
      description: "Olá {User_Nickname}! Este mapa visa identificar a forma como você prefere e se sente mais confortável para aprender.\n\nTempo estimado: 20 minutos.\n\nInstruções Importantes:\n• Reserve um lugar silencioso e sem interrupções;\n• Uma vez iniciado, não será possível pausar;\n• O mapa não fica salvo até a conclusão total.",
      nextLabel: "De acordo",
      fields: []
    },
    {
      id: "instrucoes_ranking",
      question: "Instruções do Mapa",
      description: "A seguir serão apresentadas a você algumas afirmações as quais você deverá numerar as opções de 1 a 4, ordenando da que melhor descreve você até a que menos descreve.\n\nUse a seguinte escala:\n\n4 = A que melhor descreve você\n3 = A próxima melhor descrição\n2 = A próxima melhor descrição\n1 = A que menos descreve você",
      nextLabel: "Iniciar",
      fields: []
    },
    {
      id: "q1",
      question: "1. Eu tomo decisões importantes baseado em:",
      fields: [{ 
        id: "q1", 
        type: "ranking", 
        options: [
          "Minha intuição", 
          "O que me soa melhor", 
          "O que me parece melhor", 
          "Um estudo preciso e minucioso do assunto"
        ], 
        required: true 
      }]
    },
    {
      id: "q2",
      question: "2. Durante uma discussão, eu sou mais influenciado por:",
      fields: [{ 
        id: "q2", 
        type: "ranking", 
        options: [
          "O tom de voz da outra pessoa", 
          "Se eu posso ou não ver o argumento da outra pessoa", 
          "A lógica do argumento da outra pessoa", 
          "Se eu entro em contato ou não com os sentimentos reais do outro"
        ], 
        required: true 
      }]
    },
    {
      id: "q3",
      question: "3. Eu comunico mais facilmente o que se passa comigo:",
      fields: [{ 
        id: "q3", 
        type: "ranking", 
        options: [
          "No modo como me visto e aparento", 
          "Pelos sentimentos que compartilho", 
          "Pelas palavras que escolho", 
          "Pelo tom da minha voz"
        ], 
        required: true 
      }]
    },
    {
      id: "q4",
      question: "4. É muito fácil para mim:",
      fields: [{ 
        id: "q4", 
        type: "ranking", 
        options: [
          "Achar o volume e a sintonia ideais num sistema de som", 
          "Selecionar o ponto mais relevante relativo a um assunto interessante", 
          "Escolher os móveis mais confortáveis", 
          "Escolher as combinações de cores mais ricas e atraentes"
        ], 
        required: true 
      }]
    },
    {
      id: "q5",
      question: "5. Eu me percebo assim:",
      fields: [{ 
        id: "q5", 
        type: "ranking", 
        options: [
          "Se estou muito em sintonia com os sons do ambiente", 
          "Se sou muito capaz de raciocinar com fatos e dados novos", 
          "Eu sou muito sensível à maneira como a roupa veste o meu corpo", 
          "Eu respondo fortemente às cores e à aparência de uma sala"
        ], 
        required: true 
      }]
    },
    {
      id: "q19",
      question: "Análise de Hábitos",
      description: "Após analisar as afirmações, descreva com suas palavras como você avalia sua rotina e hábitos de aprendizagem hoje.",
      fields: [
        {
          id: "habitos_aprendizagem",
          type: "textarea",
          label: "Rotina e Repertório Intelectual",
          placeholder: "O quanto você amplia o seu repertório intelectual e de fato consegue aplicá-lo na prática?",
          required: true
        }
      ]
    }
  ]
};
