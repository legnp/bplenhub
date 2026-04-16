"use client";

import React, { useState } from "react";
import { UserCog, ArrowLeft, Briefcase, Database, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * BPlen HUB — Perfil & Configurações ⚙️🧬
 * Espaço para autogestão de identidade, pitch e visibilidade na rede.
 */
export default function ProfileSettingsPage() {
  const [activeTab, setActiveTab] = useState("geral");

  const tabs = [
    { id: "geral", label: "Geral", icon: UserCog },
    { id: "talento", label: "Banco de Talento", icon: Briefcase },
    { id: "dados", label: "Dados Cadastrais", icon: Database },
  ];

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

      {/* 🧭 Navegação por Abas Horizontal */}
      <div className="flex items-center gap-1 p-1 bg-[var(--input-bg)]/20 border border-[var(--border-primary)]/50 rounded-2xl w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-500 text-[11px] font-black uppercase tracking-widest",
                isActive 
                  ? "bg-[var(--accent-start)] text-white shadow-lg shadow-[var(--accent-start)]/20 scale-105" 
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5"
              )}
            >
              <Icon size={14} className={cn(isActive ? "animate-pulse" : "opacity-50")} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Conteúdo Dinâmico por Aba */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {activeTab === "geral" && (
           <PlaceholderCard 
              title="Configurações Gerais" 
              desc="Edite seu pitch, foto de perfil e informações básicas de identidade." 
           />
        )}
        {activeTab === "talento" && (
           <PlaceholderCard 
              title="Banco de Talento" 
              desc="Gerencie suas competências, histórico e visibilidade para recrutadores." 
           />
        )}
        {activeTab === "dados" && (
           <PlaceholderCard 
              title="Dados Cadastrais" 
              desc="Segurança da conta, e-mail de acesso e informações administrativas." 
           />
        )}
      </div>

    </div>
  );
}

/**
 * Componente Placeholder Temporário
 */
function PlaceholderCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="py-20 flex flex-col items-center justify-center border border-dashed border-[var(--border-primary)] rounded-[3rem] bg-[var(--input-bg)]/5">
      <div className="p-5 rounded-full bg-white/5 mb-6">
         <UserCog size={40} className="text-[var(--text-muted)] opacity-30 animate-pulse" />
      </div>
      <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">{title}</h3>
      <p className="text-[10px] font-medium text-[var(--text-muted)] mt-2 italic">
         {desc}
      </p>
    </div>
  );
}
