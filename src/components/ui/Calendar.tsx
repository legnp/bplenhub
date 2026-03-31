"use client";

import React, { useState } from "react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  getISOWeek,
  parseISO
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from "lucide-react";

/**
 * BPlen HUB — Calendar UI Component
 * Calendário Premium com Suporte a SI (Semana ISO).
 * Design-agnóstico para uso em todo o ecossistema.
 */

export interface CalendarEvent {
  id: string;
  summary: string;
  start: string; // ISO String (Date only or Full DateTime)
  htmlLink?: string;
  description?: string;
}

interface CalendarProps {
  events?: CalendarEvent[];
  isLoading?: boolean;
  onMonthChange?: (date: Date) => void;
}

export default function Calendar({ 
  events = [], 
  isLoading = false,
  onMonthChange 
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Controles de Navegação
  const nextMonth = () => {
    const nextDate = addMonths(currentDate, 1);
    setCurrentDate(nextDate);
    onMonthChange?.(nextDate);
  };

  const prevMonth = () => {
    const prevDate = subMonths(currentDate, 1);
    setCurrentDate(prevDate);
    onMonthChange?.(prevDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onMonthChange?.(today);
  };

  // Re-utilização do Design Centralizado
  const renderHeader = () => (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-[#667eea]/10 rounded-xl">
          <CalendarIcon className="w-5 h-5 text-[#667eea]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#1D1D1F] capitalize">
            {format(currentDate, "MMMM", { locale: ptBR })}
          </h2>
          <p className="text-sm font-medium text-[#1D1D1F]/50">
            {format(currentDate, "yyyy")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm p-1.5 rounded-xl border border-white/60 shadow-[0_4px_16px_0_rgba(31,38,135,0.02)]">
        <button 
          onClick={prevMonth} 
          className="p-2 hover:bg-black/5 rounded-lg transition-colors text-[#1D1D1F]/70 hover:text-[#1D1D1F]"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button 
          onClick={goToToday} 
          className="px-4 py-1.5 text-xs font-semibold tracking-wide bg-gradient-to-tr from-[#667eea]/10 to-[#764ba2]/10 text-[#667eea] hover:bg-[#667eea]/20 rounded-lg transition-all"
        >
          HOJE
        </button>
        <button 
          onClick={nextMonth} 
          className="p-2 hover:bg-black/5 rounded-lg transition-colors text-[#1D1D1F]/70 hover:text-[#1D1D1F]"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });

    days.push(
      <div key="SI" className="text-center font-bold text-[11px] text-[#764ba2] bg-[#764ba2]/5 py-2 rounded-lg mr-2 uppercase tracking-wider">
        SI
      </div>
    );

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-semibold text-[11px] text-[#1D1D1F]/60 uppercase tracking-wider py-2">
          {format(addDays(startDate, i), "EEEEEE", { locale: ptBR })}
        </div>
      );
    }
    return <div className="grid grid-cols-[40px_repeat(7,1fr)] gap-1 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      const weekNumber = getISOWeek(day);
      days.push(
        <div key={`si-${day}`} className="flex items-center justify-center mr-2">
          <span className="text-[10px] font-bold text-[#764ba2]/60 bg-[#764ba2]/10 w-full text-center py-1 rounded-md shadow-sm border border-[#764ba2]/20">
            {weekNumber.toString().padStart(2, '0')}
          </span>
        </div>
      );

      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, "d");
        const cloneDay = day;
        
        const dayEvents = events.filter((e) => {
          if (!e.start) return false;
          const evDate = e.start.length === 10 ? parseISO(e.start) : parseISO(e.start);
          return isSameDay(evDate, cloneDay);
        });

        days.push(
          <div
            key={day.toString()}
            className={`min-h-[100px] p-2 border border-black/[0.03] bg-white/40 rounded-xl transition-all hover:bg-white hover:shadow-sm ${
              !isSameMonth(day, monthStart) 
                ? "opacity-40 grayscale" 
                : isSameDay(day, new Date()) 
                  ? "ring-2 ring-[#667eea]/50 bg-gradient-to-b from-white to-[#667eea]/5" 
                  : ""
            }`}
          >
            <div className="flex justify-end">
              <span className={`text-xs font-semibold w-7 h-7 flex items-center justify-center rounded-full ${
                isSameDay(day, new Date()) ? "bg-[#667eea] text-white shadow-md shadow-[#667eea]/30" : "text-[#1D1D1F]/80"
              }`}>
                {formattedDate}
              </span>
            </div>

            <div className="mt-2 space-y-1 overflow-y-auto max-h-[60px] custom-scrollbar">
              {dayEvents.map(ev => (
                <div 
                  key={ev.id} 
                  className="block text-[10px] bg-[#667eea]/10 text-[#667eea] border border-[#667eea]/20 rounded-md px-1.5 py-1 truncate transition-colors"
                  title={ev.summary}
                >
                  {ev.summary}
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }

      rows.push(
        <div key={day.toString()} className="grid grid-cols-[40px_repeat(7,1fr)] gap-1 mb-1">
          {days}
        </div>
      );
      days = [];
    }

    return <div>{rows}</div>;
  };

  return (
    <div className="w-full relative">
      <div className="bg-white/30 backdrop-blur-md rounded-2xl border border-white/60 p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.03)]">
        {renderHeader()}
        
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
             <div className="flex flex-col items-center gap-3">
               <Loader2 className="w-8 h-8 text-[#667eea] animate-spin" />
               <p className="text-sm font-medium text-[#667eea]">Carregando Informações...</p>
             </div>
          </div>
        )}

        {renderDays()}
        {renderCells()}
      </div>

      <div className="mt-4 px-2 py-3 bg-[#764ba2]/5 border border-[#764ba2]/10 rounded-xl flex items-start gap-3">
        <div className="p-1.5 bg-[#764ba2]/10 rounded-lg shrink-0 mt-0.5">
          <CalendarIcon className="w-3.5 h-3.5 text-[#764ba2]" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-[#764ba2]">Semana ISO (SI)</h4>
          <p className="text-[11px] font-medium text-[#1D1D1F]/60 mt-0.5 leading-relaxed">
            A coluna "SI" representa o sistema padrão global de contagem de semanas (ISO-8601). 
            Essencial para planejamentos operacionais e sprints do ecossistema BPlen.
          </p>
        </div>
      </div>
    </div>
  );
}
