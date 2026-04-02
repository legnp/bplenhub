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
  startOfDay,
  isSaturday,
  isSunday,
  setHours,
  setMinutes
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Clock,
  Calendar as CalendarIcon,
  Sparkles,
  X
} from "lucide-react";
import { InputGlass } from "./InputGlass";
import { NavButton } from "./NavButton";
import {
  getPublicSlotsAction,
  bookPublicMeetingAction,
  getPublicAvailableDaysAction,
  submitBookingProposalAction,
  TimeSlot
} from "@/actions/external-booking";
import { CALENDAR_CONFIG } from "@/config/calendarConfig";

type Step = "lead" | "triagem" | "calendar" | "success";

export function PublicBookingFlow() {
  const [step, setStep] = useState<Step>("calendar");
  const [isProposalMode, setIsProposalMode] = useState(false);
  const [proposalOptions, setProposalOptions] = useState<{ date: string; time: string }[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneDDI: "+55",
    phoneDDD: "",
    phoneNumber: "",
    screening: {
      objetivo: "",
      conheceu_como: "",
      cargo: ""
    }
  });

  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(addDays(new Date(), 1));
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [showPhoneWarning, setShowPhoneWarning] = useState(false);

  const fetchAvailableDays = useCallback(async () => {
    try {
      const res = await getPublicAvailableDaysAction();
      setAvailableDays(res);
      if (res.length > 0) {
        setSelectedDate(parseISO(res[0]));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchAvailableDays();
  }, [fetchAvailableDays]);

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
    if (!selectedSlot && proposalOptions.length === 0) return;
    setIsSubmitting(true);
    setError(null);
    try {
      if (isProposalMode) {
        const res = await submitBookingProposalAction({
          name: formData.name,
          email: formData.email,
          phone: `${formData.phoneDDI} ${formData.phoneDDD}${formData.phoneNumber}`,
          screening: formData.screening,
          options: proposalOptions
        });
        if (res.success) {
          setStep("success");
        } else {
          setError(res.message || "Erro ao enviar proposta.");
        }
      } else {
        const res = await bookPublicMeetingAction({
          name: formData.name,
          email: formData.email,
          phone: `${formData.phoneDDI} ${formData.phoneDDD}${formData.phoneNumber}`,
          screening: formData.screening,
          slot: selectedSlot!
        });
        if (res.success) {
          setStep("success");
        } else {
          setError(res.message || "Erro ao confirmar agendamento.");
        }
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

  // --- GOVERNANCE DATES ---
  const { minMaxDates } = useMemo(() => {
    const now = startOfDay(new Date());
    return {
      minMaxDates: {
        min: addDays(now, CALENDAR_CONFIG.PUBLIC_BOOKING_SETTINGS.minDaysInFuture),
        max: addDays(now, CALENDAR_CONFIG.PUBLIC_BOOKING_SETTINGS.maxDaysInFuture)
      }
    };
  }, []);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    // Selecionamos o primeiro dia válido se hoje for bloqueado pela regra de 3 dias
    const minDate = minMaxDates.min;
    if (isBefore(today, minDate)) {
      setSelectedDate(minDate);
    } else {
      setSelectedDate(today);
    }
  };

  const proposalSlots = useMemo(() => {
    // Gerar slots de 30 minutos entre 06:00 e 21:00
    const result = [];
    for (let h = 6; h <= 21; h++) {
      result.push(`${h.toString().padStart(2, '0')}:00`);
      if (h < 21) result.push(`${h.toString().padStart(2, '0')}:30`);
    }
    return result;
  }, []);

  const toggleProposalOption = (time: string) => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const exists = proposalOptions.find(o => o.date === dateStr && o.time === time);
    if (exists) {
      setProposalOptions(proposalOptions.filter(o => !(o.date === dateStr && o.time === time)));
    } else {
      if (proposalOptions.length >= 3) return;
      setProposalOptions([...proposalOptions, { date: dateStr, time }]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-4 px-4">
      {/* 48px Header */}
      <div className="text-center space-y-1.5 mb-4 animate-in fade-in slide-in-from-top-4 duration-1000">
        <h1 className="text-[30px] font-black tracking-tighter text-white leading-[1.1]">
          Reserve seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)]">Momento BPlen</span>
        </h1>
        <p className="text-white/60 text-sm font-medium max-w-xl mx-auto leading-relaxed">
          Que tal descomplicarmos o desenvolvimento humano no trabalho juntos? <br />
          Escolha um slot abaixo e receba a confirmação em seu e-mail.
        </p>
      </div>

      <div className="w-full max-w-4xl mx-auto p-4 sm:p-5 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] shadow-2xl relative overflow-hidden theme-dark group transition-all duration-700 min-h-[600px] flex flex-col justify-center">

        {/* 🔮 Glow Decoration */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--accent-start)]/20 rounded-full blur-3xl group-hover:bg-[var(--accent-start)]/30 transition-all duration-700" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[var(--accent-end)]/20 rounded-full blur-3xl opacity-50" />

        <AnimatePresence mode="wait">

          {step === "lead" && (
            <motion.div key="lead" {...containerVariants} className="space-y-6 relative z-10 max-w-xl mx-auto w-full">
              <div className="space-y-2">
                <h3 className="text-2xl font-black bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
                  Agende sua Reunião
                </h3>
                <p className="text-[var(--accent-start)] text-[10px] font-black uppercase tracking-[0.2em]">
                  PRIMEIRO UMA BOA CONVERSA, E DEPOIS MÃOS A OBRA!
                </p>
              </div>

              <div className="space-y-4">
                <InputGlass
                  label="Nome Completo"
                  placeholder="Como devemos te chamar?"
                  value={formData.name}
                  className="!bg-white/10 !border-white/10 !text-white text-sm"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />

                <div className="space-y-1.5 text-left relative">
                  <InputGlass
                    label="Seu melhor e-mail"
                    placeholder="seu@email.com"
                    type="email"
                    value={formData.email}
                    className="!bg-white/10 !border-white/10 !text-white text-sm"
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, email: val });

                      // 1. Validação de Formato (Geral)
                      const isInvalid = val.length > 3 && !isValidEmail(val);

                      // 2. Scanner de erros de digitação (Domínios Populares)
                      const domains = [
                        'gmail.com', 'hotmail.com', 'hotmail.com.br', 'outlook.com', 'outlook.com.br', 
                        'yahoo.com', 'yahoo.com.br', 'icloud.com', 'bplen.com',
                        'bol.com.br', 'uol.com.br', 'terra.com.br', 'me.com', 'protonmail.com', 'zoho.com',
                        'aol.com', 'live.com', 'msn.com', 'globo.com', 'ig.com.br'
                      ];
                      const [, domain] = val.split('@');

                      if (isInvalid) {
                        setEmailError("Por favor, insira um e-mail válido");
                      } else if (domain && domain.length > 2) {
                        const suggestion = domains.find(d => d.startsWith(domain) && d !== domain);
                        if (suggestion) {
                          setEmailError(`Ops! Você quis dizer @${suggestion}?`);
                        } else {
                          setEmailError(null);
                        }
                      } else {
                        setEmailError(null);
                      }
                    }}
                  />
                  {emailError && (
                    <p className="absolute -bottom-5 left-1 text-[9px] font-bold text-[var(--accent-start)] flex items-center gap-1 animate-pulse">
                      <AlertCircle className="w-3 h-3" />
                      {emailError}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 text-left relative">
                  <label className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] ml-1">WhatsApp / Telefone</label>

                  <div className="flex gap-2">
                    {/* Seletor de País (DDI) */}
                    <select
                      className="w-28 bg-white/10 border border-white/10 rounded-2xl text-[11px] text-white p-3 focus:outline-none focus:ring-1 focus:ring-[var(--accent-start)] appearance-none cursor-pointer"
                      value={formData.phoneDDI}
                      onChange={(e) => setFormData({ ...formData, phoneDDI: e.target.value, phoneDDD: "" })}
                    >
                      <option value="+55" className="bg-[#1D1D1F]">🇧🇷 +55</option>
                      <option value="+1" className="bg-[#1D1D1F]">🇺🇸 +1</option>
                      <option value="+351" className="bg-[#1D1D1F]">🇵🇹 +351</option>
                      <option value="+34" className="bg-[#1D1D1F]">🇪🇸 +34</option>
                      <option value="+44" className="bg-[#1D1D1F]">🇬🇧 +44</option>
                      <option value="+33" className="bg-[#1D1D1F]">🇫🇷 +33</option>
                      <option value="+49" className="bg-[#1D1D1F]">🇩🇪 +49</option>
                      <option value="+244" className="bg-[#1D1D1F]">🇦🇴 +244</option>
                      <option value="+54" className="bg-[#1D1D1F]">🇦🇷 +54</option>
                    </select>

                    {/* DDD Condicional */}
                    {formData.phoneDDI === "+55" ? (
                      <select
                        className="w-24 bg-white/10 border border-white/10 rounded-2xl text-[11px] text-white p-3 focus:outline-none focus:ring-1 focus:ring-[var(--accent-start)] appearance-none"
                        value={formData.phoneDDD}
                        onChange={(e) => setFormData({ ...formData, phoneDDD: e.target.value })}
                      >
                        <option value="" disabled className="bg-[#1D1D1F]">DDD</option>
                        {[11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38, 41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69, 71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99].map(ddd => (
                          <option key={ddd} value={ddd} className="bg-[#1D1D1F]">{ddd}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        placeholder="Cód."
                        maxLength={4}
                        value={formData.phoneDDD}
                        className="w-20 bg-white/10 border border-white/10 rounded-2xl text-[11px] text-white p-3 text-center focus:outline-none focus:ring-1 focus:ring-[var(--accent-start)]"
                        onChange={(e) => setFormData({ ...formData, phoneDDD: e.target.value.replace(/\D/g, "") })}
                      />
                    )}

                    {/* Número Blindado */}
                    <input
                      placeholder="Número"
                      className="flex-1 bg-white/10 border border-white/10 rounded-2xl text-[11px] text-white p-3 focus:outline-none focus:ring-1 focus:ring-[var(--accent-start)]"
                      value={formData.phoneNumber}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/[^0-9]/.test(val)) {
                          setShowPhoneWarning(true);
                        } else {
                          setShowPhoneWarning(false);
                        }
                        setFormData({ ...formData, phoneNumber: val.replace(/\D/g, "") });
                      }}
                    />
                  </div>
                  {showPhoneWarning && (
                    <p className="absolute -bottom-5 right-1 text-[9px] font-bold text-[var(--accent-start)] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      O campo aceita somente números
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button onClick={() => setStep("calendar")} className="text-[10px] font-black text-white/20 hover:text-white uppercase tracking-widest transition-all">
                  Voltar ao Calendário
                </button>
                <NavButton
                  onClick={() => setStep("triagem")}
                  disabled={!formData.name || !isValidEmail(formData.email) || !formData.phoneNumber || (formData.phoneDDI === "+55" && !formData.phoneDDD)}
                />
              </div>
            </motion.div>
          )}

          {step === "triagem" && (
            <motion.div key="triagem" {...containerVariants} className="space-y-6 relative z-10 text-left max-w-xl mx-auto w-full">
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
                    className="w-full bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--accent-start)] transition-all min-h-[120px]"
                    placeholder="Conte um pouco sobre o que você busca..."
                    value={formData.screening.objetivo}
                    onChange={(e) => setFormData({ ...formData, screening: { ...formData.screening, objetivo: e.target.value } })}
                  />
                </div>

                <InputGlass
                  label="Sua Profissão / Cargo"
                  placeholder="Ex: Diretor de RH, Consultor..."
                  value={formData.screening.cargo}
                  className="!bg-white/10 !border-white/10 !text-white"
                  onChange={(e) => setFormData({ ...formData, screening: { ...formData.screening, cargo: e.target.value } })}
                />

                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] ml-1">Como conheceu a BPlen?</label>
                  <select
                    value={formData.screening.conheceu_como}
                    onChange={(e) => setFormData({ ...formData, screening: { ...formData.screening, conheceu_como: e.target.value } })}
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
                <button
                  onClick={handleBooking}
                  disabled={!formData.screening.objetivo || isSubmitting}
                  className="h-12 px-8 bg-[var(--accent-start)] text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
                  {isSubmitting ? "PROCESSANDO..." : "FINALIZAR AGENDAMENTO"}
                </button>
              </div>
            </motion.div>
          )}

          {step === "calendar" && (
            <motion.div key="calendar" {...containerVariants} className="space-y-6 relative z-10 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-white">
                    {isProposalMode ? "Propor Novos Horários" : "Escolha um Horário"}
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  {/* Removido: AGENDA VIRTUAL 📺 */}
                </div>
              </div>

              {isProposalMode && (
                <div className="p-4 bg-[var(--accent-start)]/10 border border-[var(--accent-start)]/20 rounded-2xl">
                  <p className="text-xs text-white/80 leading-relaxed font-medium">
                    <Sparkles className="w-4 h-4 inline-block mr-2 text-[var(--accent-start)]" />
                    <b>Não encontrou uma boa agenda?</b> Sugira até 3 opções de datas e horários e entraremos em contato para confirmar!
                  </p>
                </div>
              )}

              <div className="flex flex-col lg:grid lg:grid-cols-[1fr_320px] gap-8">

                {/* --- MINI CALENDAR GRID --- */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-white uppercase tracking-widest">
                      {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                    </h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={goToToday}
                        className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[9px] font-black text-white uppercase tracking-widest transition-all"
                      >
                        Hoje
                      </button>
                      <div className="flex items-center gap-0.5">
                        <button onClick={prevMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-white/60 hover:text-white">
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={nextMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-white/60 hover:text-white">
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-8 gap-1">
                    <div className="text-center py-2"><span className="text-[9px] font-black text-[var(--accent-end)] uppercase tracking-tighter opacity-70">SI</span></div>
                    {["S", "T", "Q", "Q", "S", "S", "D"].map((d, i) => (
                      <div key={i} className="text-center py-2"><span className="text-[9px] font-black text-white/30 uppercase">{d}</span></div>
                    ))}

                    {calendarCells.map((day, idx) => {
                      const isSelected = isSameDay(day, selectedDate);
                      const isCurrentMonth = isSameMonth(day, currentMonth);
                      const dayISO = format(day, "yyyy-MM-dd");
                      const isAvailable = availableDays.includes(dayISO);
                      const weekNumber = getISOWeek(day);

                      return (
                        <React.Fragment key={day.toString()}>
                          {(idx % 7 === 0) && (
                            <div className="flex items-center justify-center py-2 opacity-70">
                              <span className="text-[10px] font-black text-[var(--accent-start)]">{weekNumber.toString().padStart(2, '0')}</span>
                            </div>
                          )}
                          <button
                            onClick={() => {
                              const dayStart = startOfDay(day);
                              const isOutsideRange = isBefore(dayStart, minMaxDates.min) || isBefore(minMaxDates.max, dayStart);

                              if (isProposalMode) {
                                // Em modo proposta, apenas dias úteis E dentro do range 3-33
                                if (!isSaturday(day) && !isSunday(day) && !isOutsideRange) {
                                  setSelectedDate(day);
                                }
                              } else {
                                if (isAvailable && !isOutsideRange) {
                                  setSelectedDate(day);
                                }
                              }
                            }}
                            disabled={(() => {
                              const dayStart = startOfDay(day);
                              const isOutsideRange = isBefore(dayStart, minMaxDates.min) || isBefore(minMaxDates.max, dayStart);

                              if (isProposalMode) {
                                return isSaturday(day) || isSunday(day) || isOutsideRange;
                              }
                              return !isAvailable && !isSelected;
                            })()}
                            className={`relative flex flex-col items-center justify-center py-2 rounded-xl transition-all duration-300 border
                                       ${isSelected
                                ? "bg-[var(--accent-start)] border-[var(--accent-start)] text-white shadow-xl shadow-[var(--accent-start)]/30 scale-105 z-10"
                                : isToday(day)
                                  ? "bg-[var(--accent-start)]/10 border-white/5 text-[var(--accent-start)] font-bold"
                                  : isProposalMode
                                    ? (() => {
                                      const dayStart = startOfDay(day);
                                      const isOutsideRange = isBefore(dayStart, minMaxDates.min) || isBefore(minMaxDates.max, dayStart);
                                      return (!isSaturday(day) && !isSunday(day) && !isOutsideRange)
                                        ? isCurrentMonth ? "text-white bg-white/5 border-white/10 hover:border-white/20" : "text-white/20 border-transparent"
                                        : "opacity-10 cursor-not-allowed cursor-default";
                                    })()
                                    : isAvailable
                                      ? isCurrentMonth ? "text-white bg-white/5 border-white/10 hover:border-white/20" : "text-white/20 border-transparent"
                                      : "text-white/10 border-transparent cursor-default"
                              }`}
                          >
                            <span className="text-xs font-bold">{format(day, "d")}</span>
                          </button>
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* 📊 Preview das Opções Selecionadas (Modo Proposta) */}
                  {isProposalMode && proposalOptions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pt-6 space-y-3 border-t border-white/5"
                    >
                      <h5 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] px-1">Seu roteiro sugerido:</h5>
                      <div className="grid grid-cols-1 gap-1.5">
                        {proposalOptions.map((opt, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-2xl group/item hover:border-[var(--accent-start)]/30 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-1 h-1 rounded-full bg-[var(--accent-start)] shadow-[0_0_8px_var(--accent-start)]" />
                              <span className="text-[11px] font-bold text-white tracking-tight uppercase">
                                {format(parseISO(opt.date), "dd 'de' MMM", { locale: ptBR })} — <span className="text-[var(--accent-start)]">{opt.time}</span>
                              </span>
                            </div>
                            <button
                              onClick={() => setProposalOptions(proposalOptions.filter((_, i) => i !== idx))}
                              className="p-1.5 hover:bg-red-500/10 rounded-xl transition-all opacity-40 group-hover/item:opacity-100 hover:text-red-500"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* --- SLOTS LIST --- */}
                <div className="flex flex-col h-full space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-[9px] font-black text-[var(--accent-start)] uppercase tracking-[0.2em]">PROGRAMAÇÃO DISPONÍVEL</h4>
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
                    ) : (isProposalMode ? proposalSlots : slots).length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-20">
                        <CalendarIcon className="w-6 h-6 text-white/10 mb-4" />
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Nenhum horário livre.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {isProposalMode ? (
                          proposalSlots.map((time) => {
                            const dateStr = format(selectedDate, "yyyy-MM-dd");
                            const isSelectedOption = proposalOptions.some(o => o.date === dateStr && o.time === time);
                            return (
                              <button
                                key={time}
                                onClick={() => toggleProposalOption(time)}
                                className={`py-2.5 rounded-xl text-xs font-black transition-all border
                                           ${isSelectedOption
                                    ? "bg-[var(--accent-start)] border-[var(--accent-start)] text-white shadow-lg"
                                    : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20"}`}
                              >
                                {time}
                              </button>
                            );
                          })
                        ) : (
                          slots.map((s) => (
                            <button
                              key={s.id}
                              disabled={!s.available}
                              onClick={() => setSelectedSlot(s.id)}
                              className={`py-3 rounded-xl text-xs font-black transition-all border
                                         ${!s.available ? "opacity-10 cursor-not-allowed grayscale" : "cursor-pointer"}
                                         ${selectedSlot === s.id
                                  ? "bg-[var(--accent-start)] border-[var(--accent-start)] text-white shadow-[0_10px_20px_rgba(var(--accent-start-rgb),0.3)] scale-[1.02]"
                                  : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20"}`}
                            >
                              <div className="flex items-center justify-center gap-2">
                                <Clock className="w-3 h-3 opacity-30" />
                                {format(parseISO(s.start), "HH:mm")}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {!isProposalMode && (
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-center">
                      <p className="text-[10px] text-white/40 font-medium mb-2">Não encontrou uma boa agenda?</p>
                      <button
                        onClick={() => {
                          setIsProposalMode(true);
                          setSelectedSlot(null);
                        }}
                        className="text-[10px] font-black text-[var(--accent-start)] uppercase tracking-widest hover:underline"
                      >
                        Faça uma proposta de agenda
                      </button>
                    </div>
                  )}

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-[10px] font-black">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="pt-2 flex flex-col gap-3">
                    {isProposalMode && (
                      <div className="flex items-center justify-between px-2">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                          {proposalOptions.length}/3 OPÇÕES SELECIONADAS
                        </p>
                        <button
                          onClick={() => {
                            setIsProposalMode(false);
                            setProposalOptions([]);
                          }}
                          className="text-[9px] font-black text-white/20 hover:text-white uppercase tracking-widest"
                        >
                          Voltar ao Padrão
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => setStep("lead")}
                      disabled={!isProposalMode ? !selectedSlot : proposalOptions.length === 0}
                      className="w-full h-14 bg-white text-black rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      CONTINUAR PARA DADOS
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div key="success" {...containerVariants} className="text-center py-6 space-y-4 relative z-10">
              <div className="w-16 h-16 bg-[var(--accent-start)]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--accent-start)]/20 shadow-[0_0_40px_var(--accent-start)]/20">
                <CheckCircle2 className="w-8 h-8 text-[var(--accent-start)] stroke-[1.5]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-white tracking-tighter inline-flex items-center">
                  {isProposalMode ? "Proposta Enviada!" : "Que alegria!"} <Sparkles className="w-6 h-6 text-[var(--accent-start)] ml-3 animate-pulse" />
                </h3>
                <p className="text-white/60 text-sm font-medium leading-relaxed">
                  {isProposalMode
                    ? "Recebemos sua sugestão de horários. Nossa equipe analisará e entrará em contato em breve para confirmar."
                    : "Tudo pronto para nossa conversa. Enviamos os detalhes do acesso para seu e-mail."}
                  <br />
                  <span className="text-[var(--accent-start)] font-black">{formData.email}</span>
                </p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl max-w-[320px] mx-auto space-y-1 text-left">
                <p className="text-[10px] font-black text-[var(--accent-start)] uppercase tracking-[0.2em]">
                  {isProposalMode ? "📍 Próximos Passos" : "📍 Confirmação Imediata"}
                </p>
                <p className="text-[11px] text-white/60 leading-relaxed">
                  {isProposalMode
                    ? "Fique atento ao seu e-mail e WhatsApp. Confirmaremos uma das opções sugeridas ou proporemos um ajuste rápido."
                    : "Verifique sua caixa de entrada e spam. O link do Google Meet e o convite de calendário já estão a caminho."}
                </p>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => window.location.href = "/"}
                  className="px-8 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-white transition-all hover:border-[var(--accent-start)]/40"
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
