/**
 * Configuração centralizada de perfis profissionais da BPlen.
 * Facilita a escalabilidade para novos membros sem alteração na lógica da página.
 */

export interface ProfessionalProfile {
  slug: string;
  name: string;
  role: string;
  shortBio: string;
  photo: string;
  phone: string;
  email: string;
  social: {
    linkedin?: string;
    instagram?: string;
    whatsapp?: string;
    tiktok?: string;
  };
  details: {
    about: string;
    education: string[];
    specialties: string[];
    timeline: {
      year: string;
      title: string;
      description?: string;
      isHighlight?: boolean;
    }[];
    results?: string[];
    behavioralProfile?: {
      title: string;
      description: string;
    };
  };
}

export const PROFISSIONAIS: Record<string, ProfessionalProfile> = {
  "lisandra-lencina": {
    slug: "lisandra-lencina",
    name: "Lisandra Lencina",
    role: "HRBP & Fundadora BPlen",
    shortBio: "Há mais de 10 anos ajudando pessoas e negócios a alinharem seus interesses e resultados através do Desenvolvimento Humano aplicado à realidade.",
    photo: "/profissionais/lisandra-lencina.jpg",
    phone: "+55 11 94515 2088",
    email: "lisandra.lencina@bplen.com",
    social: {
      linkedin: "https://www.linkedin.com/in/lisandralencina/",
      instagram: "https://www.instagram.com/lis_lencina",
      whatsapp: "https://wa.me/5511945152088",
      tiktok: "https://www.tiktok.com/@lis.lencina"
    },
    details: {
      about: "RH, DHO e HRBP com trajetória sólida em grandes multinacionais (Acer, Samsung) e no empreendedorismo. Especialista em descomplicar o desenvolvimento humano, focada em gerar resultados sustentáveis através de clareza, método e execução.",
      education: [
        "Administração de Empresas",
        "MBA em Gestão de Negócios",
        "Especialização em RH e Coaching"
      ],
      specialties: [
        "Desenvolvimento Humano e Organizacional (DHO)",
        "Gestão de Carreira e Talentos",
        "Consultoria de Negócios",
        "Acompanhamento de Performance"
      ],
      timeline: [
        { year: "2008", title: "Empreendedorismo Familiar", description: "Início da jornada empreendedora." },
        { year: "2013", title: "Projetos Educacionais", description: "Atuação em Gov-SP, Hertft e Itaú." },
        { year: "2016", title: "Inteligência de Mercado", description: "Passagens por IDC e H. Strattner." },
        { year: "2019", title: "RH e DHO Estratégico", description: "Atuação central na Acer, Samsung e Smart Beauty.", isHighlight: true },
        { year: "2025", title: "BPlen Consultoria", description: "Fundação da BPlen para transformar o mercado de DHO." }
      ],
      results: [
        "Contribuição decisiva para conquista do selo GPTW",
        "eNPS (Satisfação de Colaboradores) acima de 80%",
        "Aumento de 50% na agilidade dos processos de RH",
        "Entrega de projetos com NPS médio de 4.8"
      ],
      behavioralProfile: {
        title: "DISC: Influência e Dominância",
        description: "Perfil voltado à liderança inspiradora e foco em resultados, combinando comunicação assertiva com visão sistêmica de negócio."
      }
    }
  }
};
