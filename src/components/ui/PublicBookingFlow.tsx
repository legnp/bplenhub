"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  CheckCircle2,
  Loader2,
  AlertCircle,
  Clock,
  Calendar as CalendarIcon
} from "lucide-react";
import { InputGlass } from "./InputGlass";
import { NavButton } from "./NavButton";
import { getPublicSlotsAction, bookPublicMeetingAction, TimeSlot } from "@/actions/external-booking";
import { CALENDAR_CONFIG } from "@/config/calendarConfig";

type Step = "lead" | "triagem" | "calendar" | "success";

export function PublicBookingFlow() {
  const [step, setStep] = useState<Step>("lead");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    screening: {
      objetivo: "",
      conheceu_como: "",
      cargo: ""
    }
  });

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(addDays(new Date(), 1));
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSlots = useCallback(async (date: Date) => {
    setIsLoadingSlots(true);
    setSelectedSlot(null);
    try {
      const res = await getPublicSlotsAction(format(date, "yyyy-MM-dd"));
      setSlots(res);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar horários. Tente novamente.");
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (step === "calendar") {
      fetchSlots(selectedDate);
    }
  }, [step, selectedDate, fetchSlots]);

  const handleBooking = async () => {
    if (!selectedSlot) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await bookPublicMeetingAction({
        ...formData,
        slot: selectedSlot
      });
      if (res.success) {
        setStep("success");
      } else {
        setError(res.message || "Erro ao confirmar agendamento.");
      }
    } catch (err) {
      console.error(err);
      setError("Erro de rede. Verifique sua conexão.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  // --- CALENDAR GRID LOGIC ---
  const calendarCells = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 });

    const cells = [];
    let day = startDate;

    while (day <= endDate) {
      cells.push(day);
      day = addDays(day, 1);
    }
    return cells;
  }, [currentMonth]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4">
      {/* 48px Header */}
      <div className="text-center space-y-4 mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
        <h1 className="text-[48px] font-black tracking-tighter bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent leading-[1.1]">
          Reserve seu Momento BPlen
        </h1>
        <p className="text-white/60 text-lg font-medium max-w-xl mx-auto leading-relaxed">
          Que tal descomplicarmos o desenvolvimento humano no trabalho juntos? <br/>
          Escolha um slot abaixo e receba a confirmação em seu e-mail.
        </p>
      </div>

      <div className={`w-full ${step === 'calendar' ? 'max-w-4xl' : 'max-w-xl'} mx-auto p-4 sm:p-8 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] shadow-2xl relative overflow-hidden theme-dark group transition-all duration-700`}>
        
        {/* 🔮 Glow Decoration */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#667eea]/20 rounded-full blur-3xl group-hover:bg-[#667eea]/30 transition-all duration-700" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#764ba2]/20 rounded-full blur-3xl opacity-50" />

        <AnimatePresence mode="wait">
          
          {step === "lead" && (
            <motion.div key="lead" {...containerVariants} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <h3 className="text-2xl font-black bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
                  Agende sua Reunião
                </h3>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
                  PRIMEIRO, PRECISAMOS TE CONHECER 🛡️
                </p>
              </div>

              <div className="space-y-4">
                <InputGlass 
                  label="Nome Completo" 
                  placeholder="Como devemos te chamar?" 
                  value={formData.name}
                  className="!bg-white/10 !border-white/10 !text-white text-sm"
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                
                <div className="space-y-1.5 text-left relative">
                  <InputGlass 
                    label="E-mail Corporativo" 
                    placeholder="seu@email.com" 
                    type="email"
                    value={formData.email}
                    className="!bg-white/10 !border-white/10 !text-white text-sm"
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({...formData, email: val});
                      
                      // Scanner de erros de digitação para domínios populares
                      const domains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'bplen.com'];
                      const [user, domain] = val.split('@');
                      if (domain && domain.length > 2) {
                        const suggestion = domains.find(d => d.startsWith(domain) && d !== domain);
                        if (suggestion) {
                          setError(`Você quis dizer @${suggestion}?`);
                        } else {
                          setError(null);
                        }
                      }
                    }}
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] ml-1">WhatsApp / Telefone</label>
                  <div className="flex gap-2">
                    <select 
                      className="w-24 bg-white/10 border border-white/10 rounded-2xl text-xs text-white p-3 focus:outline-none focus:ring-1 focus:ring-[#667eea]"
                      value={formData.phone.split(' ')[0] || "+55"}
                      onChange={(e) => {
                        const rest = formData.phone.split(' ').slice(1).join(' ');
                        setFormData({...formData, phone: `${e.target.value} ${rest}`});
                      }}
                    >
                      <option value="+55" className="bg-[#1D1D1F]">🇧🇷 +55</option>
                      <option value="+1" className="bg-[#1D1D1F]">🇺🇸 +1</option>
                      <option value="+351" className="bg-[#1D1D1F]">🇵🇹 +351</option>
                    </select>
                    <input 
                      placeholder="DDD"
                      maxLength={2}
                      className="w-16 bg-white/10 border border-white/10 rounded-2xl text-xs text-white p-3 text-center focus:outline-none focus:ring-1 focus:ring-[#667eea]"
                      onChange={(e) => {
                        const ddd = e.target.value.replace(/\D/g, "");
                        const ddi = formData.phone.split(' ')[0] || "+55";
                        const num = formData.phone.split(' ')[1]?.substring(2) || "";
                        setFormData({...formData, phone: `${ddi} ${ddd}${num}`});
                      }}
                    />
                    <input 
                      placeholder="Número"
                      className="flex-1 bg-white/10 border border-white/10 rounded-2xl text-xs text-white p-3 focus:outline-none focus:ring-1 focus:ring-[#667eea]"
                      onChange={(e) => {
                        const num = e.target.value.replace(/\D/g, "");
                        const ddi = formData.phone.split(' ')[0] || "+55";
                        const ddd = formData.phone.split(' ')[1]?.substring(0, 2) || "";
                        setFormData({...formData, phone: `${ddi} ${ddd}${num}`});
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <NavButton 
                  onClick={() => setStep("triagem")} 
                  disabled={!formData.name || !formData.email || !formData.phone} 
                />
              </div>
            </motion.div>
          )}

          {step === "triagem" && (
            <motion.div key="triagem" {...containerVariants} className="space-y-6 relative z-10 text-left">
               <div className="flex items-center gap-2">
                <button onClick={() => setStep("lead")} className="p-2 hover:bg-white/5 rounded-full transition-all">
                  <ChevronLeft className="w-5 h-5 text-white/40" />
                </button>
                <h3 className="text-xl font-black text-white">Demanda da reunião</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] ml-1">
                    Qual o objetivo da reunião?
                  </label>
                  <textarea 
                    className="w-full bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#667eea] transition-all min-h-[120px]"
                    placeholder="Conte um pouco sobre o que você busca..."
                    value={formData.screening.objetivo}
                    onChange={(e) => setFormData({...formData, screening: {...formData.screening, objetivo: e.target.value}})}
                  />
                </div>
                
                <InputGlass 
                  label="Sua Profissão / Cargo" 
                  placeholder="Ex: Diretor de RH, Consultor..." 
                  value={formData.screening.cargo}
                  className="!bg-white/10 !border-white/10 !text-white"
                  onChange={(e) => setFormData({...formData, screening: {...formData.screening, cargo: e.target.value}})}
                />

                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] ml-1">Como conheceu a BPlen?</label>
                  <select 
                    value={formData.screening.conheceu_como}
                    onChange={(e) => setFormData({...formData, screening: {...formData.screening, conheceu_como: e.target.value}})}
                    className="w-full bg-white/10 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="bg-[#1D1D1F]">Selecione uma opção...</option>
                    <option value="Linkedin" className="bg-[#1D1D1F]">LinkedIn</option>
                    <option value="Instagram" className="bg-[#1D1D1F]">Instagram</option>
                    <option value="Google" className="bg-[#1D1D1F]">Google</option>
                    <option value="Lisandra Lencina" className="bg-[#1D1D1F]">Lisandra Lencina</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <p className="text-[9px] text-white/20 uppercase font-black tracking-widest italic">
                  Sua resposta nos ajuda a preparar o melhor material 🧪
                </p>
                <NavButton 
                  onClick={() => setStep("calendar")} 
                  disabled={!formData.screening.objetivo} 
                />
              </div>
            </motion.div>
          )}

          {step === "calendar" && (
            <motion.div key="calendar" {...containerVariants} className="space-y-8 relative z-10 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => setStep("triagem")} className="p-2 hover:bg-white/5 rounded-full transition-all">
                    <ChevronLeft className="w-5 h-5 text-white/40" />
                  </button>
                  <h3 className="text-xl font-black text-white">Escolha um Horário</h3>
                </div>
                <div className="flex items-center gap-4">
                   <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">AGENDA VIRTUAL 📺</p>
                </div>
              </div>

              <div className="flex flex-col lg:grid lg:grid-cols-[1fr_320px] gap-8">
                
                {/* --- MINI CALENDAR GRID --- */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h4 className="text-sm font-black text-white uppercase tracking-widest">
                      {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                    </h4>
                    <div className="flex items-center gap-1">
                      <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                        <ChevronLeft className="w-4 h-4 text-white" />
                      </button>
                      <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                        <ChevronRight className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-8 gap-1">
                    <div className="text-center py-2"><span className="text-[9px] font-black text-[#764ba2] uppercase tracking-tighter opacity-50">SI</span></div>
                    {["S", "T", "Q", "Q", "S", "S", "D"].map((d, i) => (
                      <div key={i} className="text-center py-2"><span className="text-[9px] font-black text-white/30 uppercase">{d}</span></div>
                    ))}

                    {calendarCells.map((day, idx) => {
                      const isSelected = isSameDay(day, selectedDate);
                      const isCurrentMonth = isSameMonth(day, currentMonth);
                      const isPast = isBefore(day, startOfDay(new Date()));
                      const weekNumber = getISOWeek(day);

                      return (
                        <React.Fragment key={day.toString()}>
                          {(idx % 7 === 0) && (
                            <div className="flex items-center justify-center py-2 opacity-30">
                              <span className="text-[9px] font-black text-[#764ba2]">{weekNumber.toString().padStart(2, '0')}</span>
                            </div>
                          )}
                          <button
                            onClick={() => !isPast && setSelectedDate(day)}
                            disabled={isPast && !isSelected}
                            className={`relative flex flex-col items-center justify-center py-3 rounded-2xl transition-all duration-300 border
                                       ${isSelected 
                                         ? "bg-[#667eea] border-[#667eea] text-white shadow-xl shadow-[#667eea]/30 scale-105 z-10" 
                                         : isToday(day) 
                                           ? "bg-[#667eea]/10 border-white/5 text-[#667eea] font-bold" 
                                           : isCurrentMonth ? "text-white border-transparent hover:border-white/10 hover:bg-white/5" : "text-white/10 border-transparent"
                                       } ${isPast && !isSelected ? "opacity-10 cursor-not-allowed" : ""}`}
                          >
                            <span className="text-xs font-bold">{format(day, "d")}</span>
                          </button>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* --- SLOTS LIST --- */}
                <div className="flex flex-col h-full space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-[9px] font-black text-[#667eea] uppercase tracking-[0.2em]">PROGRAMAÇÃO DISPONÍVEL</h4>
                    <p className="text-lg font-black text-white capitalize">
                      {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </p>
                  </div>

                  <div className="flex-1 min-h-[300px] max-h-[400px] overflow-y-auto pr-4 space-y-2 custom-scrollbar">
                    {isLoadingSlots ? (
                      <div className="h-full flex flex-col items-center justify-center gap-3 opacity-20 py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-white" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Calculando Slots...</span>
                      </div>
                    ) : slots.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-20">
                        <CalendarIcon className="w-6 h-6 text-white/10 mb-4" />
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Nenhum horário livre.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {slots.map((s) => (
                          <button
                            key={s.id}
                            disabled={!s.available}
                            onClick={() => setSelectedSlot(s.id)}
                            className={`py-4 rounded-2xl text-xs font-black transition-all border
                                       ${!s.available ? "opacity-10 cursor-not-allowed grayscale" : "cursor-pointer"}
                                       ${selectedSlot === s.id 
                                         ? "bg-[#667eea] border-[#667eea] text-white shadow-lg scale-[1.02]" 
                                         : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20"}`}
                          >
                            <div className="flex items-center justify-center gap-2">
                               <Clock className="w-3 h-3 opacity-30" />
                               {format(parseISO(s.start), "HH:mm")}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-[10px] font-black">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      onClick={handleBooking}
                      disabled={!selectedSlot || isSubmitting}
                      className="w-full h-14 bg-white text-black rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      {isSubmitting ? "PROCESSANDO..." : "CONFIRMAR E AGENDAR"}
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div key="success" {...containerVariants} className="text-center py-12 space-y-6 relative z-10">
              <div className="w-24 h-24 bg-[#667eea]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#667eea]/20 shadow-[0_0_50px_rgba(102,126,234,0.1)]">
                <CheckCircle2 className="w-12 h-12 text-[#667eea]" />
              </div>
              <div className="space-y-3">
                <h3 className="text-4xl font-black text-white tracking-tighter">Solicitação Recebida!</h3>
                <p className="text-white/60 text-base font-medium leading-relaxed">
                  Enviamos um e-mail de confirmação para <br/>
                  <span className="text-[#667eea] font-black">{formData.email}</span>
                </p>
              </div>
              <div className="p-5 bg-white/5 border border-white/10 rounded-2xl max-w-[320px] mx-auto space-y-2 text-left">
                <p className="text-[10px] font-black text-[#667eea] uppercase tracking-[0.2em]">⚡ Próximos Passos</p>
                <p className="text-xs text-white/60 leading-relaxed">
                  Você receberá um e-mail com o link do Google Meet e o convite de calendário anexado. Por favor, verifique sua caixa de entrada e spam.
                </p>
              </div>
              <div className="pt-6">
                <button
                  onClick={() => window.location.href = "/"}
                  className="px-10 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-white transition-all"
                >
                  Retornar ao HUB
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
