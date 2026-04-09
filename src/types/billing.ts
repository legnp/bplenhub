/**
 * BPlen HUB — Billing & Tax Profiles 💸
 * Dados necessários para emissão de NF e faturamento.
 */

export type BillingType = 'individual' | 'company';

export interface BillingProfile {
  uid: string;
  type: BillingType;
  
  // Informações Pessoais / Jurídicas
  fullName: string;
  taxId: string; // CPF ou CNPJ
  email: string;
  phone: string;

  // Endereço de Faturamento
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  createdAt: string;
  updatedAt: string;
}
