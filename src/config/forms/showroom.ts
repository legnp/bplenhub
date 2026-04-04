import { FormConfig } from "@/types/forms";

/**
 * Configuração: Pesquisa de Interesse Showroom BPlen 🏛️
 */
export const showroomFormConfig: FormConfig = {
  id: "showroom_interest",
  kind: "form",
  title: "Interesse no Showroom BPlen",
  driveFolder: "Showroom",
  rootFolderKey: "PORTFOLIO",
  sheetNamePrefix: "Interesse_Fisico",
  submitLabel: "Quero ser avisado!",
  sections: [
    {
      id: "intro",
      title: "Uso do Espaço Físico",
      description: "Estamos preparando um espaço incrível! Como você gostaria de utilizá-lo?",
      fields: [
        {
          id: "usage_type",
          type: "choice",
          required: true,
          options: [
            "Para mentorias presenciais individuais",
            "Para treinamentos em grupo (Jornadas)",
            "Como espaço de Networking/HUB",
            "Apenas curiosidade por enquanto"
          ]
        }
      ]
    },
    {
      id: "topics",
      title: "Necessidades Físicas",
      description: "Quais serviços de experimentação você mais sente falta no digital?",
      fields: [
        {
          id: "physical_needs",
          type: "checkbox",
          required: true,
          options: [
            "Dinâmicas de grupo",
            "Testes de perfil comportamental assistidos",
            "Café com mentores",
            "Workshops práticos"
          ]
        }
      ]
    },
    {
      id: "feedback",
      title: "Expectativas",
      description: "O que não pode faltar no nosso Showroom físico para ser uma experiência nota 10?",
      fields: [
        {
          id: "user_expectation",
          type: "textarea",
          placeholder: "Sua opinião é fundamental...",
          required: true
        }
      ]
    },
    {
      id: "contact",
      title: "Inauguração & Contato",
      description: "Como prefere receber o convite para a inauguração?",
      fields: [
        {
          id: "contact_method",
          type: "select",
          placeholder: "Escolha o canal",
          required: true,
          options: ["WhatsApp", "LinkedIn", "E-mail"]
        }
      ]
    }
  ]
};
