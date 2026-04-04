import { SurveyConfig } from "@/types/survey";
import { pilotSurveyConfig } from "./pilot";

/**
 * SURVEY_REGISTRY (Fonte de Verdade 📚)
 * Todas as pesquisas institucionais devem ser registradas aqui
 * para serem descobertas pelo Admin e pelo SurveyEngine.
 */
export const SURVEY_REGISTRY: SurveyConfig[] = [
  pilotSurveyConfig,
  // Outras surveys futuras entram aqui
];

export function getSurveyConfig(id: string): SurveyConfig | undefined {
  return SURVEY_REGISTRY.find(s => s.id === id);
}
