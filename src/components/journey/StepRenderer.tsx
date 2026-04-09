"use client";

import React from "react";
import { SubStepConfig } from "@/types/journey";
import { Loader2, FileText, CheckCircle2, AlertCircle } from "lucide-react";

interface StepRendererProps {
  substep: SubStepConfig;
  status: "locked" | "available" | "current" | "completed";
  onComplete: () => void;
}

/**
 * BPlen HUB — StepRenderer 🧬🛡️
 * Orchestrator that renders the appropriate content type for a journey substep.
 */
export function StepRenderer({ substep, status, onComplete }: StepRendererProps) {
  if (status === "locked") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-[var(--input-bg)]/10 rounded-[2.5rem] border border-dashed border-[var(--border-primary)] opacity-50">
        <AlertCircle size={32} className="text-[var(--text-muted)] mb-4" />
        <h3 className="text-[10px] font-black uppercase tracking-widest">Conteúdo Bloqueado</h3>
        <p className="text-[9px] font-bold text-[var(--text-muted)] mt-2">Finalize as etapas anteriores para liberar este conteúdo.</p>
      </div>
    );
  }

  // Placeholder logic for different content types
  // In the future, this will import real engines (SurveyEngine, FormEngine, etc)
  const renderContent = () => {
    switch (substep.type) {
      case "survey":
        return (
          <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="flex flex-col gap-3">
                <span className="px-3 py-1 bg-purple-500/10 text-purple-600 border border-purple-500/20 rounded-full text-[8px] font-black uppercase tracking-widest w-fit">Avaliação Estratégica</span>
                <h2 className="text-xl font-black">{substep.title}</h2>
                <p className="text-[10px] font-bold text-[var(--text-muted)] max-w-lg leading-relaxed">{substep.description || "Responda as perguntas abaixo para prosseguirmos com sua jornada."}</p>
             </div>
             
             {/* Mocking the Experience */}
             <div className="p-12 border border-[var(--border-primary)] rounded-[2.5rem] bg-[var(--input-bg)]/20 flex flex-col items-center justify-center text-center gap-6">
                <div className="w-16 h-16 bg-[var(--accent-start)]/10 rounded-3xl flex items-center justify-center text-[var(--accent-start)]">
                   <FileText size={24} />
                </div>
                <p className="text-[11px] font-medium leading-relaxed max-w-xs text-[var(--text-muted)] italic">
                  "Este é um placeholder para o engine de Survey ({substep.referenceId})."
                </p>
                <button 
                  onClick={onComplete}
                  className="px-8 py-3 bg-[var(--accent-start)] text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[var(--accent-start)]/20"
                >
                  Concluir e Próximo
                </button>
             </div>
          </div>
        );

      case "result":
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-12 bg-green-500/5 rounded-[2.5rem] border border-green-500/10">
             <CheckCircle2 size={32} className="text-green-500 mb-4" />
             <h3 className="text-[10px] font-black uppercase tracking-widest">Resultado Disponível</h3>
             <p className="text-[9px] font-bold text-[var(--text-muted)] mt-2">Seus resultados para {substep.referenceId} já foram processados.</p>
             <button 
                onClick={onComplete}
                className="mt-6 px-8 py-3.5 bg-green-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest"
             >
                Ver Insights
             </button>
          </div>
        );

      default:
        return (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-start)]" />
            <p className="mt-4 text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Carregando Experiência {substep.type}...</p>
          </div>
        );
    }
  };

  return renderContent();
}
