"use client";

import React from "react";
import Calendar from "@/components/ui/Calendar";
import UserBookings from "@/components/ui/UserBookings";
import { CalendarCheck } from "lucide-react";
import { GoogleCalendarEvent } from "@/actions/calendar";

interface AgendaManagementViewProps {
  events: GoogleCalendarEvent[];
  isLoading: boolean;
  refreshCounter: number;
  setRefreshCounter: React.Dispatch<React.SetStateAction<number>>;
  hideCalendar?: boolean;
}

/**
 * Shared Agenda Management View — BPlen HUB 🧬
 * Reused between Admin and Hub (Membro) to ensure visual and logic consistency.
 */
export default function AgendaManagementView({ 
  events, 
  isLoading, 
  refreshCounter, 
  setRefreshCounter,
  hideCalendar = false
}: AgendaManagementViewProps) {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Calendário Principal */}
      {!hideCalendar && (
        <div className="bg-[var(--input-bg)] rounded-[2.5rem] p-4 border border-[var(--border-primary)] shadow-inner">
          <Calendar 
            events={events as any} 
            isLoading={isLoading} 
            onMonthChange={(date) => console.log("Mês alterado:", date)}
            onBookingSuccess={() => setRefreshCounter(p => p + 1)}
          />
        </div>
      )}

      {/* Meus Agendamentos (Módulo de Compromissos) */}
      <div className="bg-[var(--input-bg)] rounded-[2.5rem] p-8 border border-[var(--border-primary)] shadow-sm">
         <div className="flex items-center gap-3 mb-8 ml-2 text-left">
            <div className="p-2.5 bg-[var(--accent-start)]/10 rounded-2xl text-[var(--accent-start)]">
               <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
               <h2 className="text-xl font-bold text-[var(--text-primary)]">Gestão de Meus Compromissos</h2>
               <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-40">Gestão e revisão da sua agenda BPlen</p>
            </div>
         </div>
         <UserBookings refreshCounter={refreshCounter} />
      </div>
    </div>
  );
}
