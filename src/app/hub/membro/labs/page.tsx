"use client";

import React, { useState, useEffect } from "react";
import { TriadDonutChart } from "@/components/hub/TriadDonutChart";
import { StackedBarChart } from "@/components/hub/StackedBarChart";
import { DiscChart } from "@/components/hub/DiscChart";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  Sparkles, 
  Heart, 
  Target, 
  Brain, 
  CalendarDays,
  Eye,
  Briefcase,
  Compass
} from "lucide-react";
import { HomeFooter } from "@/components/home/HomeFooter";
import { useJourney } from "@/hooks/useJourney";
import { JourneyNav } from "@/components/journey/JourneyNav";
import { GuidedTourOverlay, TourStep } from "@/components/shared/GuidedTourOverlay";

/**
 * BPlen Guided Labs — Onboarding Prototype 🧪🧬
 * Página de testes para a coreografia do tour cinematográfico.
 */
export default function GuidedLabsPage() {
  const [isTourOpen, setIsTourOpen] = useState(false);
  
  // Mocks para o Dashboard (Espelho)
  const { stages, progress, loading, getStageTelemetry } = useJourney("mock-user-id");
  const [activeStageId, setActiveStageId] = useState<string>("onboarding");

  // Roteiro do Onboarding 🎬✨
  const tourSteps: TourStep[] = [
    {
      title: "Boas-vindas ao BPlen Labs",
      content: "Este é o seu novo centro de inteligência biográfica. Nos próximos segundos, vou guiar você pelos fundamentos desta interface clínica.",
    },
    {
      targetId: "labs-journey-nav",
      title: "Telemetria de Evolução",
      content: "Aqui você acompanha sua jornada oficial. Cada ícone representa um degrau da sua evolução e o 'farol' superior indica se o serviço já está liberado para você via Admin.",
    },
    {
      targetId: "labs-assessments",
      title: "Lâminas de Laboratório",
      content: "Nesta coluna lateral, organizamos seus resultados de forma metódica. Cada assessment (DISC, Tríade, etc.) é uma lâmina de vidro para análise do seu perfil estratégico.",
    },
    {
      targetId: "labs-agenda",
      title: "Sua Agenda 1 to 1",
      content: "É aqui que a mágica acontece. Seus encontros agendados com mentores e as entregas de feedbacks aparecem consolidadas para sua organização.",
    },
    {
      title: "Pronto para Explorar?",
      content: "O tour terminou. Agora você tem liberdade total para navegar. Sinta-se à vontade para mergulhar nos seus dados.",
      action: () => setIsTourOpen(false)
    }
  ];

  useEffect(() => {
    // Início automático para testes
    const timer = setTimeout(() => setIsTourOpen(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative">
      
      {/* O Motor Coreográfico */}
      <GuidedTourOverlay 
        steps={tourSteps} 
        isOpen={isTourOpen} 
        onComplete={() => setIsTourOpen(false)} 
      />

      <div className="max-w-[1400px] mx-auto p-6 md:p-12 space-y-12 flex-1 w-full opacity-100">
        
        <header className="flex justify-between items-center mb-12">
           <div className="flex items-center gap-3 bg-pink-500/10 px-4 py-2 rounded-full border border-pink-500/20">
              <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">Guided Labs (Prototype)</span>
           </div>
           <button 
             onClick={() => setIsTourOpen(true)}
             className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)] hover:underline"
           >
              Reiniciar Tour
           </button>
        </header>

        {/* Dashboard Mirror Structure */}
        <section id="labs-journey-nav" className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[3.5rem] p-10 md:p-14 relative overflow-visible shadow-sm">
            <div className="relative z-10 space-y-8">
               <div className="space-y-4">
                  <div className="flex items-center gap-2.5 text-[var(--accent-start)]">
                     <Target size={18} className="animate-pulse" />
                     <span className="text-[10px] font-black uppercase tracking-[0.4em]">Jornada de Membro BPlen</span>
                  </div>
                  <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Dashboard do seu desenvolvimento</h2>
               </div>
               <div className="pt-4">
                  <JourneyNav 
                    stages={stages}
                    currentStepId={activeStageId} 
                    stepStatusMap={{}}
                    getStageTelemetry={getStageTelemetry}
                  />
               </div>
            </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8">
          {/* Barra Lateral IDs para o Spotlight */}
          <aside id="labs-assessments" className="space-y-6">
            <div className="p-8 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[3.5rem] space-y-8 shadow-sm">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-500">
                     <Brain size={20} />
                  </div>
                  <div className="flex flex-col text-left">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Perfil & Assessments</h3>
                     <p className="text-xs font-black text-[var(--text-primary)] tracking-tight mt-1">Análise Metódica</p>
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="h-40 bg-[var(--input-bg)]/20 border border-[var(--border-primary)] rounded-[2.5rem] flex items-center justify-center italic text-[10px] text-[var(--text-muted)]">
                     Lâmina 01: Comportamental DISC
                  </div>
                  <div className="h-40 bg-[var(--input-bg)]/20 border border-[var(--border-primary)] rounded-[2.5rem] flex items-center justify-center italic text-[10px] text-[var(--text-muted)]">
                     Lâmina 02: Gestão do Tempo
                  </div>
               </div>
            </div>
          </aside>

          {/* Coluna Agenda */}
          <div id="labs-agenda" className="space-y-8 flex flex-col">
             <div className="p-8 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[2.5rem] space-y-6 shadow-sm">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-[var(--accent-start)]/10 rounded-2xl border border-[var(--accent-start)]/20 text-[var(--accent-start)]">
                      <CalendarDays size={20} />
                   </div>
                   <div className="flex flex-col text-left">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Sua agenda BPlen</h3>
                      <p className="text-xs font-black text-[var(--text-primary)] tracking-tight mt-1">1 to 1 & Sessões</p>
                   </div>
                </div>
                <div className="h-64 bg-[var(--input-bg)]/20 border border-dashed border-[var(--border-primary)] rounded-[2.5rem] flex items-center justify-center text-[10px] text-[var(--text-muted)] italic">
                    Área reservada para compromissos agendados.
                </div>
             </div>
          </div>
        </div>
      </div>
      <HomeFooter />
    </div>
  );
}
