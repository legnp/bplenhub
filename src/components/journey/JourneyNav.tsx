"use client";

import React from "react";
import { JOURNEY_STAGES } from "@/config/journey/steps-registry";
import { StepStatus } from "@/types/journey";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface JourneyNavProps {
  currentStepId: string;
  stepStatusMap: Record<string, StepStatus>;
  onSelectStep?: (stepId: string) => void;
}

export function JourneyNav({ currentStepId, stepStatusMap, onSelectStep }: JourneyNavProps) {
  const currentStepIndex = JOURNEY_STAGES.findIndex(s => s.id === currentStepId);

  return (
    <div className="w-full overflow-hidden py-8 px-4">
      <div className="max-w-6xl mx-auto relative">
        {/* Linha de Conexão de Fundo */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[var(--border-primary)] -translate-y-1/2 opacity-20" />
        
        {/* Linha de Progresso Ativo */}
        <motion.div 
          className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] -translate-y-1/2"
          initial={{ width: 0 }}
          animate={{ width: `${(Math.max(0, currentStepIndex) / (JOURNEY_STAGES.length - 1)) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />

        <div className="flex justify-between items-center relative z-10">
          {JOURNEY_STAGES.map((stage, index) => {
            const status = stepStatusMap[stage.id] || "locked";
            const isCompleted = status === "completed";
            const isCurrent = stage.id === currentStepId;
            
            // Renderização segura do ícone Lucide
            const IconName = stage.icon as keyof typeof LucideIcons;
            const IconComponent = (LucideIcons[IconName] as any) || LucideIcons.Circle;

            const Wrapper = onSelectStep ? "div" : Link;
            const wrapperProps = onSelectStep 
              ? { onClick: () => onSelectStep(stage.id), role: "button" } 
              : { href: `/hub/membro/journey/${stage.id}` };

            return (
              <div key={stage.id} className="flex flex-col items-center group">
                {/* Botão do Step (Interativo ou Link) */}
                <Wrapper
                  {...(wrapperProps as any)}
                  className={cn(
                    "relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                    "glass-morphism border overflow-visible cursor-pointer",
                    isCurrent 
                      ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-110" 
                      : isCompleted
                      ? "border-[var(--success-primary)]/50 bg-[var(--success-primary)]/5 text-[var(--success-primary)]"
                      : "border-[var(--border-primary)] text-[var(--text-secondary)] opacity-60 hover:opacity-100 hover:border-[var(--accent-primary)]/40",
                    status === "locked" && "pointer-events-none opacity-30 grayscale"
                  )}
                >
                  {isCompleted ? (
                    <LucideIcons.Check className="w-5 h-5 animate-in zoom-in duration-300" />
                  ) : (
                    <IconComponent className={cn(
                      "w-5 h-5",
                      isCurrent && "animate-pulse"
                    )} />
                  )}

                  {/* Tooltip Lateral/Superior */}
                  <div className={cn(
                    "absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all duration-300 pointer-events-none text-[9px] font-black uppercase tracking-widest",
                    "bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-xl z-50",
                    isCurrent ? "opacity-100 -translate-y-2 scale-100" : "opacity-0 translate-y-2 scale-90"
                  )}>
                    {stage.title}
                  </div>
                </Wrapper>

                {/* Info Text Inferior (Opcional - Escondido Mobile) */}
                <div className="mt-4 text-center max-w-[120px] hidden lg:block">
                  <p className={cn(
                    "text-[8px] uppercase tracking-[0.2em] font-black transition-colors",
                    isCurrent ? "text-[var(--accent-primary)]" : "text-[var(--text-tertiary)]"
                  )}>
                    Etapa {index + 1}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
