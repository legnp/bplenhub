"use client";

import React from "react";
import { motion } from "framer-motion";

interface TriadData {
  label: string;
  percentage: number;
  color: string;
  description: string;
}

interface TriadDonutChartProps {
  data: TriadData[];
}

/**
 * TriadDonutChart (SVG Premium 🎨)
 * Gráfico de rosca dinâmico com animações fluidas e design BPlen.
 */
export function TriadDonutChart({ data }: TriadDonutChartProps) {
  const size = 300;
  const strokeWidth = 35;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedOffset = 0;

  return (
    <div className="flex flex-col items-center gap-12 py-8">
      {/* Container do SVG */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Círculo de Fundo (Track) */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={strokeWidth}
          />

          {/* Arcos de Dados */}
          {data.map((item, index) => {
            const dashArray = (item.percentage / 100) * circumference;
            const dashOffset = -accumulatedOffset;
            accumulatedOffset += dashArray;

            return (
              <motion.circle
                key={item.label}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dashArray} ${circumference - dashArray}`}
                strokeDashoffset={dashOffset}
                strokeLinecap={item.percentage > 0 ? "round" : "butt"}
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray: `${dashArray} ${circumference - dashArray}` }}
                transition={{ duration: 1.5, delay: index * 0.2, ease: "circOut" }}
                className="drop-shadow-[0_0_15px_rgba(var(--accent-start-rgb),0.2)]"
                style={{ filter: `drop-shadow(0 0 8px ${item.color}40)` }}
              />
            );
          })}
        </svg>

        {/* Centro do Gráfico (Label) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-60">Tríade do</span>
            <span className="text-3xl font-bold tracking-tighter text-[var(--text-primary)]">Tempo</span>
        </div>
      </div>

      {/* Legendas & Detalhes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-4">
        {data.map((item) => (
          <motion.div 
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col gap-3 relative overflow-hidden group hover:bg-white/[0.08] transition-all"
          >
             <div 
               className="absolute top-0 left-0 w-1 h-full"
               style={{ backgroundColor: item.color }}
             />
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{item.label}</span>
                <span className="text-2xl font-bold" style={{ color: item.color }}>{item.percentage}%</span>
             </div>
             <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
