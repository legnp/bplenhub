"use client";

import React from "react";
import { UserCog, ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * BPlen HUB — Perfil & Configurações ⚙️🧬
 * Espaço para autogestão de identidade, pitch e visibilidade na rede.
 */
export default function ProfileSettingsPage() {
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
              <UserCog size={32} />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tighter text-[var(--text-primary)]">
                Perfil & Configurações
              </h1>
              <p className="text-[12px] font-medium text-[var(--text-muted)] opacity-70 uppercase tracking-[0.1em]">
                Gerencie sua identidade e visibilidade no ecossistema BPlen
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder de Construção */}
      <div className="py-20 flex flex-col items-center justify-center border border-dashed border-[var(--border-primary)] rounded-[3rem] bg-[var(--input-bg)]/5">
        <div className="p-5 rounded-full bg-white/5 mb-6">
           <UserCog size={40} className="text-[var(--text-muted)] opacity-30 animate-pulse" />
        </div>
        <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">Em Construção</h3>
        <p className="text-[10px] font-medium text-[var(--text-muted)] mt-2 italic">
           As ferramentas de autoconfiguração de perfil estarão disponíveis em breve.
        </p>
      </div>

    </div>
  );
}
