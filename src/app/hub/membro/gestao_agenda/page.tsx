"use client";

import React from "react";
import { useAuthContext } from "@/context/AuthContext";
import { Layout, Calendar, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * Gestão de Agenda do Membro — BPlen HUB 🧬
 * Placeholder para a funcionalidade de gestão completa de mentorias.
 */
export default function GestaoAgendaPage() {
  const { user } = useAuthContext();

  return (
    <div className="flex flex-col min-h-screen animate-fade-in">
      <div className="max-w-4xl mx-auto p-8 md:p-12 space-y-12">
        
        {/* Header de Navegação */}
        <header className="flex items-center justify-between">
           <Link 
             href="/hub/membro/dashboard"
             className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors group"
           >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Voltar ao Dashboard
           </Link>
           <div className="px-4 py-1.5 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] text-[8px] font-black uppercase tracking-widest">
              Agenda Estratégica
           </div>
        </header>

        {/* Hero Section */}
        <section className="space-y-6 text-center md:text-left">
           <h1 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tighter">
              Gestão de <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]">Agenda</span>
           </h1>
           <p className="text-[var(--text-secondary)] text-sm max-w-xl leading-relaxed opacity-80">
              Visualize, reagende e gerencie todas as suas sessões de mentoria e entregas estratégicas em um só lugar.
           </p>
        </section>

        {/* Em Construção Placeholder */}
        <div className="p-12 bg-[var(--input-bg)] border border-dashed border-[var(--border-primary)] rounded-[3rem] flex flex-col items-center justify-center text-center space-y-6">
           <div className="w-16 h-16 rounded-full bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] opacity-30">
              <Calendar size={32} />
           </div>
           <div className="space-y-2">
              <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">Funcionalidade em Desenvolvimento</h3>
              <p className="text-[10px] text-[var(--text-muted)] italic max-w-xs mx-auto">
                 Estamos refinando o motor de agendamento para oferecer a melhor experiência de gestão de tempo para você.
              </p>
           </div>
           
           <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/agendar"
                className="px-8 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all"
              >
                 Agendar Nova Sessão
              </Link>
              <Link 
                href="/hub/membro/dashboard"
                className="px-8 py-3 border border-[var(--border-primary)] text-[var(--text-primary)] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--bg-secondary)] transition-all"
              >
                 Voltar ao Dashboard
              </Link>
           </div>
        </div>

      </div>
    </div>
  );
}
