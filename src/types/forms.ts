/**
 * BPlen HUB — Forms Platform Schema (V1.0) 🧠🧱
 * Definições universais para renderização dinâmica de formulários.
 */

export type FormFieldType = 
  | "text" 
  | "choice" 
  | "checkbox" 
  | "textarea" 
  | "select" 
  | "info"; // Para passos apenas informativos

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormFieldConfig {
  id: string;
  type: FormFieldType;
  label?: string;
  placeholder?: string;
  options?: FormFieldOption[] | string[]; // Suporta lista de strings ou objetos label/value
  required?: boolean;
  autoFocus?: boolean;
  description?: string; // Para campos informativos (type="info")
  metadata?: Record<string, any>; // Para expansões futuras (campos calculados, etc)
}

export interface FormStepConfig {
  id: string;
  question: string;
  fields: FormFieldConfig[];
  description?: string;
}

export interface FormConfig {
  id: string;
  title: string;
  steps: FormStepConfig[];
  submitLabel?: string;
  driveFolder?: string; // Nome da pasta do formulário (ex: 'Showroom')
  rootFolderKey?: "PORTFOLIO" | "USERS" | "ATAS"; // Qual o domínio pai no Drive
  sheetNamePrefix?: string; // Prefixo do nome da planilha
}

export interface FormResponse {
  [fieldId: string]: any;
}
