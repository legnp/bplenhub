"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  parseISO,
  isToday,
  isBefore,
  startOfDay
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Loader2, 
  Clock, 
  ChevronDown,
  Filter,
  CheckCircle2,
  AlertCircle,
  Users,
  User,
  Tag,
  X,
  Target,
  MessageSquare,
  BadgeCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthContext } from "@/context/AuthContext";
import { bookEventAction } from "@/actions/calendar";
import { getOneToOneTypes } from "@/actions/OneToOneActions";

/**
 * BPlen HUB — Calendar UI (Booking Edition)
 */

export interface CalendarEvent {
  id: string;
  summary: string;
  start: string; // ISO String
  end?: string;
  htmlLink?: string;
  description?: string;
  status?: string;
  totalCapacity?: number;
  registeredCount?: number;
  mentor?: string;
  theme?: string;
}

interface CalendarProps {
  events?: CalendarEvent[];
  isLoading?: boolean;
  onMonthChange?: (date: Date) => void;
  onBookingSuccess?: () => void;
}

export default function Calendar({ 
  events = [], 
  isLoading = false,
  onMonthChange,
  onBookingSuccess 
}: CalendarProps) {
  const { user } = useAuthContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterType, setFilterType] = useState("Todos");
  const [bookingStatus, setBookingStatus] = useState<{ id: string, message: string, type: 'success' | 'error' } | null>(null);

  // Estados do Modal de Confirmação
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [eventToConfirm, setEventToConfirm] = useState<CalendarEvent | null>(null);
  const [oneToOneTypes, setOneToOneTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState("");
  const [expectations, setExpectations] = useState("");
  const [isBooking, setIsBooking] = useState<string | null>(null);

  // Carregar tipos 1-to-1
  useEffect(() => {
    async function load() {
      const types = await getOneToOneTypes();
      setOneToOneTypes(types);
    }
    load();
  }, []);

  // --- LÓGICA DE DADOS ---

  const eventTypes = useMemo(() => {
    const types = new Set<string>();
    events.forEach(ev => {
      if (ev.summary) types.add(ev.summary);
    });
    return ["Todos", ...Array.from(types).sort()];
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (filterType === "Todos") return events;
    return events.filter(ev => ev.summary === filterType);
  }, [events, filterType]);

  const selectedDayEvents = useMemo(() => {
    const now = new Date();
    const minLeadTime = addDays(startOfDay(now), 3);
    const maxOnboardingWindow = addDays(startOfDay(now), 20);

    return filteredEvents.filter(ev => {
      const evDate = parseISO(ev.start);
      if (!isSameDay(evDate, selectedDate)) return false;
      if (isBefore(evDate, minLeadTime)) return false;
      if (ev.summary.toLowerCase().includes("onboarding")) {
         if (!isBefore(evDate, maxOnboardingWindow)) return false;
      }
      return true;
    });
  }, [filteredEvents, selectedDate]);

  // --- AÇÕES ---

  const handleBooking = async (eventId: string, oneToOneData?: { type: string; expectations: string }) => {
    if (!user) return;
    setIsBooking(eventId);
    setBookingStatus(null);
    try {
      const result = (await bookEventAction(eventId, user.uid, user.email || "", oneToOneData)) as { success: boolean; message: string };
      if (result.success) {
        setBookingStatus({ id: eventId, message: "Agendamento realizado com sucesso!", type: 'success' });
        onBookingSuccess?.();
        setIsConfirmModalOpen(false);
        setExpectations("");
        setSelectedType("");
      } else {
        setBookingStatus({ id: eventId, message: result.message || "Erro ao agendar.", type: 'error' });
      }
    } catch (e) {
      setBookingStatus({ id: eventId, message: "Erro crítico no agendamento.", type: 'error' });
    } finally {
      setIsBooking(null);
    }
  };

  const openConfirmModal = (event: CalendarEvent) => {
    setEventToConfirm(event);
    setIsConfirmModalOpen(true);
    setBookingStatus(null);
  };
  
  const nextMonth = () => {
    const next = addMonths(currentDate, 1);
    setCurrentDate(next);
    onMonthChange?.(next);
  };
  
  const prevMonth = () => {
    const prev = subMonths(currentDate, 1);
    setCurrentDate(prev);
    onMonthChange?.(prev);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    onMonthChange?.(today);
  };

  // --- RENDERIZAÇÃO ---

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500">
      
      {/* 1. Header Bar: Filtros */}
      <div className="flex justify-end gap-3 px-2">
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1D1D1F]/40 group-focus-within:text-[#667eea]">
              <Filter className="w-3.5 h-3.5" />
          </div>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="appearance-none pl-9 pr-10 py-2 bg-white/40 backdrop-blur-md border border-white/60 rounded-xl text-xs font-bold text-[#1D1D1F]/70 focus:outline-none focus:ring-2 focus:ring-[#667eea]/20 transition-all cursor-pointer hover:bg-white/60 uppercase tracking-tight"
          >
            {eventTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#1D1D1F]/30 pointer-events-none" />
        </div>
      </div>

      {/* 2. Política de Agendamento */}
      <div className="flex flex-col md:flex-row gap-4 p-5 bg-[#1D1D1F]/5 border border-white/40 rounded-3xl animate-in fade-in slide-in-from-top-2 duration-700">
         <div className="flex items-center gap-3 md:border-r md:border-black/5 md:pr-6 text-left">
            <div className="p-2 bg-white/80 rounded-xl shadow-sm text-[#764ba2]"><CalendarIcon className="w-4 h-4" /></div>
            <p className="text-[10px] font-black text-[#1D1D1F]/60 uppercase tracking-widest leading-none text-left">Política de<br/>Agendamento</p>
         </div>
         <div className="flex-1 text-left">
            <p className="text-[10px] font-bold text-[#1D1D1F]/40 leading-relaxed italic text-left">
               As sessões são liberadas com <span className="text-[#1D1D1F] font-black">3 dias de antecedência</span>. Eventos de <span className="text-[#667eea] font-black">Onboarding</span> possuem visibilidade limitada a 20 dias. O limite de participação é de <span className="text-[#1D1D1F] font-black uppercase">1 evento por semana (SI)</span>.
            </p>
         </div>
      </div>

      {/* 3. Grid Principal */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* COLUNA ESQUERDA: MINI CALENDAR + LEGENDA */}
        <div className="w-full lg:w-[360px] shrink-0 flex flex-col gap-4">
          <div className="bg-white/30 backdrop-blur-md rounded-3xl border border-white/60 p-5 shadow-[0_8px_32_0_rgba(31,38,135,0.02)]">
            
            <div className="flex items-center justify-between mb-6 px-1 text-left">
              <h3 className="text-sm font-black text-[#1D1D1F] uppercase tracking-widest leading-none">
                {format(currentDate, "MMMM yyyy", { locale: ptBR })}
              </h3>
              <div className="flex items-center gap-1">
                <button onClick={prevMonth} className="p-1.5 hover:bg-black/5 rounded-lg transition-colors text-[#1D1D1F]/50 hover:text-[#1D1D1F]">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={goToToday} className="px-2.5 py-1 text-[10px] font-black bg-[#667eea]/10 text-[#667eea] hover:bg-[#667eea]/20 rounded-md transition-all uppercase">
                  Hoje
                </button>
                <button onClick={nextMonth} className="p-1.5 hover:bg-black/5 rounded-lg transition-colors text-[#1D1D1F]/50 hover:text-[#1D1D1F]">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-8 gap-0.5">
              <div className="text-center py-2"><span className="text-[10px] font-black text-[#764ba2]/40 uppercase tracking-tighter">SI</span></div>
              {["S", "T", "Q", "Q", "S", "S", "D"].map((d, i) => (
                <div key={i} className="text-center py-2"><span className="text-[10px] font-black text-[#1D1D1F]/30 uppercase">{d}</span></div>
              ))}

              {(() => {
                const monthStart = startOfMonth(currentDate);
                const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
                const endDate = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 });
                const cells = [];
                let day = startDate;

                while (day <= endDate) {
                  const cloneDay = day;
                  const isSelected = isSameDay(day, selectedDate);
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  const isCurrentDay = isToday(day);
                  const isPast = isBefore(day, startOfDay(new Date()));
                  const weekNumber = getISOWeek(day);

                  if (day.getDay() === 1 || day === startDate) {
                    cells.push(
                      <div key={`si-${day}`} className="flex items-center justify-center py-2.5">
                        <span className="text-[10px] font-black text-[#764ba2] opacity-60">{weekNumber.toString().padStart(2, '0')}</span>
                      </div>
                    );
                  }

                  const now = new Date();
                  const leadDate = addDays(startOfDay(now), 3);
                  const maxOnboarding = addDays(startOfDay(now), 20);
                  
                  const hasVisibleEvents = filteredEvents.some(ev => {
                    const evDate = parseISO(ev.start);
                    if (!isSameDay(evDate, cloneDay)) return false;
                    if (isBefore(evDate, leadDate)) return false;
                    if (ev.summary.toLowerCase().includes("onboarding") && !isBefore(evDate, maxOnboarding)) return false;
                    return true;
                  });

                  cells.push(
                    <button
                      key={day.toString()}
                      onClick={() => setSelectedDate(cloneDay)}
                      className={`relative flex flex-col items-center justify-center py-2.5 rounded-xl transition-all duration-300 ${
                        isSelected ? "bg-[#667eea] text-white shadow-lg shadow-[#667eea]/30 scale-105 z-10" : 
                        isCurrentDay ? "bg-[#667eea]/10 text-[#667eea] font-bold" : 
                        isCurrentMonth ? "text-[#1D1D1F]" : "text-[#1D1D1F]/20"
                      } ${isPast && !isSelected && !isCurrentDay ? "opacity-30 grayscale saturate-0" : ""}`}
                    >
                      <span className="text-[11px] font-bold">{format(day, "d")}</span>
                      {hasVisibleEvents && !isSelected && (
                        <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isPast ? "bg-[#1D1D1F]/20" : "bg-[#667eea]"}`} />
                      )}
                    </button>
                  );
                  day = addDays(day, 1);
                }
                return cells;
              })()}
            </div>
          </div>

          {/* Legenda SI */}
          <div className="px-4 py-2 bg-transparent border-none animate-in fade-in slide-in-from-top-2 duration-700">
            <div className="flex items-start gap-3 group text-left">
              <div className="shrink-0 w-6 h-6 flex items-center justify-center bg-[#764ba2]/5 rounded-lg border border-[#764ba2]/10 transition-all group-hover:bg-[#764ba2]/10">
                <span className="text-[10px] font-black text-[#764ba2]">SI</span>
              </div>
              <div className="flex flex-col">
                <p className="text-[9px] font-black text-[#1D1D1F]/70 uppercase tracking-widest leading-none mb-1 text-left">Semana ISO</p>
                <p className="text-[9px] font-bold text-[#1D1D1F]/50 leading-relaxed italic text-left">
                  Padrão internacional de contagem utilizado para sincronização de cronogramas globais (SI-01 a SI-52).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: EVENT PANEL */}
        <div className="flex-1 w-full lg:h-[400px] bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 p-8 shadow-[0_8px_32_0_rgba(31,38,135,0.03)] flex flex-col">
          
          <div className="mb-4 text-left">
            <h4 className="text-[10px] font-black text-[#667eea] uppercase tracking-[0.2em] mb-1">PROGRAMAÇÃO DISPONÍVEL</h4>
            <h2 className="text-2xl font-black text-[#1D1D1F] capitalize">
              {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </h2>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-4 custom-scrollbar">
            {isLoading ? (
               <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-20">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Aguarde...</p>
               </div>
            ) : selectedDayEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                 <div className="p-4 bg-black/5 rounded-full mb-4">
                    <CalendarIcon className="w-6 h-6 text-[#1D1D1F]/10" />
                 </div>
                 <h3 className="text-xs font-bold text-[#1D1D1F]/40 uppercase tracking-widest leading-relaxed">
                   Nenhuma sessão disponível para esta data<br/>
                   <span className="text-[9px] opacity-50 lowercase tracking-normal">Consulte as regras de antecedência de 3 dias</span>
                 </h3>
              </div>
            ) : (
              selectedDayEvents.map(ev => {
                const capacity = ev.totalCapacity || 0;
                const registered = ev.registeredCount || 0;
                const isFull = registered >= capacity && capacity > 0;
                const status = bookingStatus?.id === ev.id ? bookingStatus : null;

                return (
                  <div key={ev.id} className="group relative flex flex-col p-6 bg-white border border-black/[0.03] rounded-3xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-300">
                    <div className="flex gap-5">
                      <div className="shrink-0 flex flex-col items-center gap-1 pt-1">
                        <span className="text-[11px] font-black text-[#1D1D1F]">{format(parseISO(ev.start), "HH:mm")}</span>
                        <div className="w-0.5 h-10 bg-black/[0.05] rounded-full" />
                        <Clock className="w-3 h-3 text-[#1D1D1F]/20" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                           <div className="text-left">
                             <h5 className="font-black text-[#1D1D1F] text-sm group-hover:text-[#667eea] transition-colors leading-tight">{ev.summary}</h5>
                             
                             <div className="flex items-center gap-2 mt-1">
                               <Users className="w-3 h-3 text-[#1D1D1F]/30" />
                               <span className={`text-[10px] font-bold ${isFull ? "text-red-500" : "text-[#1D1D1F]/40"}`}>
                                 {isFull ? "ESGOTADO" : `${capacity - registered} vagas disponíveis`}
                               </span>
                             </div>

                             <div className="flex items-center gap-2 mt-1">
                               <User className="w-3 h-3 text-[#1D1D1F]/30" />
                               <span className="text-[10px] font-bold text-[#1D1D1F]/40 uppercase tracking-tight">
                                 Orientador: {ev.mentor || "BPlen"}
                               </span>
                             </div>
                             
                             {ev.theme && (
                                <div className="flex items-center gap-2 mt-1">
                                  <Tag className="w-3 h-3 text-[#667eea]/40" />
                                  <span className="text-[10px] font-bold text-[#667eea] uppercase tracking-tight">
                                    Tema: {ev.theme}
                                  </span>
                                </div>
                             )}
                           </div>

                           <button 
                              onClick={() => openConfirmModal(ev)}
                              disabled={isBooking === ev.id || isFull}
                              className={`px-5 py-2.5 rounded-xl text-[9px] font-black transition-all uppercase tracking-widest shrink-0 shadow-lg ${
                                isFull 
                                  ? "bg-black/5 text-[#1D1D1F]/20 shadow-none scale-100" 
                                  : isBooking === ev.id
                                    ? "bg-[#667eea]/50 text-white cursor-wait"
                                    : "bg-gradient-to-tr from-[#667eea] to-[#764ba2] text-white shadow-[#667eea]/20 hover:scale-[1.05] active:scale-[0.95]"
                              }`}
                           >
                              {isBooking === ev.id ? "Aguarde..." : isFull ? "Sem Vagas" : "Agendar Reunião"}
                           </button>
                        </div>
                        {ev.description && (
                           <p className="text-[10px] text-[#1D1D1F]/50 line-clamp-2 italic leading-relaxed bg-black/[0.02] p-3 rounded-xl mt-3 text-left">
                              "{ev.description}"
                           </p>
                        )}
                      </div>
                    </div>

                    {/* Feedback Overlays */}
                    {status && (
                       <div className={`mt-4 flex items-center gap-3 p-3 rounded-2xl animate-in slide-in-from-bottom-2 ${
                         status.type === 'success' ? "bg-green-500/10 text-green-700 border border-green-500/20" : "bg-red-500/10 text-red-700 border border-red-500/20"
                       }`}>
                          {status.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                          <span className="text-[10px] font-bold uppercase tracking-tight">{status.message}</span>
                       </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
