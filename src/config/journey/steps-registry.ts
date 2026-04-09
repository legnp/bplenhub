/**
 * BPlen HUB — Step Journey Registry 🧬
 * Configuração centralizada das 6 etapas da jornada do membro.
 */

export type StepStatus = "locked" | "current" | "completed";

export interface JourneyStep {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  slug: string;
  icon: string;
  isLocked?: boolean;
}

export const JOURNEY_STEPS: JourneyStep[] = [
  {
    id: "step_1",
    order: 1,
    title: "Onboarding",
    subtitle: "Boas-vindas e Nivelamento",
    description: "Inicie sua jornada conhecendo o ecossistema BPlen e configurando seu perfil.",
    slug: "onboarding",
    icon: "Rocket",
  },
  {
    id: "step_2",
    order: 2,
    title: "Análise Comportamental",
    subtitle: "Mapeamento DISC & Perfil",
    description: "Desenvolva autoconhecimento profundo através de nossas ferramentas de análise.",
    slug: "analise-comportamental",
    icon: "UserCheck",
  },
  {
    id: "step_3",
    order: 3,
    title: "Planejamento de Carreira",
    subtitle: "Metas e Estratégia",
    description: "Defina seu norte estratégico e os marcos de crescimento para os próximos ciclos.",
    slug: "planejamento-carreira",
    icon: "Map",
  },
  {
    id: "step_4",
    order: 4,
    title: "Liderança & Gestão",
    subtitle: "Soft Skills & Hard Skills",
    description: "Domine as competências essenciais para liderar times e projetos de alto impacto.",
    slug: "lideranca-gestao",
    icon: "Shield",
  },
  {
    id: "step_5",
    order: 5,
    title: "Performance",
    subtitle: "Aceleração e Resultados",
    description: "Otimize sua rotina e potencialize sua entrega com técnicas avançadas.",
    slug: "performance",
    icon: "TrendingUp",
  },
  {
    id: "step_6",
    order: 6,
    title: "Mentoria Final",
    subtitle: "Consolidação e Próximos Passos",
    description: "Sessão de encerramento do ciclo com feedback 360 e plano de continuidade.",
    slug: "mentoria-final",
    icon: "Award",
  },
];
