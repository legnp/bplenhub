"use client";

import React, { useState, useEffect } from "react";
import Calendar from "@/components/ui/Calendar";
import { getSyncedEvents, GoogleCalendarEvent } from "@/actions/calendar";
import UserBookings from "@/components/ui/UserBookings";
import PostEventWizard from "@/components/admin/PostEventWizard";
import { Settings, Info, CalendarCheck, CheckCircle2, AlertCircle, ChevronRight, Clock } from "lucide-react";
import { format, isBefore, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function GestaoAgendaPage() {
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Post Event Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<GoogleCalendarEvent | null>(null);

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
  }, [refreshCounter]);

  const pastEvents = events.filter(ev => {
    if (!ev.start) return false;
    const evDate = parseISO(ev.start);
    return isBefore(evDate, new Date());
  }).sort((a,b) => parseISO(b.start).getTime() - parseISO(a.start).getTime());

  const handleOpenWizard = (event: GoogleCalendarEvent) => {
    setSelectedEvent(event);
    setIsWizardOpen(true);
  };

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
            Controle operacional, presença e fechamento de serviços.
          </p>
        </div>
      </div>

      {/* NOVO BLOCO: Eventos Pendentes de Fechamento */}
      <div className="bg-[var(--input-bg)] rounded-[2.5rem] p-8 border border-[var(--border-primary)] shadow-sm">
         <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
               <div className="p-2.5 bg-[var(--accent-start)]/10 rounded-2xl text-[var(--accent-start)]">
                  <CheckCircle2 className="w-5 h-5" />
               </div>
               <div>
                  <h2 className="text-xl font-black text-[var(--text-primary)]">Fechamento de Eventos</h2>
                  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40">Serviços concluídos aguardando ata e presença</p>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.length === 0 ? (
               <div className="col-span-full py-16 text-center border-2 border-dashed border-[var(--border-primary)] rounded-[2rem] opacity-30">
                  <Clock className="w-8 h-8 mx-auto mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Nenhum evento passado encontrado</p>
               </div>
            ) : pastEvents.slice(0, 6).map(ev => (
               <div key={ev.id} className="group p-6 bg-[var(--bg-primary)]/40 border border-[var(--border-primary)] rounded-[2rem] hover:border-[var(--accent-start)]/30 transition-all">
                  <div className="flex justify-between items-start mb-4">
                     <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${ev.postEventCompleted ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600 animate-pulse"}`}>
                        {ev.postEventCompleted ? "Concluído" : "Pendente"}
                     </span>
                     <span className="text-[10px] font-bold text-[var(--text-muted)] opacity-40">
                        {format(parseISO(ev.start), "dd/MM/yy")}
                     </span>
                  </div>
                  <h4 className="text-sm font-black text-[var(--text-primary)] mb-6 line-clamp-1">{ev.summary}</h4>
                  
                  <button 
                    onClick={() => handleOpenWizard(ev)}
                    className="w-full py-3 bg-[var(--input-bg)] hover:bg-[var(--accent-soft)] border border-[var(--border-primary)] rounded-xl text-[9px] font-black uppercase tracking-widest text-[var(--text-primary)] flex items-center justify-center gap-2 group-hover:bg-[var(--accent-start)] group-hover:text-white group-hover:border-transparent transition-all"
                  >
                     {ev.postEventCompleted ? "Ver / Editar" : "Fechar Evento"}
                     <ChevronRight className="w-3 h-3" />
                  </button>
               </div>
            ))}
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

      {/* Post Event Wizard Modal */}
      <PostEventWizard 
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        event={selectedEvent}
        onSuccess={() => setRefreshCounter(p => p + 1)}
      />

      {/* Info Help */}
      <div className="p-4 bg-[var(--accent-soft)] border border-[var(--border-primary)] rounded-2xl flex gap-3 text-[var(--text-muted)]">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-[var(--accent-start)]" />
        <p className="text-[11px] font-medium leading-relaxed italic text-left">
          Nota: O fluxo de pós-evento agora está integrado. Use o painel de &quot;Fechamento de Eventos&quot; para gerenciar a governança e presença dos serviços realizados.
        </p>
      </div>
    </div>
  );
}

