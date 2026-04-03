import { Timestamp } from "firebase/firestore";

/**
 * BPlen HUB — User Admin Schema (Segurança e Operação 🛡️)
 * Estrutura consolidada para exibição no painel administrativo.
 */

export interface AdminUser {
  matricula: string;
  uid?: string;
  name: string;
  nickname?: string;
  email: string;
  isAdmin: boolean;
  onboardStatus?: "completed" | "pending" | "none";
  createdAt?: Timestamp | string;
  lastLogin?: Timestamp | string;
  
  // 🚀 Espaço para Futura Expansão (Entitlements)
  role?: string; 
  services?: Record<string, boolean>;
}
