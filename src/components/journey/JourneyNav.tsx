"use client";

import { StepStatus, JourneyStep } from "@/types/journey";
import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

interface JourneyNavProps {
  stages: JourneyStep[];
  currentStepId: string;
  stepStatusMap: Record<string, StepStatus>;
  getStageTelemetry?: (stepId: string) => {
    status: string;
    percentage: number;
    hasAccess: boolean;
    isNext: boolean;
    substepsLabel: string;
  };
  onSelectStep?: (stepId: string) => void;
}

// Mapeamento de Ícones Vibrantes e Cores Premium 🎨✨
const STAGE_THEMES: Record<string, { icon: any, color: string, gradient: string }> = {
  "onboarding": { 
    icon: LucideIcons.Rocket, 
    color: "#EC4899", 
    gradient: "from-pink-500 to-rose-500" 
  },
  "preparacao-de-carreira": { 
    icon: LucideIcons.Compass, 
    color: "#3B82F6", 
    gradient: "from-blue-500 to-sky-500" 
  },
  "analise-comportamental": { 
    icon: LucideIcons.Fingerprint, 
    color: "#8B5CF6", 
    gradient: "from-violet-500 to-purple-500" 
  },
  "plano-de-carreira": { 
    icon: LucideIcons.Map, 
    color: "#10B981", 
    gradient: "from-emerald-500 to-teal-500" 
  },
  "desenvolvimento-de-carreira": { 
    icon: LucideIcons.TrendingUp, 
    color: "#F59E0B", 
    gradient: "from-amber-500 to-orange-500" 
  },
  "coaching-e-mentoria": { 
    icon: LucideIcons.MessageSquareHeart, 
    color: "#6366F1", 
    gradient: "from-indigo-500 to-violet-500" 
  },
  "offboarding": { 
    icon: LucideIcons.Award, 
    color: "#EF4444", 
    gradient: "from-red-500 to-rose-600" 
  },
};

export function JourneyNav({ stages, currentStepId, stepStatusMap, getStageTelemetry, onSelectStep }: JourneyNavProps) {
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);
  const currentStepIndex = stages.findIndex(s => s.id === currentStepId);

  return (
    <div className="w-full py-12 px-4 overflow-visible">
      <div className="max-w-6xl mx-auto relative">
        {/* Linha de Conexão de Fundo */}
        <div className="absolute top-[60px] left-0 w-full h-[1px] bg-[var(--border-primary)] opacity-10" />
        
        {/* Linha de Progresso Ativo */}
        <motion.div 
          className="absolute top-[60px] left-0 h-[1px] bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]"
          initial={{ width: 0 }}
          animate={{ width: `${(Math.max(0, currentStepIndex) / (stages.length - 1)) * 100}%` }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />

        <div className="flex justify-between items-center relative z-10">
          {stages.map((stage, index) => {
            const telemetry = getStageTelemetry ? getStageTelemetry(stage.id) : {
              status: stepStatusMap[stage.id] || "locked",
              percentage: 0,
              hasAccess: true,
              isNext: false,
              substepsLabel: "0/0"
            };

            const isCurrent = stage.id === currentStepId;
            const theme = STAGE_THEMES[stage.id] || { icon: LucideIcons.Circle, color: "#94A3B8", gradient: "from-slate-400 to-slate-500" };
            const IconComponent = theme.icon;

            // Lógica de Cores do Farol (Beacon) 🚥
            let beaconColor = "bg-slate-400"; // Default: Gray
            let beaconStatus = "Não Liberado";
            const pulsing = false;

            if (telemetry.status === "completed") {
                beaconColor = "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]";
                beaconStatus = "Concluído";
            } else if (telemetry.percentage > 0) {
                beaconColor = "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]";
                beaconStatus = "Em Progresso";
            } else if (telemetry.hasAccess) {
                beaconColor = isCurrent ? "bg-sky-500 shadow-[0_0_10px_rgba(56,189,248,0.5)]" : "bg-blue-400";
                beaconStatus = isCurrent ? "Ativo" : "Próximo Passo";
            } else if (telemetry.isNext) {
                beaconColor = "bg-pink-500 animate-pulse shadow-[0_0_12px_rgba(236,72,153,0.6)]";
                beaconStatus = "Aguardando Liberação";
            }

            const Wrapper = onSelectStep ? "div" : Link;
            const wrapperProps = onSelectStep 
              ? { onClick: () => onSelectStep(stage.id), role: "button" } 
              : { href: `/hub/membro/journey/${stage.id}` };

            return (
              <div 
                key={stage.id} 
                className="flex flex-col items-center group relative"
                onMouseEnter={() => setHoveredStep(stage.id)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                {/* TOOLTIP DE TELEMETRIA REAL 📊🧪 */}
                <AnimatePresence>
                  {hoveredStep === stage.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      className="absolute -top-20 z-50 min-w-[140px] px-4 py-3 rounded-2xl glass-morphism border border-white/20 shadow-2xl pointer-events-none"
                    >
                      <p className="text-[10px] font-black uppercase tracking-widest text-white mb-1">
                        {beaconStatus}
                      </p>
                      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-2">
                         <motion.div 
                            className={cn("h-full", theme.gradient.replace('from-', 'bg-'))}
                            initial={{ width: 0 }}
                            animate={{ width: `${telemetry.percentage}%` }}
                         />
                      </div>
                      <p className="text-[9px] font-bold text-white/60 mt-2 flex justify-between">
                        <span>Evolução:</span>
                        <span className="text-white">{telemetry.percentage}%</span>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* FAROL (BEACON) 🚥 */}
                <div className="mb-4 relative">
                   <div className={cn(
                     "w-2.5 h-2.5 rounded-full transition-all duration-500 border border-white/20",
                     beaconColor
                   )} />
                   {telemetry.isNext && !telemetry.hasAccess && (
                      <div className="absolute inset-0 rounded-full bg-pink-500 animate-ping opacity-40" />
                   )}
                </div>

                {/* NÚMERO DA ETAPA */}
                <span className={cn(
                  "mb-3 text-[9px] font-black transition-all duration-300 tracking-tighter uppercase opacity-40",
                  isCurrent ? "text-white opacity-100" : "text-slate-500"
                )}>
                  {(index + 1).toString().padStart(2, '0')}
                </span>

                {/* BOTÃO DO STEP (ÍCONE VIBRANTE) 🚀✨ */}
                <Wrapper
                  {...(wrapperProps as any)}
                  className={cn(
                    "relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500",
                    "glass-morphism border overflow-visible cursor-pointer",
                    isCurrent 
                      ? "border-white/30 bg-white/5 shadow-2xl scale-110" 
                      : "border-white/5 bg-white/0 hover:border-white/20 hover:bg-white/5"
                  )}
                >
                  <motion.div
                    className="flex items-center justify-center"
                    whileHover={{ 
                      y: [0, -8, 0],
                      rotate: [0, 5, -5, 0],
                      transition: { 
                        duration: 2.5, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }
                    }}
                  >
                    <IconComponent 
                      className="w-6 h-6 transition-all duration-500" 
                      style={{ 
                        color: theme.color,
                        filter: isCurrent ? `drop-shadow(0 0 8px ${theme.color}40)` : 'grayscale(0.5) opacity(0.7)',
                      }}
                    />
                  </motion.div>

                  {/* Efeito Glow para Etapa Atual */}
                  {isCurrent && (
                    <div 
                        className="absolute inset-0 rounded-2xl opacity-20 blur-xl -z-10"
                        style={{ backgroundColor: theme.color }}
                    />
                  )}
                </Wrapper>

                {/* NOME DA ETAPA */}
                <div className="mt-4 text-center max-w-[120px] hidden lg:block">
                  <p className={cn(
                    "text-[8px] uppercase tracking-[0.2em] font-black transition-colors leading-tight",
                    isCurrent ? "text-white" : "text-slate-500/80"
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
