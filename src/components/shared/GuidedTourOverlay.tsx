"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TypedText } from "@/components/ui/TypedText";
import { Volume2, ChevronRight, X, Play } from "lucide-react";

export interface TourStep {
  targetId?: string;
  title?: string;
  content: string;
  buttonLabel?: string;
  action?: () => void;
}

interface GuidedTourOverlayProps {
  steps: TourStep[];
  onComplete: () => void;
  onReveal?: (revealedIds: string[]) => void;
  onFocus?: (targetId: string | null) => void;
  isOpen: boolean;
  userName?: string;
}

/**
 * BPlen Guided Labs — Tour Engine 🧬✨
 * Posicionamento inteligente ao lado do card alvo.
 */
export function GuidedTourOverlay({ steps, onComplete, onReveal, onFocus, isOpen, userName }: GuidedTourOverlayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNarrating, setIsNarrating] = useState(false);
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number; placement: 'right' | 'left' | 'center' } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const currentStep = steps[currentIndex];

  // Interpolar {User_Nickname} no texto
  const interpolate = (text: string) => {
    return text.replace(/\{User_Nickname\}/g, userName || "Membro BPlen");
  };

  // Calcular posição do tooltip relativa ao card alvo
  const calculatePosition = useCallback(() => {
    if (!currentStep?.targetId) {
      setTooltipPos(null); // Centralizado (fallback)
      return;
    }

    const el = document.getElementById(currentStep.targetId);
    if (!el) {
      setTooltipPos(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    const tooltipWidth = 440; // max-w-md ≈ 28rem = 448px
    const gap = 24; // distância entre card e tooltip
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    // Decidir se mostra à direita ou à esquerda
    const spaceRight = viewportW - rect.right;
    const spaceLeft = rect.left;

    let left: number;
    let placement: 'right' | 'left' | 'center';

    if (spaceRight >= tooltipWidth + gap) {
      // Posicionar à direita do card
      left = rect.right + gap;
      placement = 'right';
    } else if (spaceLeft >= tooltipWidth + gap) {
      // Posicionar à esquerda do card
      left = rect.left - tooltipWidth - gap;
      placement = 'left';
    } else {
      // Sem espaço lateral: centralizar abaixo
      left = Math.max(16, (viewportW - tooltipWidth) / 2);
      placement = 'center';
    }

    // Posição vertical: centralizar com o card, mas clampar na viewport
    let top = rect.top + rect.height / 2 - 140; // 140 ≈ metade da altura estimada do tooltip
    if (placement === 'center') {
      top = rect.bottom + gap;
    }
    // Clampar para não sair da tela
    top = Math.max(16, Math.min(top, viewportH - 350));
    left = Math.max(16, left);

    setTooltipPos({ top, left, placement });
  }, [currentStep]);

  // Ao avançar, acumula os IDs revelados e reposiciona
  useEffect(() => {
    if (!isOpen) return;
    if (currentStep?.targetId) {
       
      onFocus?.(currentStep.targetId);
      
      setRevealedIds(prev => {
        const next = prev.includes(currentStep.targetId!) ? prev : [...prev, currentStep.targetId!];
        onReveal?.(next);
        return next;
      });
      // Scroll suave para o elemento, depois calcular posição
      const el = document.getElementById(currentStep.targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Aguardar o scroll terminar antes de calcular a posição
        setTimeout(calculatePosition, 400);
      } else {
        calculatePosition();
      }
    } else {
      onFocus?.(null);
      setTooltipPos(null);
    }
  }, [currentIndex, isOpen, calculatePosition, onFocus, onReveal]);

  // Recalcular ao redimensionar
  useEffect(() => {
    if (!isOpen) return;
    const handleResize = () => calculatePosition();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [isOpen, calculatePosition]);

  // Reset ao fechar
  useEffect(() => {
    if (!isOpen) {
      setCurrentIndex(0);
      setRevealedIds([]);
      setTooltipPos(null);
    }
  }, [isOpen]);

  const narrate = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(interpolate(currentStep.content));
      utterance.lang = "pt-BR";
      utterance.rate = 1.1;
      utterance.pitch = 1.1;
      utterance.onstart = () => setIsNarrating(true);
      utterance.onend = () => setIsNarrating(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleNext = () => {
    if (currentStep.action) currentStep.action();
    if (currentIndex < steps.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Revelar tudo no final
      const allIds = steps.map(s => s.targetId).filter(Boolean) as string[];
      onReveal?.(allIds);
      onComplete();
    }
  };

  if (!isOpen) return null;

  // Estilo dinâmico do tooltip
  const tooltipStyle: React.CSSProperties = tooltipPos
    ? {
        position: 'fixed',
        top: tooltipPos.top,
        left: tooltipPos.left,
      }
    : {}; // Centralização será feita via FlexBox no wrapper para não conflitar com Framer Motion

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Semi-transparent overlay (very light) */}
      <div 
        className="absolute inset-0 bg-black/10 pointer-events-auto"
        onClick={() => {}} 
      />

      {/* Wrapper de posicionamento flex para quando não há targetId */}
      <div className={!tooltipPos ? "absolute inset-0 flex items-center justify-center pointer-events-none z-[101]" : "pointer-events-none z-[101]"}>
         {/* Narrative Dialog Box — posicionado ao lado do card */}
         <AnimatePresence mode="wait">
           <motion.div
             ref={tooltipRef}
             key={currentIndex}
             initial={{ opacity: 0, y: 20, scale: 0.95 }}
             animate={{ opacity: 1, y: 0, scale: 1 }}
             exit={{ opacity: 0, y: -20, scale: 0.95 }}
             transition={{ duration: 0.5, ease: "easeOut" }}
             className="pointer-events-auto w-full max-w-md p-8 bg-[var(--bg-primary)]/95 backdrop-blur-2xl border border-[var(--border-primary)] rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.3)] flex flex-col gap-6"
             style={tooltipStyle}
           >
          {/* Header / Narrator Controls */}
          <div className="flex items-center justify-between border-b border-[var(--border-primary)] pb-4">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 cursor-pointer">
                   {isNarrating ? <Volume2 className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4" onClick={narrate} />}
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">BPlen Narrator</span>
             </div>
          </div>

          {/* Content */}
          <div className="min-h-[80px]">
             {currentStep.title && (
               <h4 className="text-xl font-black text-[var(--text-primary)] mb-2 tracking-tight">{interpolate(currentStep.title)}</h4>
             )}
             <div className="text-sm md:text-base text-[var(--text-muted)] leading-relaxed italic">
                <TypedText 
                  text={interpolate(currentStep.content)} 
                  speed={25} 
                />
             </div>
          </div>

          {/* Footer / Progression */}
          <div className="flex items-center justify-between pt-4">
             <div className="flex gap-1.5">
                {steps.map((_, i) => (
                  <div 
                     key={i} 
                     className={`h-1.5 rounded-full transition-all duration-500 ${i === currentIndex ? "w-8 bg-pink-500" : i < currentIndex ? "w-3 bg-pink-500/40" : "w-1.5 bg-[var(--text-muted)]/20"}`}
                  />
                ))}
             </div>
             <button 
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl max-w-[280px] text-center leading-tight"
             >
                {currentStep.buttonLabel || (currentIndex === steps.length - 1 ? "Começar Jornada" : "Entendi")}
                <ChevronRight size={14} className="shrink-0" />
             </button>
          </div>
        </motion.div>
      </AnimatePresence>
      </div>
    </div>
  );
}
