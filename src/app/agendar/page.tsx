import React from "react";
import { PublicBookingFlow } from "@/components/ui/PublicBookingFlow";
import { ParticleNexus } from "@/components/home/ParticleNexus";

export const metadata = {
  title: "Agendar Conversa | BPlen HUB",
  description: "Reserve uma reunião estratégica de 30 minutos com a equipe BPlen.",
};

/**
 * AgendarPage (Página de Conversão Direta 🎯)
 * Página minimalista e focada 100% no fluxo de agendamento.
 */
export default function AgendarPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden theme-dark font-sans">
      
      {/* 🌌 Background Dinâmico */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#667eea15,transparent_50%)]" />

      <div className="z-10 w-full max-w-4xl py-20">


         {/* 📅 O Motor de Agendamento */}
         <div className="px-2">
            <PublicBookingFlow />
         </div>

         <div className="mt-20 text-center">
            <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.3em]">BPlen — Hub de Excelência</p>
         </div>
      </div>

      {/* 🔮 Efeito Visual de Partículas */}
      <ParticleNexus />
    </main>
  );
}
