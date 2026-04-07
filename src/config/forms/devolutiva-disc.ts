import { FormConfig } from "@/types/forms";

/**
 * Configuração: Lançamento de Devolutiva DISC 🧬
 * Formulário operacional para Injeção de Resultados Manuais.
 */
export const devolutivaDiscFormConfig: FormConfig = {
  id: "devolutiva_disc",
  kind: "form",
  title: "Lançamento de Devolutiva DISC",
  submitLabel: "Publicar no Dashboard do Cliente",
  sections: [
    {
      id: "scores",
      title: "Pontuações DISC (0-100)",
      description: "Insira os percentuais extraídos do portal oficial para cada perfil.",
      fields: [
        {
          id: "executor",
          type: "number",
          label: "Executor (D)",
          placeholder: "Ex: 85",
          required: true
        },
        {
          id: "comunicador",
          type: "number",
          label: "Comunicador (I)",
          placeholder: "Ex: 70",
          required: true
        },
        {
          id: "planejador",
          type: "number",
          label: "Planejador (S)",
          placeholder: "Ex: 40",
          required: true
        },
        {
          id: "analista",
          type: "number",
          label: "Analista (C)",
          placeholder: "Ex: 60",
          required: true
        }
      ]
    },
    {
      id: "attachments",
      title: "Documentação Oficial",
      description: "Faça o upload do PDF completo gerado pelo portal DISC.",
      fields: [
        {
          id: "result_file",
          type: "file",
          label: "Relatório Completo (PDF)",
          required: true,
          metadata: {
             maxSizeMB: 10,
             accept: ".pdf"
          }
        }
      ]
    }
  ]
};
