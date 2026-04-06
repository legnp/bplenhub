"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StackedBarChartProps {
  data: {
    label: string;
    percentage: number;
    color: string;
  }[];
}

/**
 * StackedBarChart: A sleek, horizontal composition bar 📊
 */
export function StackedBarChart({ data }: StackedBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  // Garantir que temos dados e filtrar zeros para maior limpeza
  const activeData = data.filter(item => item.percentage > 0);
  const total = activeData.reduce((acc, curr) => acc + curr.percentage, 0);

  return (
    <div className="w-full flex flex-col gap-6 py-6 px-2">
      {/* Container Principal da Barra (Glassmorphism) */}
      <div className="relative h-6 w-full bg-[var(--bg-primary)]/40 border border-[var(--border-primary)] rounded-full shadow-inner group/bar transition-all duration-500">
        
        {/* Camada de Gradiente / Brilho de Fundo */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none rounded-full" />

        <div className="flex h-full w-full rounded-full overflow-hidden">
          {activeData.map((item, index) => {
            const widthPct = (item.percentage / (total || 100)) * 100;
            const isHovered = hoveredIndex === index;

            return (
              <motion.div
                key={item.label}
                initial={{ width: 0, opacity: 0 }}
                animate={{ 
                  width: `${widthPct}%`, 
                  opacity: 1,
                  scaleY: isHovered ? 1.2 : 1
                }}
                transition={{ 
                  width: { duration: 1, delay: index * 0.1, ease: "circOut" },
                  scaleY: { duration: 0.2 }
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="h-full relative cursor-pointer"
                style={{ 
                  backgroundColor: item.color,
                  boxShadow: isHovered ? `0 0 20px ${item.color}60` : `inset 0 0 10px ${item.color}30`,
                  zIndex: isHovered ? 10 : 1
                }}
              >
                {/* Efeito de Brilho Superior */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20" />
                
                {/* Tooltip Flutuante 🧬 */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, x: '-50%' }}
                      animate={{ opacity: 1, y: -45, x: '-50%' }}
                      exit={{ opacity: 0, y: 10, x: '-50%' }}
                      className="absolute top-0 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[var(--bg-primary)] border border-white/10 rounded-xl shadow-2xl pointer-events-none z-[100] whitespace-nowrap backdrop-blur-xl"
                    >
                      <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                         <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-primary)]">
                            {item.label}: {Math.round(item.percentage)}%
                         </span>
                      </div>
                      {/* Seta do tooltip */}
                      <div className="absolute top-[95%] left-1/2 -translate-x-1/2 border-x-[6px] border-x-transparent border-t-[6px] border-t-white/10" />
                      <div className="absolute top-[90%] left-1/2 -translate-x-1/2 border-x-[5px] border-x-transparent border-t-[5px] border-t-[var(--bg-primary)]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Indicador Central de Total (Opcional, similar ao Donut) */}
      <div className="flex items-center justify-between px-2">
         <span className="text-[10px] font-black tracking-tighter text-[var(--accent-start)]">
            Composição de Reconhecimento
         </span>
         <span className="text-[10px] font-bold text-[var(--text-muted)] opacity-60">
            {Math.round(total)}% Mapeado
         </span>
      </div>
    </div>
  );
}
