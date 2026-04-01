import { HeroSection } from "@/components/home/HeroSection";
import { AboutSection } from "@/components/home/AboutSection";
import { ValuesSection } from "@/components/home/ValuesSection";
import { ScenarioSection } from "@/components/home/ScenarioSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { FinalCTA } from "@/components/home/FinalCTA";
import { BookingSection } from "@/components/home/BookingSection";
import { HomeFooter } from "@/components/home/HomeFooter";
import { ParticleNexus } from "@/components/home/ParticleNexus";
import { FloatingCTAs } from "@/components/layout/FloatingCTAs";
import { SocialSidebar } from "@/components/layout/SocialSidebar";

/**
 * HOME DA CONSULTORIA BPLEN 🚀
 * Landing Page de entrada com estilo Dark Premium fixo.
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white relative isolate overflow-x-hidden theme-dark">
      
      {/* 
        ========================================
         [SEÇÕES DA VITRINE]
         Abaixo injetaremos as seções modulares 
        ========================================
      */}

      {/* 1. O Herói (A grande entrada) */}
      <HeroSection />

      {/* 2. Quem Somos & Fundadora (HRBP / História / Timeline) */}
      <AboutSection />

      {/* 4. Nossos Valores (Pilares de Atuação) */}
      <ValuesSection />

      {/* 5. O Cenário Atual (Desafios) */}
      <ScenarioSection />

      {/* 6. Nossos Serviços (A Tríade de Soluções) */}
      <ServicesSection />

      {/* 7. Diferenciais (As 4 Forças BPlen) */}
      <FeaturesSection />

      {/* 8. Agendamento Público (Conversão Direta Integrada) */}
      <BookingSection />

      {/* 9. CTA Final (Resumo de Conversão) */}
      <FinalCTA />

      {/* 8. Rodapé Minimalista (Final da Jornada) */}
      <HomeFooter />

      {/* 🛰️ Menu de Ações Fixo (Global Top Right) */}
      <FloatingCTAs />

      {/* 👻 Sidebar de Redes Sociais (Global Left) */}
      <SocialSidebar />

      {/* 🌌 Camada Global de Partículas (Revelação por Mouse) */}
      <ParticleNexus />
      
    </main>
  );
}
