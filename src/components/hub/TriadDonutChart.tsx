"use client";

import React from "react";
import { motion } from "framer-motion";

interface TriadDonutChartProps {
  data: {
    label: string;
    percentage: number;
    color: string;
    description?: string;
  }[];
  title?: string;
  subtitle?: string;
  mini?: boolean;
}

export function TriadDonutChart({ data, title, subtitle, mini = false }: TriadDonutChartProps) {
  const size = mini ? 160 : 250;
  const center = size / 2;
  const radius = mini ? 60 : 90;
  const strokeWidth = mini ? 12 : 20;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={`w-full flex flex-col ${mini ? 'items-center' : 'md:flex-row items-center justify-center'} gap-8`}>
      <div className="relative group">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Fundo do Donut (opcional, para visual mais robusto) */}
          <circle 
            cx={center} 
            cy={center} 
            r={radius} 
            fill="transparent" 
            stroke="rgba(255, 255, 255, 0.05)" 
            strokeWidth={strokeWidth} 
          />

          {data.map((item, index) => {
            let offset = 0;
            for (let i = 0; i < index; i++) {
              offset += (data[i].percentage / 100) * circumference;
            }

            return (
              <motion.circle
                key={item.label}
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray: `${(item.percentage / 100) * circumference} ${circumference}` }}
                transition={{ duration: 1.5, delay: index * 0.2, ease: "circOut" }}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                className="transition-all duration-500"
                style={{ filter: `drop-shadow(0 0 4px ${item.color}30)` }}
              />
            );
          })}
        </svg>

        {/* Info Central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
           <span className={`font-black tracking-tighter text-[var(--text-primary)] ${mini ? 'text-xl' : 'text-4xl'}`}>
              {Math.round(data.reduce((acc, curr) => acc + curr.percentage, 0))}%
           </span>
           <span className={`font-bold uppercase tracking-widest text-[var(--text-muted)] opacity-40 ${mini ? 'text-[6px]' : 'text-[9px]'}`}>
              Total
           </span>
        </div>
      </div>

      {!mini && (
        <div className="flex-1 space-y-6 max-w-sm">
          {data.map((item) => (
            <div key={item.label} className="group space-y-1.5 p-3 rounded-2xl hover:bg-white/5 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-bold text-[var(--text-primary)]">{item.label}</span>
                </div>
                <span className="text-sm font-black text-[var(--accent-start)]">{item.percentage}%</span>
              </div>
              {item.description && (
                <p className="text-[10px] text-[var(--text-muted)] leading-relaxed pl-6 opacity-60 group-hover:opacity-100 transition-opacity">
                  {item.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
