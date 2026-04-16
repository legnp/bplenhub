"use client";

import React from "react";
import { Users, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";

/**
 * BPlen HUB — Networking BPlen 🌐🤝
 * Espaço de conexões humanas, visibilidade de membros e embaixadores.
 */
export default function NetworkingPage() {
  return (
    <div className="p-6 md:p-10 space-y-10 animate-fade-in max-w-7xl mx-auto">
      
      {/* Header da Página */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Link 
            href="/hub/membro"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--accent-start)] hover:opacity-70 transition-all"
          >
            <ArrowLeft size={14} />
            Voltar ao Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-[var(--accent-soft)] rounded-3xl text-[var(--accent-start)]">
              <Users size={32} />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tighter text-[var(--text-primary)]">
                Networking BPlen
              </h1>
              <p className="text-[12px] font-medium text-[var(--text-muted)] opacity-70 uppercase tracking-[0.1em]">
                Conecte-se com membros e embaixadores do ecossistema
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder de Busca (Simulado para Visualização) */}
      <div className="glass p-8 flex flex-col items-center justify-center border border-[var(--border-primary)] rounded-[3rem] bg-white/5">
        <div className="w-16 h-16 bg-[var(--accent-start)]/10 text-[var(--accent-start)] rounded-full flex items-center justify-center mb-8">
           <Search size={28} />
        </div>
        <div className="text-center space-y-3">
          <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">Motor de Conexões em Configuração</h3>
          <p className="text-[10px] font-medium text-[var(--text-muted)] max-w-[400px] leading-relaxed mx-auto">
             Em breve você poderá buscar por profissionais, embaixadores e membros, filtrando por área de atuação, etapa da jornada e muito mais.
          </p>
        </div>
      </div>

    </div>
  );
}
