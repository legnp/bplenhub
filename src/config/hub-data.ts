import { BPlenService, BPlenContent, BPlenTool, BPlenSurvey } from "@/types/hub";

/**
 * MOCK DATA: SERVIÇOS (JORNADA)
 */
export const MOCK_SERVICES: BPlenService[] = [
  {
    id: "serv-01",
    title: "Mapeamento Comportamental Individual",
    category: "people",
    description: "Início da jornada: análise profunda do seu perfil DISC e talentos naturais.",
    status: "acquired",
    step: 1,
    ctaUrl: "/hub/ferramentas"
  },
  {
    id: "serv-02",
    title: "Mentoria de Gestão de Carreira",
    category: "people",
    description: "Planejamento estratégico para seu próximo nível profissional.",
    status: "available",
    step: 2,
    ctaUrl: "/servicos"
  },
  {
    id: "serv-03",
    title: "HRBP as a Service (Empresas)",
    category: "companies",
    description: "Parceria estratégica de RH para escalar sua cultura e resultados.",
    status: "locked",
    step: 3,
    ctaUrl: "/servicos"
  }
];

/**
 * MOCK DATA: ÚLTIMOS CONTEÚDOS
 */
export const MOCK_CONTENTS: BPlenContent[] = [
  {
    id: "cnt-01",
    title: "A nova era do HRBP Estratégico em 2025",
    source: "LinkedIn",
    url: "https://www.linkedin.com/posts/lisandralencina_hrbp-estrategico-carreira-activity-123",
    publishedAt: "2024-03-28T10:00:00Z",
    thumbnail: "/placeholder-content.jpg"
  },
  {
    id: "cnt-02",
    title: "Como o DISC pode salvar sua liderança",
    source: "Instagram",
    url: "https://www.instagram.com/p/C4_123/",
    publishedAt: "2024-03-25T15:00:00Z",
    thumbnail: "/placeholder-content-2.jpg"
  },
  {
    id: "cnt-03",
    title: "Humanizando Processos com Agilidade",
    source: "TikTok",
    url: "https://www.tiktok.com/@lis.lencina/video/123",
    publishedAt: "2024-03-20T12:00:00Z",
    thumbnail: "/placeholder-content-3.jpg"
  }
];

/**
 * MOCK DATA: FERRAMENTAS
 */
export const MOCK_TOOLS: BPlenTool[] = [
  {
    id: "tool-01",
    title: "Calculadora de eNPS",
    description: "Meça a lealdade e satisfação do seu time em segundos.",
    icon: "BarChart",
    category: "Strategic",
    isMemberOnly: false,
    status: "active"
  },
  {
    id: "tool-02",
    title: "Dashboard Comportamental (DISC)",
    description: "Visualização interativa das suas 4 forças dominantes.",
    icon: "Target",
    category: "Behavioral",
    isMemberOnly: true,
    status: "active"
  },
  {
    id: "tool-03",
    title: "Planner de Mentoria Ágil",
    description: "Organize sua evolução semanal com foco em resultados.",
    icon: "Layout",
    category: "Productivity",
    isMemberOnly: true,
    status: "soon"
  }
];
