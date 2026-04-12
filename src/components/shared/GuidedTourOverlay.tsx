"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TypedText } from "@/components/ui/TypedText";
import { Volume2, ChevronRight, X, Play } from "lucide-react";

export interface TourStep {
  targetId?: string; // ID do elemento para focar. Se vazio, foca no centro.
  title?: string;
  content: string;
  action?: () => void;
}

interface GuidedTourOverlayProps {
  steps: TourStep[];
  onComplete: () => void;
  isOpen: boolean;
}

/**
 * BPlen Guided Labs — Tour Engine 🧬✨
 * Componente que gerencia o efeito spotlight e a narrativa autoguiada.
 */
export function GuidedTourOverlay({ steps, onComplete, isOpen }: GuidedTourOverlayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0, width: 0, height: 0, padding: 20 });
  const [isNarrating, setIsNarrating] = useState(false);
  const currentStep = steps[currentIndex];

  // Atualiza as coordenadas do spotlight baseado no targetId
  useEffect(() => {
    if (!isOpen) return;

    if (currentStep.targetId) {
      const element = document.getElementById(currentStep.targetId);
      if (element) {
        const rect = element.getBoundingClientRect();
        setSpotlight({
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
          padding: 15
        });
        // Scroll suave para o elemento se necessário
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      // Centro da tela (passo inicial/final)
      setSpotlight({ x: 0, y: 0, width: 0, height: 0, padding: 0 });
    }
  }, [currentIndex, currentStep.targetId, isOpen]);

  // Função de Narração Nativa
  const narrate = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentStep.content);
      utterance.lang = "pt-BR";
      utterance.rate = 1.1;
      utterance.pitch = 1.1;
      utterance.onstart = () => setIsNarrating(true);
      utterance.onend = () => setIsNarrating(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleNext = () => {
    if (currentIndex < steps.length - 1) {
      setCurrentIndex(prev => prev + 1);
      if (currentStep.action) currentStep.action();
    } else {
      onComplete();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {/* SVG Mask Overlay for Spotlight */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <motion.rect
              animate={{
                x: spotlight.x - spotlight.padding,
                y: spotlight.y - spotlight.padding,
                width: spotlight.width + spotlight.padding * 2,
                height: spotlight.height + spotlight.padding * 2,
                rx: 32 // Rounded corners matching BPlen cards
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#spotlight-mask)"
          className="backdrop-blur-sm pointer-events-auto"
        />
      </svg>

      {/* Narrative Dialog Box */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: currentStep.targetId ? (spotlight.y > window.innerHeight / 2 ? -250 : 250) : 0, 
              scale: 1 
            }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={cn(
               "relative pointer-events-auto w-full max-w-lg p-8",
               "glass-morphism border border-white/20 rounded-[3rem] shadow-[0_32px_64px_rgba(0,0,0,0.5)]",
               "flex flex-col gap-6"
            )}
            style={{
               position: 'absolute',
               top: currentStep.targetId ? (spotlight.y > window.innerHeight / 2 ? 'auto' : `${spotlight.y + spotlight.height + 100}px`) : '50%',
               bottom: currentStep.targetId && spotlight.y > window.innerHeight / 2 ? `${window.innerHeight - spotlight.y + 60}px` : 'auto',
               left: '50%',
               transform: 'translateX(-50%)'
            }}
          >
            {/* Header / Narrator Controls */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400">
                     {isNarrating ? <Volume2 className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4" onClick={narrate} />}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">BPlen Narrator</span>
               </div>
               <button onClick={onComplete} className="text-white/40 hover:text-white transition-colors">
                  <X size={18} />
               </button>
            </div>

            {/* Content */}
            <div className="min-h-[80px]">
               {currentStep.title && (
                 <h4 className="text-xl font-black text-white mb-2 tracking-tight">{currentStep.title}</h4>
               )}
               <div className="text-sm md:text-base text-white/80 leading-relaxed italic">
                  <TypedText 
                    text={currentStep.content} 
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
                       className={cn(
                         "h-1.5 rounded-full transition-all duration-500",
                         i === currentIndex ? "w-8 bg-pink-500" : "w-1.5 bg-white/20"
                       )} 
                    />
                  ))}
               </div>
               <button 
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
               >
                  {currentIndex === steps.length - 1 ? "Começar Jornada" : "Entendi"}
                  <ChevronRight size={14} />
               </button>
            </div>

            {/* Hint Arrow (Bouncing) */}
            {currentStep.targetId && (
               <motion.div 
                 animate={{ y: [0, -10, 0] }}
                 transition={{ repeat: Infinity, duration: 2 }}
                 className="absolute -top-12 left-1/2 -translateX-1/2 text-pink-500"
               >
                  {/* Seta animada aqui */}
               </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Utility for classes
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
