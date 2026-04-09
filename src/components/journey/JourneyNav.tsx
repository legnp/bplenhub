"use client";

import React from "react";
import { motion } from "framer-motion";
import { JOURNEY_STAGES } from "@/config/journey/steps-registry";
import { StepStatus } from "@/types/journey";
import { Check, Lock, ChevronRight } from "lucide-react";
import * as LucideIcons from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface JourneyNavProps {
  currentStepId: string;
  stepStatusMap: Record<string, StepStatus>;
}

/**
 * BPlen HUB — Minimalist Horizontal Stepper 🧬🛡️
 * Visualizer for the 6-stage member journey.
 */
export function JourneyNav({ currentStepId, stepStatusMap }: JourneyNavProps) {
  return (
    <nav className="w-full max-w-5xl mx-auto mb-12 px-6">
      <div className="flex items-center justify-between relative">
        {/* Connection Line (Background) */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[var(--border-primary)] -translate-y-1/2 -z-10" />
        
        {JOURNEY_STAGES.map((stage, idx) => {
          const status = stepStatusMap[stage.id] || (idx === 0 ? "current" : "locked");
          const isCurrent = currentStepId === stage.id;
          const isCompleted = status === "completed";
          const isLocked = status === "locked";
          
          // Dynamic Icon Resolution
          const Icon = (LucideIcons as any)[stage.icon] || LucideIcons.Circle;

          return (
            <div key={stage.id} className="flex items-center group">
              <Link 
                href={isLocked ? "#" : `/hub/membro/journey/${stage.id}`}
                className={cn(
                  "relative flex flex-col items-center gap-3 transition-all duration-500",
                  isLocked ? "cursor-not-allowed" : "cursor-pointer hover:scale-105"
                )}
              >
                {/* Visual Indicator */}
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-500 relative z-10 shadow-sm",
                  isCurrent 
                    ? "bg-[var(--accent-start)] border-[var(--accent-start)] text-white shadow-lg shadow-[var(--accent-start)]/20 scale-110" 
                    : isCompleted
                      ? "bg-green-500/10 border-green-500/20 text-green-600"
                      : isLocked
                        ? "bg-[var(--input-bg)] border-[var(--border-primary)] text-[var(--text-muted)] opacity-50"
                        : "bg-[var(--bg-primary)] border-[var(--border-primary)] text-[var(--text-primary)] hover:border-[var(--accent-start)]"
                )}>
                  {isCompleted ? <Check size={16} strokeWidth={3} /> : 
                   isLocked ? <Lock size={14} /> : 
                   <Icon size={16} strokeWidth={isCurrent ? 3 : 2} />}

                  {/* Glass Glow for Current */}
                  {isCurrent && (
                    <motion.div 
                      layoutId="nav-glow"
                      className="absolute inset-0 rounded-2xl bg-white/20 blur-sm -z-10"
                    />
                  )}
                </div>

                {/* Subtitle / Order */}
                <div className="flex flex-col items-center">
                   <span className={cn(
                     "text-[8px] font-black uppercase tracking-[0.2em] transition-colors duration-300",
                     isCurrent ? "text-[var(--accent-start)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                   )}>
                     Etapa 0{stage.order}
                   </span>
                   <span className={cn(
                     "text-[9px] font-bold whitespace-nowrap hidden md:block transition-all duration-300 transform",
                     isCurrent ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                   )}>
                     {stage.title.split('. ')[1]}
                   </span>
                </div>
              </Link>

              {/* Arrow Connector (except last) */}
              {idx < JOURNEY_STAGES.length - 1 && (
                <div className="mx-2 md:mx-6 opacity-20 hidden sm:block">
                  <ChevronRight size={14} className="text-[var(--text-muted)]" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
