"use client";

import React from "react";
import { GoogleCalendarEvent } from "@/actions/calendar";
import { CheckCircle2, Clock, ChevronRight } from "lucide-react";
import { format, parseISO } from "date-fns";

interface FechamentoEventosTabProps {
  pastEvents: GoogleCalendarEvent[];
  handleOpenWizard: (event: GoogleCalendarEvent) => void;
}

export default function FechamentoEventosTab({ pastEvents, handleOpenWizard }: FechamentoEventosTabProps) {
  return (
    <div className="bg-[var(--input-bg)] rounded-[2.5rem] p-8 border border-[var(--border-primary)] shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[var(--accent-start)]/10 rounded-2xl text-[var(--accent-start)]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Fechamento de Eventos</h2>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-40">Serviços concluídos aguardando ata e presença</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pastEvents.length === 0 ? (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-[var(--border-primary)] rounded-[2rem] opacity-30">
            <Clock className="w-8 h-8 mx-auto mb-3" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Nenhum evento passado encontrado</p>
          </div>
        ) : pastEvents.slice(0, 12).map(ev => (
          <div key={ev.id} className="group p-6 bg-[var(--bg-primary)]/40 border border-[var(--border-primary)] rounded-[2rem] hover:border-[var(--accent-start)]/30 transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${ev.postEventCompleted ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600 animate-pulse"}`}>
                {ev.postEventCompleted ? "Concluído" : "Pendente"}
              </span>
              <span className="text-[10px] font-bold text-[var(--text-muted)] opacity-40">
                {format(parseISO(ev.start), "dd/MM/yy")}
              </span>
            </div>
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-6 line-clamp-1">{ev.summary}</h4>
            
            <button 
              onClick={() => handleOpenWizard(ev)}
              className="w-full py-3 bg-[var(--input-bg)] hover:bg-[var(--accent-soft)] border border-[var(--border-primary)] rounded-xl text-[9px] font-bold uppercase tracking-widest text-[var(--text-primary)] flex items-center justify-center gap-2 group-hover:bg-[var(--accent-start)] group-hover:text-white group-hover:border-transparent transition-all"
            >
              {ev.postEventCompleted ? "Ver / Editar" : "Fechar Evento"}
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
