"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";

/**
 * MEMBER AREA VIEW — O Conteúdo Real da Área de Membro 🏗️
 * Apresentado apenas após autorização soberana do servidor.
 */
export function MemberAreaView() {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-20 space-y-12 min-h-[70vh] flex flex-col items-center justify-center animate-fade-in transition-all">
      <div className="text-center space-y-6 opacity-30 select-none pointer-events-none group">
         <div className="inline-flex p-8 rounded-[3rem] bg-gradient-to-br from-[var(--input-bg)] to-transparent border border-[var(--border-primary)] shadow-2xl transition-all duration-700 group-hover:scale-105 group-hover:opacity-100">
            <ShieldCheck size={64} className="text-[var(--accent-start)]" />
         </div>
         <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
               Área de Membro <span className="text-[var(--accent-start)] italic">BPlen</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">
               Foundation Shell v1.2 — Autoridade Soberana Server-Side
            </p>
         </div>
         <div className="w-24 h-px bg-gradient-to-r from-transparent via-[var(--border-primary)] to-transparent mx-auto mt-12" />
      </div>

      <div className="fixed bottom-12 right-12 p-4 glass bg-emerald-500/5 border-emerald-500/10 rounded-2xl hidden md:block">
         <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600/60">Server-Side Authorization Sovereign</span>
         </div>
      </div>
    </div>
  );
}
