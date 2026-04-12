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

// Mapeamento de Ícones Vibrantes e Cores Premium (Alinhado ao Apple IOS Pro) ✨🧬
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
  "preparacao-carreira": { // Fallback para slug curta
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
  "plano-carreira": { // Fallback
    icon: LucideIcons.Map, 
    color: "#10B981", 
    gradient: "from-emerald-500 to-teal-500" 
  },
  "desenvolvimento-de-carreira": { 
    icon: LucideIcons.TrendingUp, 
    color: "#F59E0B", 
    gradient: "from-amber-500 to-orange-500" 
  },
  "desenvolvimento-carreira": { // Fallback
    icon: LucideIcons.TrendingUp, 
    color: "#F59E0B", 
    gradient: "from-amber-500 to-orange-500" 
  },
  "coaching-e-mentoria": { 
    icon: LucideIcons.MessageSquareHeart, 
    color: "#6366F1", 
    gradient: "from-indigo-500 to-violet-500" 
  },
  "coaching": { // Fallback 
    icon: LucideIcons.MessageSquareHeart, 
    color: "#6366F1", 
    gradient: "from-indigo-500 to-violet-500" 
  },
  "mentoria": { // Fallback 
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
    <div className="w-full py-[5px] px-4 overflow-visible">
      <div className="max-w-6xl mx-auto relative px-2">
        {/* Linha de Conexão de Fundo (Token Border Primary) */}
        <div className="absolute top-[60px] left-0 w-full h-[1px] bg-[var(--border-primary)] opacity-40" />
        
        {/* Linha de Progresso Ativo (Gradient Accent conforme manual) */}
        <motion.div 
          className="absolute top-[60px] left-0 h-[1px] bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)]"
          initial={{ width: 0 }}
          animate={{ width: `${(Math.max(0, currentStepIndex) / (stages.length - 1)) * 100}%` }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />

        <div className="flex justify-between items-center relative z-10 w-full">
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

            // Lógica de Cores do Farol (Beacons) Rigorosa — BPlen Mapping 🚥
            let beaconColor = "bg-slate-400/40"; // Default: ⚪ Cinza
            let beaconStatus = "Não Liberado";
            const isPinkPulsing = !telemetry.hasAccess && telemetry.isNext;

            if (telemetry.status === "completed") {
                // 🟢 Verde: Missão cumprida
                beaconColor = "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]";
                beaconStatus = "Concluído";
            } else if (isCurrent || (telemetry.percentage > 0 && telemetry.status !== "completed")) {
                // 🟡 Amarelo: Foco atual (Em progresso)
                beaconColor = "bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.8)]";
                beaconStatus = "Foco Atual";
            } else if (telemetry.hasAccess && telemetry.isNext) {
                // 🔵 Azul: O horizonte (Próximo liberado)
                beaconColor = "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]";
                beaconStatus = "Próximo Passo";
            } else if (isPinkPulsing) {
                // 💗 Rosa BPlen: Aguardando liberação administrativa
                beaconColor = "bg-[#ff2c8d] shadow-[0_0_15px_rgba(255,44,141,0.8)] animate-pulse";
                beaconStatus = "Bloqueado Admin";
            }

            const Wrapper = onSelectStep ? "div" : Link;
            const wrapperProps = onSelectStep 
              ? { onClick: () => onSelectStep(stage.id), role: "button" } 
              : { href: `/hub/membro/journey/${stage.id}` };

            return (
              <div 
                key={stage.id} 
                className="flex flex-col items-center group relative flex-1"
                onMouseEnter={() => setHoveredStep(stage.id)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                {/* TOOLTIP OBSIDIAN (ALTA LEGIBILIDADE) 📊🧪 */}
                <AnimatePresence>
                  {hoveredStep === stage.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      className="absolute -top-24 z-50 min-w-[160px] px-5 py-4 rounded-[1.5rem] bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] pointer-events-none"
                    >
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90 mb-2">
                        {beaconStatus}
                      </p>
                      
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-3">
                         <motion.div 
                            className={cn("h-full", theme.gradient.replace('from-', 'bg-'))}
                            initial={{ width: 0 }}
                            animate={{ width: `${telemetry.percentage}%` }}
                         />
                      </div>
                      
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Evolução</span>
                        <span className="text-[11px] font-black text-white">{telemetry.percentage}%</span>
                      </div>
                      
                      {/* Arrow Down */}
                      <div className="absolute -bottom-1.5 left-1/2 -translateX-1/2 w-3 h-3 bg-slate-900 rotate-45 border-r border-b border-white/10" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* FAROL (BEACON) 🚥 */}
                <div className="mb-4 relative h-3 flex items-center justify-center">
                   <div className={cn(
                     "w-2.5 h-2.5 rounded-full transition-all duration-700 border border-white/10",
                     beaconColor,
                     isPinkPulsing ? "animate-pulse" : ""
                   )} />
                   {isPinkPulsing && (
                      <div className="absolute inset-0 rounded-full bg-[var(--accent-start)] animate-ping opacity-30" />
                   )}
                </div>

                {/* NÚMERO DA ETAPA (TOKEN TEXT MUTED/PRIMARY) */}
                <span className={cn(
                  "mb-3 text-[10px] font-black transition-all duration-300 tracking-tight uppercase",
                  isCurrent ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] opacity-60"
                )}>
                  {(index + 1).toString().padStart(2, '0')}
                </span>

                {/* BOTÃO DO STEP (ÍCONE VIBRANTE) 🚀✨ */}
                <Wrapper
                  {...(wrapperProps as any)}
                  className={cn(
                    "relative w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500",
                    "glass border overflow-visible cursor-pointer",
                    isCurrent 
                      ? "border-white/40 bg-white/20 shadow-xl scale-110" 
                      : "border-transparent bg-white/5 hover:bg-white/10 hover:border-white/10"
                  )}
                >
                  <motion.div
                    className="flex items-center justify-center"
                    whileHover={{ 
                      y: [0, -6, 0],
                      transition: { 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }
                    }}
                  >
                    <IconComponent 
                      className="w-7 h-7 transition-all duration-500" 
                      style={{ 
                        color: theme.color,
                        filter: isCurrent 
                            ? `drop-shadow(0 0 12px ${theme.color}60)` 
                            : telemetry.status === 'completed' 
                                ? 'grayscale(0) opacity(1)' 
                                : 'grayscale(0.6) opacity(0.5)',
                      }}
                    />
                  </motion.div>

                  {/* Efeito Glow para Etapa Atual */}
                  {isCurrent && (
                    <motion.div 
                        layoutId="active-glow"
                        className="absolute inset-0 rounded-[1.5rem] opacity-25 blur-2xl -z-10"
                        style={{ backgroundColor: theme.color }}
                    />
                  )}
                </Wrapper>

                {/* NOME DA ETAPA (TOKEN TEXT PRIMARY) */}
                <div className="mt-5 text-center px-2 hidden lg:block">
                  <p className={cn(
                    "text-[9px] uppercase tracking-[0.25em] font-black transition-colors leading-tight max-w-[110px]",
                    isCurrent ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] opacity-50"
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
