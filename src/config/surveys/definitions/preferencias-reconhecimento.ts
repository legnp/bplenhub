import { SurveyConfig } from "@/types/survey";

/**
 * Survey: Mapa de Preferências de Reconhecimento 💖
 * Baseado nas 5 Linguagens de Apreciação.
 */
export const preferenciasReconhecimentoSurvey: SurveyConfig = {
  id: "preferencias_reconhecimento",
  kind: "survey",
  title: "Mapa de Preferências de Reconhecimento",
  analytics: {
    surveyId: "preferencias_reconhecimento",
    domain: "RECONHECIMENTO",
    tags: ["relacionamento", "comportamento", "apreciacao"]
  },
  policy: {
    editable: false,
    allowReset: false
  },
  submitLabel: "Finalizar Mapa",
  completionMessage: "Parabéns por concluir seu Mapa de Preferências de Reconhecimento! \n\nEntender como você se sente valorizado é fundamental para construir relações mais fortes e significativas. Nossos especialistas estão consolidando seu perfil e os resultados estarão disponíveis em breve na sua área de resultados.",
  steps: [
    {
      id: "apresentacao",
      question: "Objetivo do Mapa",
      description: "Olá {User_Nickname}! Este mapa visa identificar a forma como você prefere ser reconhecido e reconhecer as outras pessoas nas suas relações interpessoais.\n\nTempo estimado: 20 minutos.\n\nInstruções Importantes:\n• Reserve um lugar silencioso e sem distrações;\n• Uma vez iniciado, não será possível pausar;\n• Suas respostas não ficam salvas até a conclusão total.",
      nextLabel: "De acordo",
      fields: []
    },
    {
      id: "instrucoes_instrumento",
      question: "Instruções do Instrumento",
      description: "A seguir serão apresentados grupos com algumas frases, as quais você deverá dar uma nota de 1 a 5, de acordo com o que faria você se sentir mais apreciado e reconhecido.\n\nEscala de avaliação:\n5 = O que você MAIS apreciaria\n1 = O que você MENOS apreciaria em cada grupo",
      nextLabel: "Iniciar",
      fields: []
    },
    {
      id: "grupo1",
      question: "GRUPO 1",
      fields: [{ 
        id: "grupo1", 
        type: "ranking", 
        options: [
          "A. Seu colega diz: “Você realmente fez um ótimo trabalho. Parabéns!”",
          "B. Seu colega, inesperadamente, faz alguma coisa no escritório que você aprecia.",
          "C. Seu colega traz para você um presente surpresa da loja.",
          "D. Seu colega te convida para uma caminhada, apenas para conversar.",
          "E. Seu colega faz um esforço apenas para te dar um abraço antes de deixar o campus."
        ], 
        required: true 
      }]
    },
    {
      id: "grupo2",
      question: "GRUPO 2",
      fields: [{ 
        id: "grupo2", 
        type: "ranking", 
        options: [
          "A. Seu colega te diz o quanto ele te aprecia.",
          "B. Seu colega faz uma tarefa chata que você deveria fazer e te encoraja a descansar.",
          "C. Seu colega traz para você uma guloseima especial da padaria.",
          "D. Seu colega te convida para sentar e conversar sobre o seu dia.",
          "E. Seu colega gosta de receber um abraço seu quando você está apenas passando por ele no campus."
        ], 
        required: true 
      }]
    },
    {
      id: "grupo3",
      question: "GRUPO 3",
      fields: [{ 
        id: "grupo3", 
        type: "ranking", 
        options: [
          "A. Durante uma festa, seu colega compartilha com as pessoas presentes sobre um recente sucesso seu.",
          "B. Seu colega leva o seu carro para o lava-rápido.",
          "C. Seu colega surpreende você com um presente inesperado.",
          "D. Seu colega te chama para dar um passeio à tarde.",
          "E. Seu colega anda de braço dado com você quando vocês estão passeando no shopping."
        ], 
        required: true 
      }]
    },
    {
      id: "grupo4",
      question: "GRUPO 4",
      fields: [{ 
        id: "grupo4", 
        type: "ranking", 
        options: [
          "A. Seu colega te elogia por causa de uma de suas qualidades especiais.",
          "B. Seu colega prepara um lanche e leva para você no campus.",
          "C. Seu colega, que tem sustento completo, paga academia (ou cursinho) para você por 2 meses.",
          "D. Seu colega planeja uma saída legal para vocês.",
          "E. Seu colega te dá uma carona e te poupa de ter que pegar aquele ônibus lotado."
        ], 
        required: true 
      }]
    },
    {
      id: "grupo5",
      question: "GRUPO 5",
      fields: [{ 
        id: "grupo5", 
        type: "ranking", 
        options: [
          "A. Seu colega te diz o quanto seus amigos te apreciam.",
          "B. Seu colega preenche para você aquele relatório complicado que você odeia fazer.",
          "C. Seu colega manda entregar na sua casa um presente surpresa.",
          "D. Seu colega convida você para almoçar, te leva para o seu restaurante favorito e paga a conta.",
          "E. Seu colega faz uma massagem nos seus ombros."
        ], 
        required: true 
      }]
    },
    {
      id: "fechamento_aberto",
      question: "Como você se comunica?",
      description: "Após analisar as afirmações, descreva com suas palavras como você enxerga sua forma de se comunicar e apreciar suas relações.",
      fields: [
        {
          id: "comunicacao_relacoes",
          type: "textarea",
          label: "Impacto Interpessoal",
          placeholder: "O quanto você considera que suas condutas impactam os meios nos quais vive?",
          required: true
        }
      ]
    }
  ]
};
