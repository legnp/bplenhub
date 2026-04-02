import React from "react";
import { Metadata } from "next";
import { 
  User, 
  Users, 
  Handshake, 
  ChevronRight, 
  CheckCircle2, 
  Rocket, 
  Target, 
  TrendingUp 
} from "lucide-react";
import Link from "next/link";
import { ParticleNexus } from "@/components/home/ParticleNexus";
import { HomeFooter } from "@/components/home/HomeFooter";
import { FloatingCTAs } from "@/components/layout/FloatingCTAs";
import { SocialSidebar } from "@/components/layout/SocialSidebar";
import { LANDING_TOKENS } from "@/constants/landing-tokens";

export const metadata: Metadata = {
  title: "Nossos Serviços | BPlen HUB",
  description: "Tríade de soluções em Desenvolvimento Humano para Pessoas, Empresas e Parceiros.",
};

const servicesList = [
  {
    category: "Para Pessoas",
    kicker: "Gestão de Carreira",
    icon: <User className="w-8 h-8 text-[#ff0080]" />,
    title: "Sua trajetória, \nnosso planejamento.",
    description: "Prepare-se para o seu próximo nível profissional com metodologias ágeis de desenvolvimento humano.",
    features: ["Mentoria Individual", "Assessment DISC", "Plano de Carreira", "Personal Branding"],
    color: "from-[#ff0080]/10 to-transparent"
  },
  {
    category: "Para Empresas",
    kicker: "HRBP as a Service",
    icon: <Users className="w-8 h-8 text-[#667eea]" />,
    title: "Cultura e Resultados \nem harmonia.",
    description: "Transformamos o seu RH em um parceiro estratégico de negócios para escalar performance e engajamento.",
    features: ["Implantação de DHO", "Diagnóstico de Clima", "Treinamento de Liderança", "Agilidade em RH"],
    color: "from-[#667eea]/10 to-transparent"
  },
  {
    category: "Para Parceiros",
    kicker: "Projetos em Conjunto",
    icon: <Handshake className="w-8 h-8 text-[#ff0080]" />,
    title: "Conectando forças, \ngerando valor.",
    description: "Projetos especiais e parcerias estratégicas para transformar o mercado de desenvolvimento.",
    features: ["Co-branding", "Workshops In Company", "Palestras", "Projetos Especiais"],
    color: "from-[#667eea]/10 to-transparent"
  }
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-black text-white relative isolate overflow-x-hidden theme-dark">
      
      {/* Glows Decorativos */}
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#ff0080] rounded-full blur-[180px] opacity-[0.05] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#667eea] rounded-full blur-[180px] opacity-[0.05] pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className={LANDING_TOKENS.container}>
          <div className={LANDING_TOKENS.header.centered}>
            <span className={LANDING_TOKENS.header.kicker}>Evolução Sistêmica</span>
            <h1 className={LANDING_TOKENS.header.title}>
              Nossas <span className="text-gray-500">Soluções</span>
            </h1>
            <p className={LANDING_TOKENS.header.descriptionCentered}>
              Uma tríade de serviços complementares desenhados para desbloquear o potencial humano 
              e impulsionar resultados sustentáveis.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="pb-32 px-6">
        <div className={LANDING_TOKENS.container}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {servicesList.map((service, idx) => (
              <div 
                key={idx} 
                className={`${LANDING_TOKENS.card.container} group flex flex-col h-full bg-gradient-to-b ${service.color}`}
              >
                <div className="mb-8 p-4 bg-white/5 rounded-2xl w-fit group-hover:bg-[#ff0080]/10 transition-colors">
                  {service.icon}
                </div>
                
                <span className={LANDING_TOKENS.card.kicker}>{service.kicker}</span>
                <h3 className={`${LANDING_TOKENS.card.title} whitespace-pre-line`}>
                  {service.title}
                </h3>
                <p className={`${LANDING_TOKENS.card.description} mb-12 flex-grow`}>
                  {service.description}
                </p>

                <ul className="space-y-4 mb-12">
                  {service.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-3 text-sm text-gray-300">
                      <CheckCircle2 size={16} className="text-[#ff0080]/60 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link 
                  href="/agendar"
                  className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm tracking-tight hover:bg-white/10 hover:border-[#ff0080]/30 transition-all flex items-center justify-center gap-2"
                >
                  INTERESSE NESSE SERVIÇO
                  <ChevronRight size={16} className="text-gray-500 group-hover:translate-x-1 duration-300" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Jornada Preview (Contexto para o HUB) */}
      <section className={LANDING_TOKENS.section}>
        <div className={LANDING_TOKENS.container}>
          <div className="p-12 rounded-[2.5rem] bg-gradient-to-r from-[#ff0080]/5 to-[#667eea]/5 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative">
            
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff0080] rounded-full blur-[100px] opacity-[0.05]" />
            
            <div className="max-w-xl space-y-6 relative z-10 text-center md:text-left">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold tracking-widest text-gray-400 border border-white/10 uppercase">
                Comece por aqui
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Você já conhece sua <span className="text-[#ff0080]">proposta de valor?</span>
              </h2>
              <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                No BPlen HUB, organizamos sua jornada de desenvolvimento com ferramentas 
                exclusivas e acompanhamento em tempo real. Cadastre-se para iniciar.
              </p>
            </div>

            <div className="shrink-0 relative z-10 w-full md:w-auto">
              <Link 
                href="/hub"
                className="inline-flex items-center justify-center gap-3 px-8 py-5 bg-white text-black font-black text-xs tracking-widest uppercase hover:scale-105 active:scale-95 transition-all w-full md:w-auto"
              >
                Acessar HUB Grátis <Rocket size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Rodapé e Elementos Globais */}
      <HomeFooter />
      <FloatingCTAs />
      <SocialSidebar />
      <ParticleNexus />
      
    </main>
  );
}
