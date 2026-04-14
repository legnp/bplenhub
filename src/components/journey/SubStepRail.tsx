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
    <div className="flex flex-col gap-6 w-1/4 sm:w-1/5 pr-8 border-r border-[var(--border-primary)] border-dashed">
      <div className="flex flex-col gap-2">
        <h4 className="text-[10px] font-black uppercase text-[var(--accent-start)] tracking-[0.3em] pl-1">Checkpoints</h4>
        <div className="h-[2px] w-6 bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)] rounded-full mb-2 ml-1" />
      </div>

      <div className="flex flex-col gap-4">
        {substeps.map((ss, idx) => {
          const isActive = ss.id === currentSubStepId;
          const isCompleted = completedSubStepIds.includes(ss.id);

          return (
            <button
              key={ss.id}
              onClick={() => onSelectSubStep(ss.id)}
              className={cn(
                "group relative flex items-start gap-5 p-4 text-left transition-all duration-500 rounded-3xl border",
                isActive 
                  ? "bg-[var(--accent-start)]/5 border-[var(--accent-start)]/30 shadow-[0_10px_30px_rgba(var(--accent-start-rgb),0.05)] scale-[1.02] z-10" 
                  : isCompleted
                    ? "bg-green-500/5 border-green-500/20 text-green-600/80"
                    : "bg-[var(--input-bg)]/30 border-transparent hover:border-[var(--border-primary)] opacity-40 hover:opacity-100"
              )}
            >
              {/* Indicador Vertical Progressivo */}
              <div className="flex flex-col items-center gap-1.5 mt-1.5">
                <div className={cn(
                  "w-2.5 h-2.5 rounded-full border-2 transition-all duration-700",
                  isActive 
                    ? "bg-[var(--accent-start)] border-[var(--accent-start)] shadow-[0_0_12px_var(--accent-start)]" 
                    : isCompleted
                      ? "bg-green-500 border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.3)]"
                      : "bg-transparent border-[var(--text-muted)] opacity-30"
                )} />
                {idx < substeps.length - 1 && (
                  <div className={cn(
                    "w-[1px] h-12 -mb-6 transition-all duration-700",
                    isCompleted ? "bg-green-500/20" : "bg-[var(--border-primary)]/40"
                  )} />
                )}
              </div>

              <div className="flex flex-col gap-1.5 overflow-hidden">
                <span className={cn(
                  "text-[8px] font-black uppercase tracking-[0.2em] transition-all",
                  isActive ? "text-[var(--accent-start)] opacity-100" : "text-[var(--text-tertiary)] opacity-40"
                )}>
                  Parada {idx + 1}
                </span>
                <span className={cn(
                  "text-[11px] font-black leading-tight tracking-tight transition-colors duration-500",
                  isActive ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                )}>
                  {ss.title}
                </span>
                {isActive && (
                   <span className="text-[7px] font-black uppercase tracking-[0.3em] text-[var(--accent-start)] mt-1 animate-pulse">
                      Em Foco
                   </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
