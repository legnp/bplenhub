"use client";

import React from "react";
import { motion } from "framer-motion";

interface DiscChartProps {
  data: {
    label: string;
    percentage: number;
    color: string;
    shortLabel?: string;
  }[];
  mini?: boolean;
}

/**
 * BPlen HUB — DISC Horizontal Profile (🧬📊)
 * Visualização limpa e premium para os percentuais do perfil comportamental.
 */
export function DiscChart({ data, mini = false }: DiscChartProps) {
  return (
    <div className={`space-y-5 ${mini ? 'w-full' : 'w-full py-4'}`}>
      {data.map((item, idx) => (
        <div key={item.label} className="space-y-1.5 group">
          <div className="flex justify-between items-end px-1">
            <div className="flex items-center gap-2">
               <div 
                 className="w-2 h-2 rounded-full" 
                 style={{ backgroundColor: item.color }} 
               />
               <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-primary)] opacity-70 group-hover:opacity-100 transition-opacity">
                 {item.label}
               </span>
            </div>
            <span className="text-[10px] font-black text-[var(--text-primary)] tabular-nums">
              {item.percentage}%
            </span>
          </div>
          
          <div className="h-2 w-full bg-white/5 border border-white/10 rounded-full overflow-hidden shadow-inner relative">
             {/* Background Glow */}
             <div 
               className="absolute inset-0 opacity-10 blur-sm" 
               style={{ backgroundColor: item.color }} 
             />
             
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${item.percentage}%` }}
               transition={{ duration: 1.2, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
               className="h-full rounded-full relative z-10"
               style={{ 
                 backgroundColor: item.color,
                 boxShadow: `0 0 15px ${item.color}44`
               }}
             >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
             </motion.div>
          </div>
        </div>
      ))}
    </div>
  );
}
