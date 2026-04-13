"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Target, Brain, CalendarDays, Briefcase, BookOpen, FolderOpen, Sparkles
} from "lucide-react";
import { HomeFooter } from "@/components/home/HomeFooter";
import { useJourney } from "@/hooks/useJourney";
import { JourneyNav } from "@/components/journey/JourneyNav";
import { GuidedTourOverlay, TourStep } from "@/components/shared/GuidedTourOverlay";

/**
 * BPlen Guided Labs — Onboarding Prototype 🧪🧬
 * Página de testes para a coreografia do tour cinematográfico com blur progressivo.
 */
export default function GuidedLabsPage() {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [revealedSections, setRevealedSections] = useState<string[]>([]);
  
  const { stages, progress, loading, getStageTelemetry } = useJourney("mock-user-id");
  const [activeStageId, setActiveStageId] = useState<string>("onboarding");

  // Roteiro do Onboarding 🎬
  const tourSteps: TourStep[] = [
    {
      title: "Boas-vindas a Área de Membro da BPlen HUB.",
      content: "{User_Nickname}, esse é o novo espaço para você gerenciar o desenvolvimento da sua carreira profissional. Nos próximos segundos, vou te guiar pelos módulos mais importantes para você se ambientar e aproveitar ao máximo cada recurso disponível!",
      buttonLabel: "Ok, vamos nessa!"
    },
    {
      targetId: "labs-journey-nav",
      title: "Sua Jornada de Membro",
      content: "Aqui você acompanha a evolução da sua Jornada como Membro BPlen. Cada ícone representa um Passo a diante, e à medida que você avança, novos conteúdos e ferramentas são desbloqueados automaticamente, enquanto o seu progresso é medido em tempo real.",
      buttonLabel: "Agora eu sei onde ver a minha jornada. Vamos para o próximo módulo."
    },
    {
      targetId: "labs-carreira",
      title: "Gestão de Carreira",
      content: "{User_Nickname}, esse é o coração da SUA trajetória. Aqui você terá a visão geral da evolução da sua Carreira Profissional, através de seus planos individuais, metas, análise de progressão e melhoria, com foco aos seus Objetivos de Carreira.",
      buttonLabel: "Mal vejo a hora de iniciar a Gestão da Minha carreira"
    },
    {
      targetId: "labs-agenda",
      title: "Sua Agenda BPlen",
      content: "Essa é a visualização geral da sua Agenda BPlen. Aqui você terá consolidado o histórico e planejamento da sua agenda conosco como: os 1 to 1, sessões de feedback, desenvolvimento de carreira e mentoria. Após a conclusão de cada agenda, será disponibilizada uma ata e um espaço para você avaliar a sua experiência.",
      buttonLabel: "Entendi"
    },
    {
      targetId: "labs-assessments",
      title: "Perfil & Assessments",
      content: "Nesta área, organizaremos os resultados das suas análises comportamentais. Cada assessment (como DISC e Gestão do Tempo) contribuirá para o melhor planejamento e desenvolvimento do seu perfil profissional.",
      buttonLabel: "Espero descobrir meu perfil profissional logo! Me leve para o próximo módulo."
    },
    {
      targetId: "labs-trilha",
      title: "Trilha de Desenvolvimento",
      content: "Essa é a trilha de checkpoints da sua jornada. Cada etapa possui checkpoints para apoiar o seu Desenvolvimento de Carreira de forma progressiva, respeitando o seu ritmo e conectando teoria à prática.",
      buttonLabel: "Entendi"
    },
    {
      targetId: "labs-conteudo",
      title: "Conteúdo & Recursos",
      content: "Aqui acontece a troca de conhecimento entre a BPlen e você: Materiais, ferramentas, frameworks, vídeos e leituras recomendadas. Tudo projetado especificamente para o seu processo de desenvolvimento.",
      buttonLabel: "Tenho tudo o que preciso para iniciar a minha jornada BPlen."
    },
    {
      title: "Primeiro Checkpoint Concluído!",
      content: "{User_Nickname}, parabéns! Você está pronto para dar mais um passo a diante e seguir para o seu Check-In como Membro Oficial BPlen! Basta clicar em \"Fazer Check-in\" para dar continuidade na sua jornada.",
      buttonLabel: "Fazer Check-in",
      action: () => {
        // TODO: Atualizar checkpoint "introducao" do step "onboarding" no Firestore
        console.log("✅ [Tour] Checkpoint 'introducao' concluído!");
        setIsTourOpen(false);
      }
    }
  ];

  // Blur helper
  const getSectionStyle = (sectionId: string) => ({
    filter: isTourOpen && !revealedSections.includes(sectionId) ? "blur(12px)" : "blur(0px)",
    transition: "filter 0.8s ease-out",
    pointerEvents: (isTourOpen && !revealedSections.includes(sectionId) ? "none" : "auto") as React.CSSProperties["pointerEvents"]
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsTourOpen(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleTourComplete = () => {
    setIsTourOpen(false);
    setRevealedSections([]);
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      
      {/* O Motor Coreográfico */}
      <GuidedTourOverlay 
        steps={tourSteps} 
        isOpen={isTourOpen} 
        onComplete={handleTourComplete}
        onReveal={(ids) => setRevealedSections(ids)}
        userName="Membro"
      />

      <div className="max-w-[1400px] mx-auto pt-[10px] px-6 pb-6 md:pt-[10px] md:px-12 md:pb-12 space-y-12 flex-1 w-full">
        
        <header className="flex justify-between items-center mb-12">
           <div className="flex items-center gap-3 bg-pink-500/10 px-4 py-2 rounded-full border border-pink-500/20">
              <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">Guided Labs (Prototype)</span>
           </div>
           <button 
             onClick={() => { setRevealedSections([]); setIsTourOpen(true); }}
             className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)] hover:underline"
           >
              Reiniciar Tour
           </button>
        </header>

        {/* 1. Jornada */}
        <section id="labs-journey-nav" style={getSectionStyle("labs-journey-nav")} className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[3.5rem] p-10 md:p-14 relative overflow-visible shadow-sm">
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

        {/* 2. Gestão de Carreira (Novo placeholder) */}
        <section id="labs-carreira" style={getSectionStyle("labs-carreira")} className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[3.5rem] p-10 md:p-14 shadow-sm">
           <div className="space-y-8">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-500">
                    <Briefcase size={20} />
                 </div>
                 <div className="flex flex-col text-left">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Gestão de Carreira</h3>
                    <p className="text-xs font-black text-[var(--text-primary)] tracking-tight mt-1">Planos, Metas & Progressão</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="h-32 bg-[var(--input-bg)]/20 border border-dashed border-[var(--border-primary)] rounded-[2.5rem] flex items-center justify-center italic text-[10px] text-[var(--text-muted)]">
                    Plano Individual
                 </div>
                 <div className="h-32 bg-[var(--input-bg)]/20 border border-dashed border-[var(--border-primary)] rounded-[2.5rem] flex items-center justify-center italic text-[10px] text-[var(--text-muted)]">
                    Objetivos & Metas
                 </div>
                 <div className="h-32 bg-[var(--input-bg)]/20 border border-dashed border-[var(--border-primary)] rounded-[2.5rem] flex items-center justify-center italic text-[10px] text-[var(--text-muted)]">
                    Análise de Progressão
                 </div>
              </div>
           </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8">
          {/* 4. Assessments */}
          <aside id="labs-assessments" style={getSectionStyle("labs-assessments")} className="space-y-6">
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

          {/* 3. Agenda */}
          <div id="labs-agenda" style={getSectionStyle("labs-agenda")} className="space-y-8 flex flex-col">
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

        {/* 5. Trilha */}
        <section id="labs-trilha" style={getSectionStyle("labs-trilha")} className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[3.5rem] p-10 md:p-14 shadow-sm">
           <div className="space-y-8">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-500">
                    <BookOpen size={20} />
                 </div>
                 <div className="flex flex-col text-left">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Trilha de Desenvolvimento</h3>
                    <p className="text-xs font-black text-[var(--text-primary)] tracking-tight mt-1">Checkpoints da sua Jornada</p>
                 </div>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4">
                 {["Onboarding", "Preparação", "Análise", "Plano", "Desenvolvimento"].map((step, i) => (
                   <div key={i} className="flex-shrink-0 w-40 h-28 bg-[var(--input-bg)]/20 border border-[var(--border-primary)] rounded-[2rem] flex flex-col items-center justify-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black ${i === 0 ? "bg-green-500/20 text-green-500" : "bg-[var(--text-muted)]/10 text-[var(--text-muted)]"}`}>{i + 1}</div>
                      <span className="text-[9px] font-bold text-[var(--text-muted)]">{step}</span>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* 6. Conteúdo & Recursos */}
        <section id="labs-conteudo" style={getSectionStyle("labs-conteudo")} className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[3.5rem] p-10 md:p-14 shadow-sm">
           <div className="space-y-8">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-500">
                    <FolderOpen size={20} />
                 </div>
                 <div className="flex flex-col text-left">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Conteúdo & Recursos</h3>
                    <p className="text-xs font-black text-[var(--text-primary)] tracking-tight mt-1">Materiais & Frameworks</p>
                 </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {["Materiais", "Frameworks", "Vídeos", "Leituras"].map((item, i) => (
                   <div key={i} className="h-24 bg-[var(--input-bg)]/20 border border-dashed border-[var(--border-primary)] rounded-[2rem] flex items-center justify-center italic text-[10px] text-[var(--text-muted)]">
                      {item}
                   </div>
                 ))}
              </div>
           </div>
        </section>

      </div>
      <HomeFooter />
    </div>
  );
}
