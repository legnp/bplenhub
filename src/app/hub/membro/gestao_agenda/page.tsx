"use client";

import React, { useState, useEffect } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getProgramacaoForMemberAction, GoogleCalendarEvent } from "@/actions/calendar";
import AgendaManagementView from "@/components/shared/AgendaManagementView";

/**
 * Gestão de Agenda do Membro — BPlen HUB 🧬
 * Estratégia de Máscara (Reuse de Componente Admin): Unifica a visão de compromissos.
 */
export default function GestaoAgendaPage() {
  const { user } = useAuthContext();
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Carregar dados iniciais dos eventos (Registry)
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await getProgramacaoForMemberAction();
        setEvents(data);
      } catch (error) {
        console.error("Erro ao carregar programação no Hub:", error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [refreshCounter]);

  return (
    <div className="flex flex-col min-h-screen animate-fade-in">
      <div className="max-w-[1400px] mx-auto p-6 md:p-12 space-y-12 flex-1 w-full">
        
        {/* Header de Navegação */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
           <div className="space-y-4">
              <Link 
                href="/hub/membro/dashboard"
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors group"
              >
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  Voltar ao Dashboard
              </Link>
              <div className="space-y-1">
                 <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase">
                    Gestão de <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]">Agenda</span>
                 </h1>
                 <p className="text-[var(--text-muted)] text-[11px] font-medium opacity-70">
                    Visualize, agende e gerencie todas as suas sessões e entregas estratégicas.
                 </p>
              </div>
           </div>

           <div className="px-4 py-1.5 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] text-[8px] font-black uppercase tracking-widest">
              Agenda Estratégica 🧬
           </div>
        </header>

        {/* ─── Shared View (Mascara) ─── */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
           <AgendaManagementView 
              events={events} 
              isLoading={isLoading} 
              refreshCounter={refreshCounter} 
              setRefreshCounter={setRefreshCounter}
           />
        </div>

      </div>
    </div>
  );
}
