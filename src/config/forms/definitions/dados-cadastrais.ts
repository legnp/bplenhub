import { FormConfig } from "@/types/forms";

/**
 * BPlen HUB — Formulário: Dados Cadastrais 📋🛡️
 * Coleta de dados oficiais para faturamento, identificação e suporte.
 */
export const dadosCadastraisForm: FormConfig = {
  id: "dados_cadastrais",
  kind: "form",
  title: "Dados Cadastrais",
  submitLabel: "Salvar e Continuar",
  sheetNamePrefix: "Forms_dados_cadastrais",
  sections: [
    {
      id: "identificacao",
      title: "Identificação BPlen",
      description: "Estes dados estão vinculados à sua conta HUB e não podem ser alterados aqui.",
      fields: [
        {
          id: "matricula",
          type: "text",
          label: "Sua Matrícula",
          readOnly: true,
          required: true
        },
        {
          id: "email",
          type: "text",
          label: "E-mail de Conexão",
          readOnly: true,
          required: true
        },
        {
          id: "user_name",
          type: "text",
          label: "Nome Associado à Conta",
          readOnly: true,
          required: true
        }
      ]
    },
    {
      id: "dados_pessoais",
      title: "Dados Pessoais",
      description: "Informações necessárias para emissão de notas e contratos.",
      fields: [
        {
          id: "full_name",
          type: "text",
          label: "Nome Completo (Sem abreviações)",
          placeholder: "Digite seu nome completo",
          required: true
        },
        {
          id: "cpf",
          type: "text",
          label: "CPF",
          placeholder: "000.000.000-00",
          mask: "cpf",
          validation: "cpf",
          required: true
        },
        {
          id: "birth_date",
          type: "date",
          label: "Data de Nascimento",
          required: true
        },
        {
          id: "phone",
          type: "text",
          label: "Telefone de Contato",
          placeholder: "(00) 00000-0000",
          mask: "phone",
          required: true
        }
      ]
    },
    {
      id: "endereco_residencial",
      title: "Endereço Residencial",
      description: "Utilize o CEP para preenchimento automático.",
      fields: [
        {
          id: "cep",
          type: "text",
          label: "CEP",
          placeholder: "00000-000",
          mask: "cep",
          required: true
        },
        {
          id: "pais",
          type: "select",
          label: "País",
          placeholder: "Selecione seu país",
          required: true
        },
        {
          id: "estado",
          type: "text",
          label: "Estado / Província",
          placeholder: "Ex: São Paulo",
          required: true
        },
        {
          id: "cidade",
          type: "text",
          label: "Cidade",
          placeholder: "Ex: Campinas",
          required: true
        },
        {
          id: "rua",
          type: "text",
          label: "Logradouro (Rua/Av)",
          placeholder: "Ex: Av. Paulista",
          required: true
        },
        {
          id: "numero",
          type: "text",
          label: "Número",
          placeholder: "Ex: 123",
          required: true
        },
        {
          id: "complemento",
          type: "text",
          label: "Complemento",
          placeholder: "Ex: Apto 42",
          required: false
        }
      ]
    },
    {
      id: "faturamento_logic",
      title: "Dados de Faturamento",
      description: "Como deseja receber suas notas fiscais?",
      fields: [
        {
          id: "billing_same_as_address",
          type: "choice",
          label: "O endereço de faturamento é o mesmo do residencial?",
          options: [
            { label: "Sim, são iguais", value: "yes" },
            { label: "Não, quero usar outro endereço", value: "no" }
          ],
          required: true
        }
      ]
    },
    {
      id: "endereco_faturamento",
      title: "Endereço de Faturamento",
      description: "Preencha os dados para onde devemos enviar as notas fiscais.",
      logic: {
        showIf: {
          fieldId: "billing_same_as_address",
          value: "no"
        }
      },
      fields: [
        {
          id: "billing_cep",
          type: "text",
          label: "CEP de Faturamento",
          placeholder: "00000-000",
          mask: "cep",
          required: true
        },
        {
          id: "billing_pais",
          type: "select",
          label: "País",
          placeholder: "Selecione o país",
          required: true
        },
        {
          id: "billing_estado",
          type: "text",
          label: "Estado / Província",
          placeholder: "Ex: São Paulo",
          required: true
        },
        {
          id: "billing_cidade",
          type: "text",
          label: "Cidade",
          placeholder: "Ex: Campinas",
          required: true
        },
        {
          id: "billing_rua",
          type: "text",
          label: "Logradouro (Rua/Av)",
          placeholder: "Ex: Av. Paulista",
          required: true
        },
        {
          id: "billing_numero",
          type: "text",
          label: "Número",
          placeholder: "Ex: 123",
          required: true
        }
      ]
    }
  ]
};
