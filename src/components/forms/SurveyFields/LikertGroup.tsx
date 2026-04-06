"use client";

import React from "react";
import { motion } from "framer-motion";

interface LikertGroupProps {
  statements: string[];
  value: Record<string, number>;
  onChange: (value: Record<string, number>) => void;
}

/**
 * LikertGroup (Módulo Premium 📊)
 * Renderiza múltiplas afirmações com escala de 1 a 10 de alta densidade.
 * Otimizado para behavioral analysis e mobile-first.
 */
export function LikertGroup({ statements, value = {}, onChange }: LikertGroupProps) {
  const options = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const handleSelect = (statement: string, score: number) => {
    onChange({ ...value, [statement]: score });
  };

  return (
    <div className="space-y-12 pt-4">
      {statements.map((st, idx) => {
        const currentScore = value[st];

        return (
          <motion.div
            key={st}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="space-y-4 group"
          >
            <div className="flex items-start gap-4">
               <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-[var(--text-muted)] opacity-30 mt-0.5">
                  {idx + 1}
               </div>
               <p className="text-[var(--text-primary)] text-[15px] font-medium leading-tight tracking-tight group-hover:text-[var(--accent-start)] transition-colors">
                  {st}
               </p>
            </div>

            <div className="flex justify-between items-center gap-1 md:gap-1.5 pl-10">
              {options.map((num) => (
                <button
                  key={num}
                  onClick={() => handleSelect(st, num)}
                  className={`
                    flex-1 h-8 md:h-9 rounded-[10px] border-[1px] text-[10px] md:text-xs font-bold transition-all
                    ${currentScore === num
                      ? "bg-gradient-to-br from-[var(--accent-start)] to-[var(--accent-end)] border-[var(--accent-start)] text-white shadow-md shadow-[var(--accent-start)]/20 scale-105 z-10"
                      : "bg-white/5 border-white/10 text-[var(--text-muted)] hover:border-[var(--accent-start)]/40 hover:bg-white/10"}
                  `}
                >
                  {num}
                </button>
              ))}
            </div>

          </motion.div>
        );
      })}

      {/* Legenda compacta e elegante 🕊️ */}
      <div className="flex justify-between items-center px-10 pt-6 border-t border-white/5">
        <div className="flex items-center gap-2 opacity-40">
           <span className="w-2 h-2 rounded-full bg-white/20" />
           <span className="text-[9px] uppercase font-black tracking-widest text-[var(--text-muted)]">1 = Não é verdade</span>
        </div>
        <div className="flex items-center gap-2 opacity-40">
           <span className="text-[9px] uppercase font-black tracking-widest text-[var(--text-muted)]">10 = Totalmente verdadeiro</span>
           <span className="w-2 h-2 rounded-full bg-[var(--accent-start)]" />
        </div>
      </div>
    </div>
  );
}
