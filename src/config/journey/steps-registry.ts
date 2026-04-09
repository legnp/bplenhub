import { JourneyStep, SubStepConfig } from "@/types/journey";

/**
 * BPlen HUB — Step Journey Registry 🧬
 * Configuração centralizada das 6 etapas da jornada do membro.
 * Segue rigorosamente os tipos definidos em src/types/journey.ts
 */

export const JOURNEY_STAGES: JourneyStep[] = [
  {
    id: "onboarding",
    order: 1,
    title: "Onboarding",
    description: "Inicie sua jornada conhecendo o ecossistema BPlen.",
    icon: "Rocket",
    substeps: [
      { 
        id: "intro_video", 
        title: "Boas-vindas", 
        type: "content", 
        referenceId: "welcome_video_01",
        description: "Conheça a visão da BPlen" 
      },
      { 
        id: "profile_setup", 
        title: "Perfil", 
        type: "form", 
        referenceId: "user_onboarding_form",
        description: "Complete seus dados" 
      }
    ],
  },
  {
    id: "analise-comportamental",
    order: 2,
    title: "Análise Comportamental",
    description: "Desenvolva autoconhecimento profundo.",
    icon: "UserCheck",
    substeps: [
      { 
        id: "disc_survey", 
        title: "DISC", 
        type: "survey", 
        referenceId: "disc_assessment_v1",
        description: "Mapeamento comportamental" 
      }
    ],
  },
  {
    id: "planejamento-carreira",
    order: 3,
    title: "Planejamento de Carreira",
    description: "Defina seu norte estratégico.",
    icon: "Map",
    substeps: [],
  },
  {
    id: "lideranca-gestao",
    order: 4,
    title: "Liderança & Gestão",
    description: "Domine competências essenciais.",
    icon: "Shield",
    substeps: [],
  },
  {
    id: "performance",
    order: 5,
    title: "Performance",
    description: "Otimize sua rotina.",
    icon: "TrendingUp",
    substeps: [],
  },
  {
    id: "mentoria-final",
    order: 6,
    title: "Mentoria Final",
    description: "Consolidação e Próximos Passos.",
    icon: "Award",
    substeps: [],
  },
];
