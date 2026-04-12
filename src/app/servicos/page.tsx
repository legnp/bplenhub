import React from "react";
import { Metadata } from "next";
import { 
  User, 
  Users, 
  Handshake, 
  ChevronRight, 
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { ParticleNexus } from "@/components/home/ParticleNexus";
import { HomeFooter } from "@/components/home/HomeFooter";
import { FloatingCTAs } from "@/components/layout/FloatingCTAs";
import { SocialSidebar } from "@/components/layout/SocialSidebar";
import { LANDING_TOKENS } from "@/constants/landing-tokens";

export const metadata: Metadata = {
  title: "Categorias de Serviços | BPlen HUB",
  description: "Selecione seu perfil para conferir nossas soluções em Desenvolvimento Humano.",
};

const audiences = [
  {
    id: "pessoas",
    title: "Para Pessoas",
    subtitle: "Desenvolvimento Individual",
    description: "Metodologias ágeis de carreira, liderança e autoconhecimento para você chegar ao próximo nível.",
    icon: <User className="w-10 h-10 text-[#ff0080]" />,
    color: "from-[#ff0080]/10 to-transparent",
    slug: "/servicos/pessoas"
  },
  {
    id: "empresas",
    title: "Para Empresas",
    subtitle: "HRBP as a Service",
    description: "Transformamos o seu RH em um parceiro estratégico para escalar performance, cultura e resultados.",
    icon: <Users className="w-10 h-10 text-[#667eea]" />,
    color: "from-[#667eea]/10 to-transparent",
    slug: "/servicos/empresas"
  },
  {
    id: "parceiros",
    title: "Para Parceiros",
    subtitle: "Sinergia de alto valor",
    description: "Projetos especiais, palestras e parcerias para transformar o mercado de desenvolvimento juntos.",
    icon: <Handshake className="w-10 h-10 text-[#ff0080]" />,
    color: "from-[#ff0080]/10 to-transparent",
    slug: "/servicos/parceiros"
  }
];

/**
 * Gatekeeper Services Page — BPlen HUB 🧬
 * Ponto de entrada para segmentação do público-alvo.
 */
export default function ServicesGatekeeperPage() {
  return (
    <main className="min-h-screen bg-black text-white relative isolate overflow-x-hidden theme-dark">
      
      {/* Glows Decorativos */}
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#ff0080] rounded-full blur-[180px] opacity-[0.05] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#667eea] rounded-full blur-[180px] opacity-[0.05] pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="pt-[60px] pb-[60px] px-6">
        <div className={LANDING_TOKENS.container}>
          <div className={LANDING_TOKENS.header.centered}>
            <span className={LANDING_TOKENS.header.kicker}>Ecossistema de Soluções</span>
            <h1 className={LANDING_TOKENS.header.title}>
              Como podemos <span className="text-gray-500">te apoiar hoje?</span>
            </h1>
            <p className={LANDING_TOKENS.header.descriptionCentered}>
              Selecione o seu perfil para visualizar as soluções customizadas que preparamos para a sua jornada.
            </p>
          </div>
        </div>
      </section>

      {/* Audience Selection Grid */}
      <section className="pb-32 px-6">
        <div className={LANDING_TOKENS.container}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {audiences.map((audience) => (
              <Link 
                key={audience.id}
                href={audience.slug}
                className={`${LANDING_TOKENS.card.container} group relative flex flex-col justify-between h-full bg-gradient-to-b ${audience.color} hover:border-[#ff0080]/30 transition-all border border-white/5`}
              >
                <div className="space-y-6">
                  <div className="p-5 bg-white/5 rounded-[2rem] w-fit group-hover:bg-white/10 transition-colors">
                    {audience.icon}
                  </div>
                  <div>
                    <span className={LANDING_TOKENS.card.kicker}>{audience.subtitle}</span>
                    <h3 className="text-3xl font-black tracking-tighter mt-2">{audience.title}</h3>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed font-bold tracking-tight opacity-70">
                    {audience.description}
                  </p>
                </div>

                <div className="mt-12 flex items-center justify-between text-[#ff0080] font-black text-[10px] uppercase tracking-widest group-hover:gap-4 transition-all">
                   Ver Soluções
                   <ArrowRight size={18} className="translate-x-[-10px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HomeFooter />
      <FloatingCTAs />
      <SocialSidebar />
      <ParticleNexus />
      
    </main>
  );
}
