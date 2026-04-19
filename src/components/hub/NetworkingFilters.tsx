"use client";

import React from "react";
import { Search, Map, Briefcase, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { JOURNEY_STAGES } from "@/config/journey/steps-registry";

interface Props {
  tab: "membros" | "profissionais" | "parceiros";
  search: string;
  setSearch: (v: string) => void;
  stageFilter: string;
  setStageFilter: (v: string) => void;
  serviceFilter: string;
  setServiceFilter: (v: string) => void;
  availableServices: string[];
}

/**
 * BPlen HUB — NetworkingFilters 🛰️🔍
 */
export function NetworkingFilters({
  tab,
  search,
  setSearch,
  stageFilter,
  setStageFilter,
  serviceFilter,
  setServiceFilter,
  availableServices
}: Props) {
  const isPartnerTab = tab === "parceiros";

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-center px-4">
      
      {/* 🔍 Busca Instantânea */}
      <div className="relative flex-1 w-full">
         <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            <Search size={18} />
         </div>
         <input 
           type="text"
           value={search}
           onChange={(e) => setSearch(e.target.value)}
           placeholder={isPartnerTab ? "Buscar parceiros, serviços ou termos..." : "Buscar nomes, pitch ou #hashtags..."}
           className="w-full bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-[2rem] pl-14 pr-8 py-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-start)] outline-none transition-all glass"
         />
      </div>

      {/* 🧭 Filtro Contextual */}
      <div className="flex items-center gap-4 w-full lg:w-auto">
         <div className="p-4 bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-2xl text-[var(--text-muted)] glass">
            <Filter size={18} />
         </div>

         {isPartnerTab ? (
           // Filtro de Ramos (Parceiros)
            <select 
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="flex-1 lg:w-64 bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-[2rem] px-6 py-4 text-xs font-black uppercase tracking-widest text-[var(--text-primary)] outline-none glass appearance-none cursor-pointer hover:bg-[var(--accent-soft)] transition-all"
            >
              <option value="Todos" className="bg-[var(--bg-primary)]">Todos os Ramos</option>
              {availableServices.map(s => <option key={s} value={s} className="bg-[var(--bg-primary)]">{s}</option>)}
           </select>
         ) : (
           // Filtro de Jornada (Membros)
            <select 
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="flex-1 lg:w-64 bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-[2rem] px-6 py-4 text-xs font-black uppercase tracking-widest text-[var(--text-primary)] outline-none glass appearance-none cursor-pointer hover:bg-[var(--accent-soft)] transition-all"
            >
              <option value="Todos">Todos os Estágios</option>
              {JOURNEY_STAGES.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
           </select>
         )}
      </div>
    </div>
  );
}
