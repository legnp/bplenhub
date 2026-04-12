"use client";

import { StepStatus, JourneyStep } from "@/types/journey";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface JourneyNavProps {
  stages: JourneyStep[];
  currentStepId: string;
  stepStatusMap: Record<string, StepStatus>;
  onSelectStep?: (stepId: string) => void;
}

export function JourneyNav({ stages, currentStepId, stepStatusMap, onSelectStep }: JourneyNavProps) {
  const currentStepIndex = stages.findIndex(s => s.id === currentStepId);

  return (
    <div className="w-full py-8 px-4 overflow-visible">
      <div className="max-w-6xl mx-auto relative">
        {/* Linha de Conexão de Fundo */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[var(--border-primary)] -translate-y-1/2 opacity-20" />
        
        {/* Linha de Progresso Ativo */}
        <motion.div 
          className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] -translate-y-1/2"
          initial={{ width: 0 }}
          animate={{ width: `${(Math.max(0, currentStepIndex) / (stages.length - 1)) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />

        <div className="flex justify-between items-center relative z-10">
          {stages.map((stage, index) => {
            const status = stepStatusMap[stage.id] || "locked";
            const isCompleted = status === "completed";
            const isCurrent = stage.id === currentStepId;
            
            // Renderização segura do ícone Lucide
            const IconName = stage.icon as keyof typeof LucideIcons;
            const IconComponent = (LucideIcons[IconName] as any) || LucideIcons.Circle;

            const Wrapper = onSelectStep ? "div" : Link;
            const wrapperProps = onSelectStep 
              ? { onClick: () => onSelectStep ? onSelectStep(stage.id) : null, role: "button" } 
              : { href: `/hub/membro/journey/${stage.id}` };

            return (
              <div key={stage.id} className="flex flex-col items-center group relative">
                {/* Número da Etapa (Acima) */}
                <span className={cn(
                  "mb-3 text-[10px] font-black transition-all duration-300 tracking-tighter",
                  isCurrent ? "text-[var(--accent-primary)] scale-110" : "text-[var(--text-muted)] opacity-30 group-hover:opacity-60"
                )}>
                  {(index + 1).toString().padStart(2, '0')}
                </span>

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
                      : "border-[var(--border-primary)] text-[var(--text-secondary)] opacity-60 hover:opacity-100 hover:border-[var(--accent-primary)]/40 hover:shadow-lg hover:shadow-[var(--accent-primary)]/10",
                    status === "locked" && "pointer-events-none opacity-30 grayscale"
                  )}
                >
                  {isCompleted ? (
                    <motion.div
                      whileHover={{ 
                        y: [0, -3, 0],
                        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                      }}
                    >
                      <LucideIcons.Check className="w-5 h-5 animate-in zoom-in duration-300" />
                    </motion.div>
                  ) : (
                    <motion.div
                      className="flex items-center justify-center"
                      whileHover={{ 
                        y: [0, -5, 0],
                        x: [0, 2, -2, 0],
                        rotate: [0, 5, -5, 0],
                        transition: { 
                          duration: 3, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }
                      }}
                    >
                      <IconComponent className={cn(
                        "w-5 h-5",
                        isCurrent && "animate-pulse"
                      )} />
                    </motion.div>
                  )}
                </Wrapper>

                {/* Nome da Etapa Inferior */}
                <div className="mt-4 text-center max-w-[120px] hidden lg:block">
                  <p className={cn(
                    "text-[8px] uppercase tracking-[0.2em] font-black transition-colors leading-tight",
                    isCurrent ? "text-[var(--accent-primary)]" : "text-[var(--text-tertiary)] opacity-60 group-hover:opacity-100"
                  )}>
                    {stage.title}
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
