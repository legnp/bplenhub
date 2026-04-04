import type { FieldValue, Timestamp } from "firebase/firestore";
import { EntityKind } from "./intake";

/**
 * BPlen HUB — Forms Platform Schema (V2.0 🏗️)
 * Definições universais para renderização dinâmica de formulários operacionais.
 */

export type FormFieldType = 
  | "text" 
  | "choice" 
  | "checkbox" 
  | "textarea" 
  | "select" 
  | "number"
  | "date"
  | "info";

export type FormMode = "create" | "edit" | "view" | "submitted";
export type FormStatus = "draft" | "submitted" | "updated" | "archived";
export type FormValue = string | string[] | boolean | number | null | undefined;

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormFieldConfig {
  id: string;
  type: FormFieldType;
  label?: string;
  placeholder?: string;
  options?: FormFieldOption[] | string[];
  required?: boolean;
  autoFocus?: boolean;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface FormSectionConfig {
  id: string;
  title?: string; // Título operacional da seção (Recomendado)
  description?: string;
  fields: FormFieldConfig[];
  /** @deprecated Use 'title' para conformidade com Forms_Global */
  question?: string; 
}

/** @deprecated Use 'FormSectionConfig' para conformidade com Forms_Global */
export interface FormStepConfig extends FormSectionConfig {}

export interface FormWorkflowMeta {
  nextStep?: string; // TODO: Migrar para nextSection
  triggers?: string[];
  ownerRole?: string[];
}

export interface FormConfig {
  id: string;
  kind: Extract<EntityKind, "form" | "hybrid">;
  title: string;
  /** @deprecated Use 'sections' para conformidade com Forms_Global */
  steps?: FormStepConfig[]; 
  sections?: FormSectionConfig[];
  submitLabel?: string;
  driveFolder?: string;
  rootFolderKey?: "PORTFOLIO" | "USERS" | "ATAS";
  sheetNamePrefix?: string;
  workflow?: FormWorkflowMeta;
}

export interface FormResponse {
  [fieldId: string]: FormValue;
}

export interface FormRecord {
  formId: string;
  matricula: string;
  userUid: string;
  mode: FormMode;
  status: FormStatus;
  data: FormResponse;
  submittedAt: FieldValue | Timestamp | Date | null;
  updatedAt?: FieldValue | Timestamp | Date | null;
  workflow?: FormWorkflowMeta;
}
