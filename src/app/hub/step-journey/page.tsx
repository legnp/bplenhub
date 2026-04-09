"use client";

import React, { useState, useEffect } from "react";
import { JourneyNav } from "@/components/journey/JourneyNav";
import { JOURNEY_STEPS } from "@/config/journey/steps-registry";
import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/context/AuthContext";
import { getAdminDb } from "@/lib/firebase-admin"; // Note: Ops, this is for server. I'll use client SDK or a mock.

export default function StepJourneyPage() {
  const { user } = useAuthContext();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Efeito para simular carregamento de progresso ou buscar no futuro
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      // Simulação: se o usuário já fez login, o step 1 pode estar em progresso
      setCompletedSteps([]); 
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const currentStep = JOURNEY_STEPS[currentStepIndex];
  // @ts-ignore
  const IconComponent = LucideIcons[currentStep.icon as keyof typeof LucideIcons] || LucideIcons.Circle;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-t-[var(--accent-primary)] border-[var(--border-primary)] rounded-full animate-spin" />
        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)] animate-pulse">
          Mapeando sua Jornada...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header da Jornada */}
      <header className="mb-12 text-center md:text-left">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-[var(--accent-primary)]/20">
            Evolution Path
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[var(--text-primary)] mb-4">
            Sua Jornada de <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]">Excellence</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-sm md:text-base max-w-2xl leading-relaxed opacity-80">
            Acompanhe sua evolução através das 6 etapas estratificadas do ecossistema BPlen. 
            Cada fase foi desenhada para expandir sua performance e consciência estratégica.
          </p>
        </motion.div>
      </header>

      {/* Navegação da Jornada (Stepper) */}
      <section className="mb-12">
        <JourneyNav 
          currentStepIndex={currentStepIndex} 
          onStepClick={setCurrentStepIndex}
          completedSteps={completedSteps}
        />
      </section>

      {/* Container do Step Atual */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {/* Card de Foco Central */}
          <div className="lg:col-span-8 glass-morphism border border-[var(--border-primary)] rounded-[32px] p-8 md:p-12 shadow-2xl overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-primary)] opacity-[0.03] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:opacity-[0.06] transition-opacity duration-700" />
            
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <IconComponent className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent-primary)] mb-1">
                  Step {currentStep.order} of 6
                </p>
                <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
                  {currentStep.title}
                </h2>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)]/50 border-l-4 border-l-[var(--accent-primary)]">
                <p className="text-sm font-bold text-[var(--text-primary)] mb-2 italic">"{currentStep.subtitle}"</p>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                  {currentStep.description}
                </p>
              </div>

              {/* Mock de Sub-steps / Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-[var(--border-primary)] bg-white/5 flex items-center gap-4 group/item hover:border-[var(--accent-primary)]/40 transition-all cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center">
                    <LucideIcons.FileText className="w-4 h-4 text-[var(--text-secondary)]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-[var(--text-primary)]">Material de Apoio</p>
                    <p className="text-[9px] text-[var(--text-muted)]">PDF para leitura e estudo</p>
                  </div>
                  <LucideIcons.ArrowRight className="w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
                </div>

                <div className="p-4 rounded-xl border border-[var(--border-primary)] bg-white/5 flex items-center gap-4 group/item hover:border-[var(--accent-primary)]/40 transition-all cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center">
                    <LucideIcons.PlayCircle className="w-4 h-4 text-[var(--text-secondary)]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-[var(--text-primary)]">Vídeo Tutorial</p>
                    <p className="text-[9px] text-[var(--text-muted)]">Workshop de 15 minutos</p>
                  </div>
                  <LucideIcons.ArrowRight className="w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
                </div>
              </div>

              <div className="pt-6 flex flex-wrap gap-4">
                <button className="px-8 py-3.5 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl">
                  Iniciar Conteúdo
                </button>
                <button className="px-8 py-3.5 rounded-2xl glass-morphism border border-[var(--border-primary)] text-[var(--text-primary)] text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                  Concluir Etapa
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar / Contexto Lateral */}
          <div className="lg:col-span-4 space-y-6">
             <div className="glass-morphism border border-[var(--border-primary)] rounded-[24px] p-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <LucideIcons.Info className="w-4 h-4 text-[var(--accent-primary)]" />
                  Status da Jornada
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-bold px-2">
                    <span className="text-[var(--text-secondary)] uppercase">Progresso Geral</span>
                    <span className="text-[var(--accent-primary)]">{Math.round((completedSteps.length / JOURNEY_STEPS.length) * 100)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[var(--accent-primary)] transition-all duration-1000" 
                      style={{ width: `${(completedSteps.length / JOURNEY_STEPS.length) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] leading-relaxed px-2">
                    Complete as atividades obrigatórias para desbloquear a próxima fase da sua evolução.
                  </p>
                </div>
             </div>

             <div className="p-6 rounded-[24px] bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] border border-[var(--border-primary)] relative overflow-hidden group">
                <LucideIcons.HelpCircle className="absolute -bottom-4 -right-4 w-24 h-24 text-[var(--text-primary)] opacity-[0.03]" />
                <h3 className="text-xs font-black text-[var(--text-primary)] mb-2">Precisa de Suporte?</h3>
                <p className="text-[10px] text-[var(--text-secondary)] mb-4 leading-relaxed">
                  Dúvidas sobre o conteúdo desta etapa? Fale com seu Mentor dedicado através do canal oficial.
                </p>
                <button className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-widest hover:underline">
                  Abrir Chamado →
                </button>
             </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
