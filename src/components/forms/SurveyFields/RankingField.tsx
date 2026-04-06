"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RankingFieldProps {
  options: string[];
  value: Record<string, number>;
  onChange: (value: Record<string, number>) => void;
}

/**
 * RankingField (Componente Premium 🧠)
 * Permite a ordenação de 1 a 4 das opções, com lógica de exclusividade.
 */
export function RankingField({ options, value = {}, onChange }: RankingFieldProps) {
  const ranks = [4, 3, 2, 1]; // Ordem decrescente conforme pedido (4 Melhor, 1 Menos)
  
  const handleRankClick = (option: string, rank: number) => {
    const newValue = { ...value };
    
    // 1. Se este rank já estava em outra opção, remove-o
    Object.keys(newValue).forEach(key => {
      if (newValue[key] === rank) {
        delete newValue[key];
      }
    });

    // 2. Atribui o novo rank à opção atual (ou desativa se já era esse)
    if (value[option] === rank) {
      delete newValue[option];
    } else {
      newValue[option] = rank;
    }

    onChange(newValue);
  };

  // Verifica se todos os 4 ranks foram atribuídos
  const usedRanks = Object.values(value);
  const isComplete = usedRanks.length === 4 && new Set(usedRanks).size === 4;

  return (
    <div className="space-y-10 pt-4">
      <div className="grid gap-8">
        {options.map((opt, idx) => {
          const currentRank = value[opt];
          
          return (
            <motion.div 
              key={opt}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group space-y-4"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-[var(--text-muted)] opacity-40 group-hover:opacity-100 group-hover:border-[var(--accent-start)]/30 transition-all">
                  {idx + 1}
                </div>
                <p className="text-[var(--text-primary)] text-[15px] font-medium leading-relaxed tracking-tight group-hover:text-[var(--accent-start)] transition-colors">
                  {opt}
                </p>
              </div>
              
              <div className="flex gap-2.5 pl-10">
                {ranks.map((r) => {
                  const isActive = currentRank === r;
                  const isUsedElsewhere = usedRanks.includes(r) && !isActive;

                  return (
                    <button
                      key={r}
                      onClick={() => handleRankClick(opt, r)}
                      className={`
                        relative flex-1 h-12 rounded-2xl border text-[11px] font-black tracking-[0.2em] uppercase transition-all overflow-hidden
                        ${isActive 
                          ? "bg-gradient-to-br from-[var(--accent-start)] to-[var(--accent-end)] border-[var(--accent-start)] text-white shadow-lg shadow-[var(--accent-start)]/20 scale-[1.02] z-10" 
                          : isUsedElsewhere
                            ? "bg-white/[0.02] border-white/5 text-[var(--text-muted)]/20 cursor-not-allowed opacity-40"
                            : "bg-white/5 border-white/10 text-[var(--text-muted)] hover:border-[var(--accent-start)]/40 hover:bg-white/10 active:scale-95"}
                      `}
                    >
                      {isActive && (
                        <motion.div 
                          layoutId={`active-rank-${opt}`}
                          className="absolute inset-0 bg-white/10"
                          initial={false}
                        />
                      )}
                      <span className="relative z-10">{r}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legenda Dinâmica e Elegante 🕊️ */}
      <AnimatePresence mode="wait">
        {!isComplete ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="flex justify-between items-center px-10 pt-6 border-t border-white/5"
          >
             <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-start)] animate-pulse" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)]">
                  Atribua de 1 a 4 sem repetir
                </span>
             </div>
             <div className="flex gap-4">
                <span className="text-[9px] uppercase font-black tracking-tighter text-[var(--text-muted)]">4 = Mais relevante</span>
                <span className="text-[9px] uppercase font-black tracking-tighter text-[var(--text-muted)]">1 = Menos relevante</span>
             </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center pt-6"
          >
            <div className="px-6 py-2 bg-green-500/10 border border-green-500/20 rounded-full flex items-center gap-2">
               <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
               </svg>
               <span className="text-[9px] uppercase font-black tracking-[0.2em] text-green-500">Tudo pronto para seguir</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
