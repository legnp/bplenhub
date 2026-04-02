/**
 * Tipos centrais do Ecossistema BPlen HUB
 */

export interface BPlenService {
  id: string;
  title: string;
  category: "people" | "companies" | "partners";
  description: string;
  status: "available" | "acquired" | "locked";
  step: number; // Ordem na jornada
  ctaUrl?: string;
}

export interface BPlenContent {
  id: string;
  title: string;
  source: "LinkedIn" | "Instagram" | "TikTok" | "Youtube";
  thumbnail?: string;
  url: string;
  publishedAt: string;
  category?: string;
}

export interface BPlenTool {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "Behavioral" | "Productivity" | "Strategic";
  isMemberOnly: boolean;
  status: "active" | "soon";
}

export interface BPlenSurvey {
  id: string;
  question: string;
  options: { id: string; label: string }[];
  status: "active" | "expired";
}
