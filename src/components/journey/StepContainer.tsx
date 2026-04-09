"use client";

import React from "react";
import { motion } from "framer-motion";

interface StepContainerProps {
  children: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}

/**
 * BPlen HUB — StepContainer 🧬🛡️
 * The premium glassmorphic wrapper for the current journey step.
 */
export function StepContainer({ children, title, description, badge }: StepContainerProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, translateY: 10 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full h-full max-w-7xl mx-auto flex flex-col gap-6"
    >
      {/* Header Glass Section */}
      <div className="relative p-8 rounded-[2.5rem] bg-[var(--input-bg)]/30 backdrop-blur-xl border border-[var(--border-primary)] shadow-2xl overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-start)]/5 blur-[100px] -z-10" />
        
        <div className="flex flex-col gap-2 relative z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight uppercase">
              {title}
            </h1>
            {badge && (
              <span className="px-3 py-1 bg-[var(--accent-start)]/10 text-[var(--accent-start)] border border-[var(--accent-start)]/20 rounded-full text-[8px] font-black uppercase tracking-[0.2em]">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs font-bold text-[var(--text-muted)] opacity-60 max-w-2xl leading-relaxed uppercase tracking-wider">
            {description}
          </p>
        </div>
      </div>

      {/* Main Glass Workspace */}
      <div className="flex-1 p-8 rounded-[3.5rem] bg-[var(--bg-primary)] border border-[var(--border-primary)] shadow-2xl relative overflow-hidden">
         {/* Subtle Workspace Border Glow */}
         <div className="absolute inset-0 border-[var(--accent-start)]/5 border rounded-[3.5rem] pointer-events-none" />
          
         <div className="flex h-full gap-8 relative z-10">
            {children}
         </div>
      </div>
    </motion.div>
  );
}
