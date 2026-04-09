"use client";

import React from "react";
import { SubStepConfig } from "@/types/journey";
import { cn } from "@/lib/utils";

interface SubStepRailProps {
  substeps: SubStepConfig[];
  currentSubStepId: string;
  completedSubStepIds: string[];
  onSelectSubStep: (id: string) => void;
}

/**
 * BPlen HUB — SubStepRail 🧬🛡️
 * Linear rail for sub-stage progress.
 */
export function SubStepRail({ substeps, currentSubStepId, completedSubStepIds, onSelectSubStep }: SubStepRailProps) {
  return (
    <div className="flex flex-col gap-4 w-1/4 sm:w-1/5 pr-6 border-r border-[var(--border-primary)] border-dashed">
      <div className="flex flex-col gap-2">
        <h4 className="text-[9px] font-black uppercase text-[var(--accent-start)] tracking-widest pl-1">Conteúdo do Estágio</h4>
        <div className="h-[2px] w-8 bg-[var(--accent-start)] rounded-full mb-4 ml-1" />
      </div>

      <div className="flex flex-col gap-3">
        {substeps.map((ss, idx) => {
          const isActive = ss.id === currentSubStepId;
          const isCompleted = completedSubStepIds.includes(ss.id);

          return (
            <button
              key={ss.id}
              onClick={() => onSelectSubStep(ss.id)}
              className={cn(
                "group flex items-start gap-4 p-3 text-left transition-all duration-500 rounded-2xl border",
                isActive 
                  ? "bg-[var(--accent-start)]/5 border-[var(--accent-start)]/20 shadow-sm" 
                  : isCompleted
                    ? "bg-green-500/5 border-green-500/10 text-green-600/80"
                    : "bg-[var(--input-bg)]/20 border-transparent hover:border-[var(--border-primary)] opacity-40 hover:opacity-100"
              )}
            >
              <div className="flex flex-col items-center gap-1 mt-0.5">
                <div className={cn(
                  "w-3 h-3 rounded-full border-2 transition-all duration-500",
                  isActive 
                    ? "bg-[var(--accent-start)] border-[var(--accent-start)] scale-125 shadow-lg shadow-[var(--accent-start)]/40" 
                    : isCompleted
                      ? "bg-green-500 border-green-500"
                      : "bg-transparent border-[var(--text-muted)]"
                )} />
                {idx < substeps.length - 1 && (
                  <div className={cn(
                    "w-[1px] h-10 -mb-5 transition-all duration-500",
                    isCompleted ? "bg-green-500/30" : "bg-[var(--border-primary)]"
                  )} />
                )}
              </div>

              <div className="flex flex-col gap-1">
                <span className={cn(
                  "text-[8px] font-black uppercase tracking-[0.1em] opacity-40",
                  isActive && "text-[var(--accent-start)] opacity-100"
                )}>
                  PARTE 0{idx + 1}
                </span>
                <span className={cn(
                  "text-[10px] font-bold leading-tight transition-colors duration-500",
                  isActive ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                )}>
                  {ss.title}
                </span>
                <span className="text-[7px] font-black uppercase tracking-widest opacity-20">
                    {ss.type}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
