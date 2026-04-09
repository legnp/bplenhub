"use client";

import React from "react";
import { JOURNEY_STEPS, JourneyStep } from "@/config/journey/steps-registry";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

interface JourneyNavProps {
  currentStepIndex: number;
  onStepClick: (index: number) => void;
  completedSteps: number[]; // Array de ordens ou IDs completados
}

export function JourneyNav({ currentStepIndex, onStepClick, completedSteps }: JourneyNavProps) {
  return (
    <div className="w-full overflow-hidden py-8 px-4">
      <div className="max-w-6xl mx-auto relative">
        {/* Linha de Conexão de Fundo */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[var(--border-primary)] -translate-y-1/2 opacity-20" />
        
        {/* Linha de Progresso Ativo */}
        <motion.div 
          className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] -translate-y-1/2"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStepIndex / (JOURNEY_STEPS.length - 1)) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />

        <div className="flex justify-between items-center relative z-10">
          {JOURNEY_STEPS.map((step, index) => {
            const isCompleted = completedSteps.includes(step.order);
            const isCurrent = index === currentStepIndex;
            const isLocked = !isCompleted && !isCurrent && index > currentStepIndex;
            
            // @ts-ignore
            const IconComponent = LucideIcons[step.icon as keyof typeof LucideIcons] || LucideIcons.Circle;

            return (
              <div key={step.id} className="flex flex-col items-center group">
                {/* Botão do Step */}
                <button
                  onClick={() => onStepClick(index)}
                  className={cn(
                    "relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                    "glass-morphism border overflow-visible",
                    isCurrent 
                      ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-110" 
                      : isCompleted
                      ? "border-[var(--success-primary)]/50 bg-[var(--success-primary)]/5 text-[var(--success-primary)]"
                      : "border-[var(--border-primary)] text-[var(--text-secondary)] opacity-60 hover:opacity-100 hover:border-[var(--accent-primary)]/40"
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

                  {/* Tooltip/Label Superior (Flutuante) */}
                  <div className={cn(
                    "absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all duration-300 pointer-events-none text-xs font-semibold",
                    "bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-xl",
                    isCurrent ? "opacity-100 -translate-y-2 scale-100" : "opacity-0 translate-y-2 scale-90"
                  )}>
                    Etapa {index + 1}
                  </div>
                </button>

                {/* Info Text Inferior */}
                <div className="mt-4 text-center max-w-[120px] hidden md:block">
                  <p className={cn(
                    "text-[10px] uppercase tracking-widest font-bold mb-1 transition-colors",
                    isCurrent ? "text-[var(--accent-primary)]" : "text-[var(--text-tertiary)]"
                  )}>
                    {step.title}
                  </p>
                  <p className="text-[9px] text-[var(--text-secondary)] leading-tight line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {step.subtitle}
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
