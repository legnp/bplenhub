"use client";

import React, { useState, useEffect } from "react";
import Calendar from "@/components/ui/Calendar";
import { getSyncedEvents, GoogleCalendarEvent } from "@/actions/calendar";
import UserBookings from "@/components/ui/UserBookings";
import { Settings, Info, CalendarCheck } from "lucide-react";

export default function GestaoAgendaPage() {
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Carregar dados iniciais dos eventos sincronizados
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
  }, []);

  return (
    <div className="space-y-6">
      {/* Header do Laboratório */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)] bg-clip-text text-transparent underline decoration-[var(--accent-start)]/20 underline-offset-8 text-left">
            Gestão de Agenda
          </h1>
          <p className="text-[var(--text-muted)] mt-2 font-medium flex items-center gap-2 text-left">
            <Settings className="w-3.5 h-3.5 text-[var(--accent-start)]" />
            Módulo de refinamento de layout e comportamento do Calendário.
          </p>
        </div>
      </div>

      <div className="bg-[var(--input-bg)] rounded-3xl p-1 border border-[var(--border-primary)] shadow-inner">
        <Calendar 
          events={events} 
          isLoading={isLoading} 
          onMonthChange={(date) => console.log("Mês alterado:", date)}
          onBookingSuccess={() => setRefreshCounter(p => p + 1)}
        />
      </div>

      {/* Meus Agendamentos (Novo Módulo) */}
      <div className="mt-12 bg-[var(--input-bg)] rounded-3xl p-6 border border-[var(--border-primary)] shadow-sm">
         <div className="flex items-center gap-2 mb-6 ml-2 text-left">
            <CalendarCheck className="w-5 h-5 text-[var(--accent-start)]" />
            <h2 className="text-xl font-black text-[var(--text-primary)]">Gestão de Meus Compromissos</h2>
         </div>
         <UserBookings refreshCounter={refreshCounter} />
      </div>

      {/* Info Help */}
      <div className="p-4 bg-[var(--accent-soft)] border border-[var(--border-primary)] rounded-2xl flex gap-3 text-[var(--text-muted)]">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-[var(--accent-start)]" />
        <p className="text-[11px] font-medium leading-relaxed italic text-left">
          Nota: Este módulo está sendo utilizado como laboratório para ajustes finos de UI/UX requisitados. As alterações feitas aqui serão propagadas globalmente para todas as instâncias do Calendário no HUB.
        </p>
      </div>
    </div>
  );
}
