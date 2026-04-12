"use client";

import React from "react";
import { SubStepConfig } from "@/types/journey";
import { Loader2, FileText, CheckCircle2, AlertCircle, PlayCircle, Calendar, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <div className="flex-1 flex flex-col items-center justify-center p-16 bg-[var(--input-bg)]/5 rounded-[3.5rem] border border-dashed border-[var(--border-primary)] opacity-40">
        <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mb-6">
           <AlertCircle size={24} className="text-[var(--text-muted)]" />
        </div>
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-[var(--text-primary)]">Conteúdo Bloqueado</h3>
        <p className="text-[10px] font-medium text-[var(--text-muted)] mt-2 text-center max-w-xs">
           Esta parte da jornada será liberada assim que você concluir os passos anteriores.
        </p>
      </div>
    );
  }

  const renderContent = () => {
    switch (substep.type) {
      case "content":
        return (
          <div className="flex-1 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                      <PlayCircle size={18} />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500/high">Conteúdo Educativo</span>
                </div>
                <h2 className="text-3xl font-black tracking-tight">{substep.title}</h2>
                <p className="text-[12px] font-medium text-[var(--text-muted)] max-w-xl leading-relaxed">{substep.description}</p>
             </div>
             
             <div className="aspect-video w-full rounded-[3rem] bg-black/40 border border-white/5 flex items-center justify-center relative group overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <PlayCircle size={64} className="text-white opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 z-10" />
                <div className="absolute bottom-8 left-8 z-10 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 text-white">
                   <p className="text-[10px] font-black uppercase tracking-widest">Aperte o Play para iniciar</p>
                </div>
             </div>

             <div className="flex justify-end pt-4">
                <button 
                  onClick={onComplete}
                  className="px-10 py-4 bg-[var(--accent-start)] text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[var(--accent-start)]/20"
                >
                  Marcar como Concluído
                </button>
             </div>
          </div>
        );

      case "form":
      case "survey":
        const isSurvey = substep.type === "survey";
        return (
          <div className="flex-1 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center",
                      isSurvey ? "bg-purple-500/10 text-purple-500" : "bg-emerald-500/10 text-emerald-500"
                   )}>
                      {isSurvey ? <ClipboardCheck size={18} /> : <FileText size={18} />}
                   </div>
                   <span className={cn(
                      "text-[10px] font-black uppercase tracking-[0.3em]",
                      isSurvey ? "text-purple-500" : "text-emerald-500"
                   )}>
                      {isSurvey ? "Diagnóstico Estratégico" : "Formulário BPlen"}
                   </span>
                </div>
                <h2 className="text-3xl font-black tracking-tight">{substep.title}</h2>
                <p className="text-[12px] font-medium text-[var(--text-muted)] max-w-xl leading-relaxed">{substep.description}</p>
             </div>
             
             <div className="p-16 border border-[var(--border-primary)] rounded-[3.5rem] bg-[var(--input-bg)]/20 flex flex-col items-center justify-center text-center gap-8 shadow-inner">
                <div className={cn(
                   "w-20 h-20 rounded-[2rem] flex items-center justify-center text-white shadow-xl",
                   isSurvey ? "bg-purple-600" : "bg-emerald-600"
                )}>
                   {isSurvey ? <ClipboardCheck size={32} /> : <FileText size={32} />}
                </div>
                <div className="space-y-2">
                   <p className="text-[12px] font-black uppercase tracking-widest">{isSurvey ? "Análise Pronta para Iniciar" : "Aguardando Preenchimento"}</p>
                   <p className="text-[10px] font-medium text-[var(--text-muted)] max-w-xs mx-auto">
                      {isSurvey ? "Responda sinceramente para obter os melhores insights." : "Complete as informações necessárias para este estágio."}
                   </p>
                </div>
                <button 
                  onClick={onComplete}
                  className="px-10 py-4 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl"
                >
                  {isSurvey ? "Iniciar Avaliação" : "Preencher Formulário"}
                </button>
             </div>
          </div>
        );

      case "booking":
        return (
          <div className="flex-1 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                      <Calendar size={18} />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">Agendamento</span>
                </div>
                <h2 className="text-3xl font-black tracking-tight">{substep.title}</h2>
                <p className="text-[12px] font-medium text-[var(--text-muted)] max-w-xl leading-relaxed">Selecione o melhor horário para sua sessão individual com nossos especialistas.</p>
             </div>
             
             <div className="flex-1 border border-[var(--border-primary)] rounded-[3rem] bg-[var(--input-bg)]/20 overflow-hidden flex flex-col items-center justify-center py-20 px-8">
                <Calendar size={48} className="text-amber-500/20 mb-6" />
                <p className="text-[12px] font-black uppercase tracking-widest mb-8">Calendário Integrado</p>
                <button 
                   onClick={onComplete}
                   className="px-10 py-4 bg-amber-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all"
                >
                   Escolher Horário
                </button>
             </div>
          </div>
        );

      case "result":
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-16 bg-blue-500/5 rounded-[3.5rem] border border-blue-500/10 animate-in zoom-in duration-700">
             <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mb-8 relative">
                <CheckCircle2 size={40} className="text-blue-500" />
                <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse" />
             </div>
             <h3 className="text-xl font-black tracking-tight">Análise Concluída!</h3>
             <p className="text-[11px] font-medium text-[var(--text-muted)] mt-2 text-center max-w-xs leading-relaxed">
                Seus insights estratégicos já foram processados e estão prontos para visualização.
             </p>
             <button 
                onClick={onComplete}
                className="mt-10 px-10 py-4 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20"
             >
                Ver Relatório Completo
             </button>
          </div>
        );

      default:
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-20">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--accent-start)]" />
            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] opacity-50">Sincronizando Experiência...</p>
          </div>
        );
    }
  };

  return <div className="flex-1 flex flex-col h-full min-h-[500px]">{renderContent()}</div>;
}
