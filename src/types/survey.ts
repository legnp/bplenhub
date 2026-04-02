/**
 * BPlen HUB — Central de Tipos (Governança de Dados)
 * Todas as estruturas de dados de Formulários devem ser registradas aqui.
 */

export type UserType = "PF" | "PJ";

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
