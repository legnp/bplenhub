import { FormConfig } from "@/types/forms";

/**
 * Configuração: Triagem de Agendamento (Forms_Global 🧬)
 */
export const bookingScreeningFormConfig: FormConfig = {
  id: "booking_screening",
  kind: "form",
  title: "Triagem de Demanda de Reunião",
  sections: [
    {
      id: "objective",
      title: "Demanda da Reunião",
      description: "Conte um pouco sobre o que você busca na BPlen.",
      fields: [
        {
          id: "objetivo",
          type: "textarea",
          label: "Objetivo da Reunião",
          placeholder: "Conte sobre o que você busca...",
          required: true
        },
        {
          id: "cargo",
          type: "text",
          label: "Sua Profissão / Cargo",
          placeholder: "Ex: Diretor de RH, Consultor...",
          required: true
        },
        {
          id: "conheceu_como",
          type: "select",
          label: "Como conheceu a BPlen?",
          options: [
            "LinkedIn",
            "Instagram",
            "Google",
            "Lisandra Lencina",
            "Indicação"
          ],
          required: true
        }
      ]
    }
  ],
  submitLabel: "Finalizar Agendamento",
  sheetNamePrefix: "Triagem_Booking",
};
