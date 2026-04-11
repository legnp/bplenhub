"use client";

import React, { useState, useEffect } from "react";
import { getSyncedEvents, GoogleCalendarEvent } from "@/actions/calendar";
import PostEventWizard from "@/components/admin/PostEventWizard";
import { 
  Info, 
  LayoutGrid, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock,
  LayoutList
} from "lucide-react";
import { isBefore, parseISO } from "date-fns";

// Sub-módulos (Abas)
import ProgramacaoResumo from "@/components/admin/ProgramacaoResumo";
import GestaoAgendaTab from "@/components/admin/GestaoAgendaTab";

type TabId = "resumo" | "agenda";

export default function GestaoAgendaPage() {
  const [activeTab, setActiveTab] = useState<TabId>("resumo");
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Carregar dados iniciais dos eventos sincronizados (para Agenda)
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await getSyncedEvents();
        setEvents(data);
      } catch (error) {
        console.error("Erro ao carregar prévia do calendário:", error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [refreshCounter]);

  const tabs = [
    { id: "resumo", label: "Gestão de Programação", icon: LayoutList },
    { id: "agenda", label: "Gestão de Agenda", icon: CalendarIcon },
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Header do Laboratório */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-[var(--text-primary)] text-left flex items-center gap-3">
             <div className="p-3 bg-[var(--accent-start)] rounded-2xl shadow-xl shadow-[var(--accent-start)]/20 text-white">
                <LayoutGrid size={24} className="stroke-[3]" />
             </div>
             <div>
                PROGRAMAÇÃO <span className="text-[var(--accent-start)] italic">HUB</span>
                <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1 block">Controle Center — Operações Administrativas</p>
             </div>
          </h1>
        </div>

        {/* Tab Navigation (Premium Sidebar/Header combo look) */}
        <div className="flex p-1.5 bg-[var(--input-bg)]/50 backdrop-blur-md rounded-[2rem] border border-[var(--border-primary)] shadow-sm">
           {tabs.map((tab) => {
             const Icon = tab.icon;
             const isSelected = activeTab === tab.id;
             return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)}
                  className={`flex items-center gap-2.5 px-6 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${isSelected ? "bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-lg shadow-[var(--text-primary)]/10" : "text-[var(--text-muted)] hover:text-[var(--text-primary)] opacity-60 hover:opacity-100"}`}
                >
                  <Icon size={14} className={isSelected ? "stroke-[3]" : "stroke-[2.5]"} />
                  {tab.label}
                </button>
             );
           })}
        </div>
      </div>

      <hr className="border-[var(--border-primary)] opacity-50" />

      {/* Main Content Area */}
      <div className="min-h-[600px]">
        {activeTab === "resumo" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <ProgramacaoResumo />
          </div>
        )}

        {activeTab === "agenda" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <GestaoAgendaTab 
                events={events} 
                isLoading={isLoading} 
                refreshCounter={refreshCounter} 
                setRefreshCounter={setRefreshCounter}
             />
          </div>
        )}
      </div>

      {/* Info Help */}
      <div className="p-6 bg-[var(--accent-soft)]/30 border border-[var(--border-primary)] rounded-[2.5rem] flex gap-4 text-[var(--text-muted)] shadow-sm">
        <div className="w-10 h-10 bg-[var(--accent-start)]/10 rounded-2xl flex items-center justify-center text-[var(--accent-start)] shrink-0">
           <Info className="w-5 h-5" />
        </div>
        <div className="space-y-1">
           <p className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-widest">Governança Integrada</p>
           <p className="text-[11px] font-medium leading-relaxed italic opacity-70">
              O fluxo de fechamento de eventos foi unificado. Agora, todas as operações de governança e análise de resultados estão concentradas na aba principal "Gestão de Programação".
           </p>
        </div>
      </div>
    </div>
  );
}

