import { FormConfig } from "@/types/forms";

/**
 * Configuração: Pesquisa de Interesse Showroom BPlen 🏛️
 */
export const showroomFormConfig: FormConfig = {
  id: "showroom_interest",
  title: "Interesse no Showroom BPlen",
  driveFolder: "2.3.Showroom",
  sheetNamePrefix: "Interesse_Fisico",
  submitLabel: "Quero ser avisado!",
  steps: [
    {
      id: "intro",
      question: "Estamos preparando um espaço físico incrível para você!\nComo você gostaria de utilizá-lo?",
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
      question: "Quais serviços de experimentação você mais sente falta no digital?",
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
      question: "O que não pode faltar no nosso Showroom físico para ser uma experiência nota 10?",
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
      question: "Como prefere receber o convite para a inauguração?",
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
