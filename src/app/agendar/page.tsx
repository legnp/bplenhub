import React from "react";
import { PublicBookingFlow } from "@/components/ui/PublicBookingFlow";
import { HomeFooter } from "@/components/home/HomeFooter";
import { ParticleNexus } from "@/components/home/ParticleNexus";
import { FloatingCTAs } from "@/components/layout/FloatingCTAs";
import { SocialSidebar } from "@/components/layout/SocialSidebar";

export const metadata = {
  title: "Agendar Conversa | BPlen HUB",
  description: "Reserve uma reunião estratégica de 30 minutos com a equipe BPlen.",
};

/**
 * PÁGINA DE AGENDAMENTO PÚBLICO (1 TO 1) 📅
 * Herda o layout premium da Home para consistência de marca.
 */
export default function AgendarPage() {
  return (
    <main className="min-h-screen bg-black text-white relative isolate overflow-x-hidden theme-dark font-sans">
      
      {/* 🌌 Camada Global de Partículas (Herança da Home) */}
      <ParticleNexus />

      <div className="z-10 w-full max-w-4xl mx-auto py-4 flex flex-col items-center justify-center min-h-[40vh]">
         {/* 📅 O Motor de Agendamento (Centralizado) */}
         <div className="w-full px-4">
            <PublicBookingFlow />
         </div>
      </div>

      {/* 🛰️ Navegação Global (Herança da Home) */}
      <FloatingCTAs />
      <SocialSidebar />

      {/* 8. Rodapé Minimalista (Herança da Home) */}
      <HomeFooter />

    </main>
  );
}
