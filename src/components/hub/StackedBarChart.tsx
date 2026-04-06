"use client";

import React from "react";
import { motion } from "framer-motion";

interface StackedBarChartProps {
  data: {
    label: string;
    percentage: number;
    color: string;
  }[];
}

/**
 * StackedBarChart: A sleek, horizontal composition bar 📊
 * Ideal for "Recognition Languages" to show the distribution linear way.
 */
export function StackedBarChart({ data }: StackedBarChartProps) {
  // Garantir que temos dados e filtrar zeros para maior limpeza
  const activeData = data.filter(item => item.percentage > 0);
  const total = activeData.reduce((acc, curr) => acc + curr.percentage, 0);

  return (
    <div className="w-full flex flex-col gap-6 py-6 px-2">
      {/* Container Principal da Barra (Glassmorphism) */}
      <div className="relative h-5 w-full bg-[var(--bg-primary)]/40 border border-[var(--border-primary)] rounded-full overflow-hidden shadow-inner group">
        
        {/* Camada de Gradiente / Brilho de Fundo */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />

        <div className="flex h-full w-full">
          {activeData.map((item, index) => {
            // Se o total não for 100%, normalizamos visualmente para ocupar a barra toda
            // mas mantemos o valor real para o gráfico.
            const widthPct = (item.percentage / (total || 100)) * 100;

            return (
              <motion.div
                key={item.label}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: `${widthPct}%`, opacity: 1 }}
                transition={{ 
                  duration: 1, 
                  delay: index * 0.1, 
                  ease: "circOut" 
                }}
                className="h-full relative group/segment"
                style={{ 
                  backgroundColor: item.color,
                  boxShadow: `inset 0 0 10px ${item.color}30`
                }}
              >
                {/* Efeito de Brilho Superior em cada Segmento */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20" />
                
                {/* Tooltip Simples ou Indicador de Hover */}
                <div className="absolute inset-0 bg-white/0 group-hover/segment:bg-white/10 transition-colors pointer-events-none" />
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
