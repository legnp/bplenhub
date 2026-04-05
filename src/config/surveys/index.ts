import { welcomeSurveyConfig } from "./welcome";
import { pilotSurveyConfig } from "./pilot";
import { check_in_v1 } from "./definitions/check-in";
import { gestaoTempoSurvey } from "./definitions/gestao-tempo";

/**
 * BPlen HUB — Survey Registry (🗂️)
 * Centraliza todas as definições de pesquisa do projeto
 * para serem descobertas pelo Admin e pelo SurveyEngine.
 */
export const surveys = {
  welcome_survey: welcomeSurveyConfig,
  pilot_survey: pilotSurveyConfig,
  check_in_v1,
  gestao_tempo: gestaoTempoSurvey
};

export const SURVEY_REGISTRY = Object.values(surveys);

export type SurveyRegistry = typeof surveys;
export type SurveyId = keyof SurveyRegistry;

export function getSurveyConfig(id: string) {
  return surveys[id as SurveyId];
}
