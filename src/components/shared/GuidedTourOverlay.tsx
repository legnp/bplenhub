"use client";

import React, { useState, useEffect } from "react";
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
  isOpen: boolean;
  userName?: string;
}

/**
 * BPlen Guided Labs — Tour Engine 🧬✨
 * Blur progressivo cinematográfico com narrativa autoguiada.
 */
export function GuidedTourOverlay({ steps, onComplete, onReveal, isOpen, userName }: GuidedTourOverlayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNarrating, setIsNarrating] = useState(false);
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const currentStep = steps[currentIndex];

  // Interpolar {User_Nickname} no texto
  const interpolate = (text: string) => {
    return text.replace(/\{User_Nickname\}/g, userName || "Membro BPlen");
  };

  // Ao avançar, acumula os IDs revelados
  useEffect(() => {
    if (!isOpen) return;
    if (currentStep?.targetId) {
      setRevealedIds(prev => {
        const next = prev.includes(currentStep.targetId!) ? prev : [...prev, currentStep.targetId!];
        onReveal?.(next);
        return next;
      });
      // Scroll suave para o elemento
      const el = document.getElementById(currentStep.targetId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentIndex, isOpen]);

  // Reset ao fechar
  useEffect(() => {
    if (!isOpen) {
      setCurrentIndex(0);
      setRevealedIds([]);
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

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {/* Semi-transparent overlay (very light) */}
      <div 
        className="absolute inset-0 bg-black/10 backdrop-blur-[1px] pointer-events-auto"
        onClick={() => {}} 
      />

      {/* Narrative Dialog Box */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative pointer-events-auto w-full max-w-lg p-8 bg-[var(--bg-primary)]/95 backdrop-blur-2xl border border-[var(--border-primary)] rounded-[3rem] shadow-[0_32px_64px_rgba(0,0,0,0.3)] flex flex-col gap-6"
            style={{
              position: 'absolute',
              top: currentStep.targetId ? '75%' : '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* Header / Narrator Controls */}
            <div className="flex items-center justify-between border-b border-[var(--border-primary)] pb-4">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 cursor-pointer">
                     {isNarrating ? <Volume2 className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4" onClick={narrate} />}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">BPlen Narrator</span>
               </div>
               <button onClick={onComplete} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                  <X size={18} />
               </button>
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
