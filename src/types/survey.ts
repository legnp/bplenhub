import type { FieldValue, Timestamp } from "firebase/firestore";
import { EntityKind } from "./intake";

/**
 * BPlen HUB — Survey Strategy Types
 * Contratos técnicos para o motor de experiência narrativa e analítica.
 */

export type UserType = "PF" | "PJ";
export type SurveyStatus = "draft" | "completed" | "archived";

export interface SurveyAnalyticsMeta {
  surveyId: string;
  version?: string;
  context?: string;
  tags?: string[];
  domain?: string; // e.g. CONTEUDO, PRODUTO
}

export interface SurveyEditPolicy {
  editable: boolean;
  allowReset?: boolean;
  expiresAt?: string;
}

export interface WelcomeSurveyData {
  uid: string;
  email: string;
  Authentication_Name: string;
  User_Nickname: string;
  User_Type: UserType;
  Customer_FirstTopics: string[];
  Customer_FirstDemand: string;
  Customer_Origin: string;
  submittedAt?: string;
}

export interface SurveyStep {
  id: string;
  question: string;
  content: React.ReactNode;
  canProgress: boolean;
}

// Novos Contratos Institucionais

export interface SurveyFieldConfig {
  id: string;
  type: "choice" | "text" | "textarea" | "scale" | "info";
  label?: string;
  placeholder?: string;
  options?: string[]; // Para choice ou scale customizada
  required?: boolean;
  autoFocus?: boolean;
  min?: number; // Para range de scale
  max?: number; // Para range de scale
  isMultiple?: boolean; // Para seleções múltiplas (checkboxes)
}

export interface SurveyStepConfig {
  id: string;
  question: string;
  description?: string;
  fields: SurveyFieldConfig[];
}

export interface SurveyConfig {
  id: string;
  kind: Extract<EntityKind, "survey">;
  title: string;
  steps: SurveyStepConfig[];
  analytics: SurveyAnalyticsMeta;
  policy: SurveyEditPolicy;
  submitLabel?: string;
  templateData?: Record<string, string>; // Dados para interpolação nas perguntas
}

export type SurveyValue = string | string[] | number | boolean | null;

export interface SurveyResponse {
  surveyId: string;
  matricula: string;
  status: SurveyStatus;
  data: Record<string, SurveyValue>;
  submittedAt: FieldValue | Timestamp | Date | null;
  metadata: SurveyAnalyticsMeta;
}
