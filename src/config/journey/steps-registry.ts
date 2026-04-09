import { JourneyStep } from "@/types/journey";

/**
 * BPlen HUB — Step Journey Registry 🧬🛡️
 * The single source of truth for the 6 stages of the BPlen Journey.
 */
export const JOURNEY_STAGES: JourneyStep[] = [
  {
    id: "onboarding",
    order: 1,
    title: "1. Onboarding",
    icon: "Rocket",
    description: "Prepare seu perfil e conheça a metodologia BPlen.",
    substeps: [
      { id: "welcome-vid", title: "Boas-vindas", type: "content", referenceId: "welcome_video" },
      { id: "profile-form", title: "Perfil Profissional", type: "form", referenceId: "user_profile" },
      { id: "checkin-survey", title: "Check-in Inicial", type: "survey", referenceId: "checkin" }
    ]
  },
  {
    id: "behavioral-analysis",
    order: 2,
    title: "2. Análise Comportamental",
    icon: "Dna",
    description: "Descubra seu perfil DISC e suas preferências.",
    substeps: [
      { id: "disc-survey", title: "Perfil DISC", type: "survey", referenceId: "disc" },
      { id: "time-mgmt-survey", title: "Gestão do Tempo", type: "survey", referenceId: "gestao_tempo" },
      { id: "disc-results", title: "Seu Dashboard DISC", type: "result", referenceId: "disc" }
    ]
  },
  {
    id: "career-planning",
    order: 3,
    title: "3. Plano de Carreira",
    icon: "Map",
    description: "Trace seus objetivos e próximos passos.",
    substeps: [
      { id: "career-goals", title: "Objetivos", type: "form", referenceId: "career_goals" },
      { id: "market-analysis", title: "Mercado e Skillset", type: "content", referenceId: "job_market" }
    ]
  },
  {
    id: "guidance",
    order: 4,
    title: "4. Orientação",
    icon: "Users",
    description: "Sessões em grupo e alinhamento estratégico.",
    substeps: [
      { id: "group-session", title: "Agendar Orientação", type: "meeting", referenceId: "orientacao_grupo" },
      { id: "guidance-feedback", title: "Feedback da Sessão", type: "feedback", referenceId: "guidance" }
    ]
  },
  {
    id: "mentorship",
    order: 5,
    title: "5. Coaching / Mentoria",
    icon: "Target",
    description: "Acompanhamento individual 1-to-1 focado em resultados.",
    substeps: [
      { id: "one-to-one", title: "Sessão 1 to 1", type: "meeting", referenceId: "mentoria_1to1" },
      { id: "deliverables", title: "Planos de Ação", type: "upload", referenceId: "individual_plan" }
    ]
  },
  {
    id: "offboarding",
    order: 6,
    title: "6. Offboarding / Alumni",
    icon: "GraduationCap",
    description: "Encerramento do ciclo e entrada na rede Alumni.",
    substeps: [
      { id: "final-feedback", title: "Pesquisa de Satisfação", type: "survey", referenceId: "offboarding_feedback" },
      { id: "certificate", title: "Certificação BPlen", type: "result", referenceId: "alumni_portal" }
    ]
  }
];

export const getStepById = (id: string) => JOURNEY_STAGES.find(s => s.id === id);
export const getSubStepById = (stepId: string, subStepId: string) => 
  getStepById(stepId)?.substeps.find(ss => ss.id === subStepId);
