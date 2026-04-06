import { welcomeSurveyConfig } from "./welcome";
import { pilotSurveyConfig } from "./pilot";
import { check_in_v1 } from "./definitions/check-in";
import { gestaoTempoSurvey } from "./definitions/gestao-tempo";
import { preferenciasAprendizadoSurvey } from "./definitions/preferencias-aprendizado";
import { preferenciasReconhecimentoSurvey } from "./definitions/preferencias-reconhecimento";
import { preAnaliseComportamentalSurvey } from "./definitions/pre-analise-comportamental";

/**
 * BPlen HUB — Survey Registry (🗂️)
 * Centraliza todas as definições de pesquisa do projeto
 * para serem descobertas pelo Admin e pelo SurveyEngine.
 */
export const surveys = {
  welcome_survey: welcomeSurveyConfig,
  pilot_survey: pilotSurveyConfig,
  check_in_v1,
  "gestao_tempo": gestaoTempoSurvey,
  "preferencias_aprendizado": preferenciasAprendizadoSurvey,
  "preferencias_reconhecimento": preferenciasReconhecimentoSurvey,
  "pre_analise_comportamental": preAnaliseComportamentalSurvey
};

export const SURVEY_REGISTRY = Object.values(surveys);

export type SurveyRegistry = typeof surveys;
export type SurveyId = keyof SurveyRegistry;

export function getSurveyConfig(id: string) {
  return surveys[id as SurveyId];
}
