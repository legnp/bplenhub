import { SurveyConfig } from "@/types/survey";

/**
 * BPlen HUB — Survey: Check-in (V1.0) 📊
 * Coleta dados profundos sobre a carreira e desafios do usuário.
 */
export const check_in_v1: SurveyConfig = {
  id: "check_in_v1",
  kind: "survey",
  title: "Check-in de Carreira",
  submitLabel: "Finalizar Check-in",
  analytics: {
    surveyId: "check_in_v1",
    domain: "SURVEY",
    context: "HUB_ADMIN",
    tags: ["carreira", "onboarding", "maturidade"]
  },
  policy: {
    editable: true,
    allowReset: false
  },
  steps: [
    {
      id: "q1_intro",
      question: "Olá {User_Nickname}! Agora que já se familiarizou com a plataforma, você nos permite conhecer um pouco mais sobre você?",
      fields: [
        {
          id: "intro_choice",
          type: "buttons",
          required: true,
          options: ["Com certeza", "Sim, mas não muito"],
          logic: {
            "Com certeza": "q2_com_certeza",
            "Sim, mas não muito": "q2_mas_nao_muito"
          }
        }
      ]
    },
    {
      id: "q2_mas_nao_muito",
      question: "{User_Nickname}, entendido. Hoje qual é a sua maior preocupação em contar sobre você?",
      fields: [
        {
          id: "preocupacao_desc",
          type: "textarea",
          required: true,
          placeholder: "Descreva brevemente..."
        }
      ]
    },
    {
      id: "q2_com_certeza",
      question: "Legal!!! Vamos nessa! Qual é a melhor coisa sobre você, que deveríamos saber para te apoiar na sua jornada?",
      fields: [
        {
          id: "melhor_coisa_desc",
          type: "textarea",
          required: true,
          placeholder: "Pode ser uma habilidade, um valor ou um sonho..."
        }
      ]
    },
    {
      id: "q3_objetivos",
      question: "{User_Nickname}, qual é o seu principal objetivo pelos próximos 90 dias, 6 meses e 5 anos?",
      fields: [
        {
          id: "objetivos_timeline",
          type: "textarea",
          required: true,
          placeholder: "90 dias: ... \n6 meses: ... \n5 anos: ..."
        }
      ]
    },
    {
      id: "q4_barreiras",
      question: "Quais são as maiores barreiras que você enfrenta hoje para alcançar esses objetivos?",
      fields: [
        {
          id: "barreiras_desc",
          type: "textarea",
          required: true,
          placeholder: "Falta de tempo, ferramentas, mentoria..."
        }
      ]
    },
    {
      id: "q5_desafios",
      question: "Certo! E dentro desse contexto, quais são os SEUS 3 a 5 maiores desafios?",
      fields: [
        {
          id: "desafios_multi",
          type: "multi_select",
          required: true,
          options: [
            "Entender jargões, termos técnicos ou expressões",
            "Organizar o meu tempo e a priorização de tarefas diárias",
            "Esforço excessivo para manter meu foco e concentração",
            "Ergonomia ou ambiente inadequado",
            "Sobrecarga de informações (dificuldade em filtrar o que é útil)",
            "Dificuldade que os outros me entendam com clareza",
            "Resistência ou dificuldade em me adaptar a novas ferramentas",
            "Dificuldade em delegar tarefas e confiar que os outros vão entregar",
            "Falta de clareza no alinhamento de expectativas com outros",
            "Eu travo em dar ou receber feedbacks positivos e/ou difíceis",
            "Sensação de sobrecarga constante ou proximidade de burnout",
            "Síndrome do Impostor (medo de não estar à altura dos desafios)",
            "Ansiedade em relação a resultados futuros ou mudanças",
            "Exaustão mental causada pelo excesso de tomada de decisão",
            "Dificuldade em me desconectar das atividades"
          ],
          validation: {
            minSelections: 3,
            maxSelections: 5
          }
        }
      ]
    },
    {
      id: "q6_nicho",
      question: "Que avanço! Parabéns! Sabemos que nem sempre é tão fácil resumir nossos desafios em algumas palavras. Mas é isso, um passo por vez!\n{User_Nickname}, qual o seu principal nicho e área de atuação hoje?",
      fields: [
        {
          id: "nicho_cascata",
          type: "cascaded",
          required: true,
          label: "Nicho de Atuação",
          options: [
            { label: "Tecnologia", value: "Tecnologia", subOptions: ["Desenvolvimento", "Vendas", "RH", "Marketing", "Operações", "Financeiro", "Diretoria", "Outros"] },
            { label: "Saúde", value: "Saúde", subOptions: ["Operações", "Financeiro", "Diretoria", "Vendas", "RH", "Outros"] },
            { label: "Educação", value: "Educação", subOptions: ["Operações", "Financeiro", "Diretoria", "RH", "Outros"] },
            { label: "Finanças", value: "Finanças", subOptions: ["Operações", "Financeiro", "Diretoria", "Vendas", "RH", "Outros"] },
            { label: "Marketing", value: "Marketing", subOptions: ["Marketing", "Vendas", "Operações", "Diretoria", "Outros"] },
            { label: "Varejo", value: "Varejo", subOptions: ["Vendas", "Operações", "Financeiro", "Logística", "Outros"] },
            { label: "Outros", value: "Outros", subOptions: ["Outros"] }
          ]
        }
      ]
    },
    {
      id: "q7_rotina",
      question: "Nos conte um pouco mais sobre o que você faz. Qual é o seu cargo atual? Quais são suas atividades? Como é a sua rotina?",
      fields: [
        {
          id: "rotina_cargo_desc",
          type: "textarea",
          required: true,
          placeholder: "Cargo: ... \nAtividades: ... \nRotina: ..."
        }
      ]
    },
    {
        id: "q8a_maturidade",
        question: "Qual é o estágio da maturidade da sua carreira profissional?",
        fields: [
            {
                id: "maturidade_cascata",
                type: "cascaded",
                required: true,
                label: "Estágio de Maturidade",
                options: [
                    { label: "Aprendiz", value: "Aprendiz", subOptions: ["Até 1 ano", "1 a 2 anos"] },
                    { label: "Junior", value: "Junior", subOptions: ["1 a 3 anos", "3 a 5 anos"] },
                    { label: "Pleno", value: "Pleno", subOptions: ["3 a 7 anos", "7 a 10 anos"] },
                    { label: "Sênior", value: "Sênior", subOptions: ["10 a 15 anos", "15 a 20 anos", "+20 anos"] },
                    { label: "Conselheiro", value: "Conselheiro", subOptions: ["+20 anos", "+30 anos"] },
                    { label: "Diretoria", value: "Diretoria", subOptions: ["+10 anos", "+15 anos", "+20 anos"] },
                    { label: "Dono", value: "Dono", subOptions: ["Qualquer tempo"] }
                ]
            }
        ]
    },
    {
      id: "q8b_regime",
      question: "{User_Nickname}, hoje você está empregado em regime CLT ou PJ?",
      fields: [
        {
          id: "regime_choice",
          type: "buttons",
          required: true,
          options: ["Sim", "Não"], // Conforme roteiro: "Sim" -> q8c, "Não" -> q9
          logic: {
            "Sim": "q8c_pacote",
            "Não": "q9_rendimento"
          }
        }
      ]
    },
    {
      id: "q8c_pacote",
      question: "Como está o seu pacote de remuneração e benefícios atual?",
      fields: [
        {
          id: "beneficios_pacote",
          type: "benefits",
          required: true,
          options: [
            "Salário", "Bônus/PLR", "Previdência Privada", "VR/VA Flex", 
            "VR", "VA", "VT", "Vale Combustível", "Estacionamento", 
            "Seguro Médico", "Seguro Odontológico", "Seguro de Vida", 
            "Dayoff", "Home Office"
          ]
        }
      ]
    },
    {
      id: "q9_rendimento",
      question: "Qual é o seu rendimento médio mensal?",
      fields: [
        {
          id: "rendimento_mensal",
          type: "currency_group",
          required: true,
          options: ["Atual", "Expectativa"]
        }
      ]
    },
    {
      id: "q10_como_podemos_ajudar",
      question: "{User_Nickname}, porque você deu sua permissão a BPlen para te ajudar na jornada do desenvolvimento da sua carreira, o que você espera encontrar por aqui? Como podemos te ajudar?",
      fields: [
        {
          id: "expectativa_ajuda_desc",
          type: "textarea",
          required: true,
          placeholder: "Gostaria de focar em..."
        }
      ]
    },
    {
      id: "q11_likert",
      question: "Até aqui, como você avalia a sua experiência? E como gostaria que continuássemos te conduzindo?",
      fields: [
        {
          id: "experiencia_likert",
          type: "likert",
          required: true,
          options: ["1", "2", "3", "4", "5"]
        }
      ]
    }
  ]
};
