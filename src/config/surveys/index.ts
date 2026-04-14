import { welcomeSurveyConfig } from "./welcome";
import { checkInSurvey } from "./definitions/check-in";

import { gestaoTempoSurvey } from "./definitions/gestao-tempo";
import { preferenciasAprendizadoSurvey } from "./definitions/preferencias-aprendizado";
import { preferenciasReconhecimentoSurvey } from "./definitions/preferencias-reconhecimento";
import { preAnaliseComportamentalSurvey } from "./definitions/pre-analise-comportamental";
import { discSurvey } from "./definitions/disc";
import { desmistificandoCandidaturasSurvey } from "./definitions/desmistificando-candidaturas";
import { revisaoCurriculoSurvey } from "./definitions/revisao-curriculo";

/**
 * BPlen HUB — Survey Registry (🗂️)
 * Centraliza todas as definições de pesquisa do projeto
 * para serem descobertas pelo Admin e pelo SurveyEngine.
 */
export const surveys = {
  welcome_survey: welcomeSurveyConfig,
  check_in: checkInSurvey,

  "gestao_tempo": gestaoTempoSurvey,
  "preferencias_aprendizado": preferenciasAprendizadoSurvey,
  "preferencias_reconhecimento": preferenciasReconhecimentoSurvey,
  "pre_analise_comportamental": preAnaliseComportamentalSurvey,
  "disc": discSurvey,
  "desmistificando_candidaturas": desmistificandoCandidaturasSurvey,
  "revisao_curriculo": revisaoCurriculoSurvey
};

export const SURVEY_REGISTRY = Object.values(surveys);

export type SurveyRegistry = typeof surveys;
export type SurveyId = keyof SurveyRegistry;

export function getSurveyConfig(id: string) {
  return surveys[id as SurveyId];
}
