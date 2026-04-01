"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  format, 
  addDays, 
  startOfDay, 
  isSameDay, 
  parseISO, 
  isToday, 
  isValid
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  ChevronLeft,
  CheckCircle2,
  Loader2,
  AlertCircle
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
  
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), 1));
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🧪 Cálculo de datas disponíveis para o seletor (próximos 15 dias)
  const availableDates = useMemo(() => {
    const dates = [];
    for (let i = 1; i <= CALENDAR_CONFIG.PUBLIC_BOOKING_SETTINGS.maxDaysInFuture; i++) {
      dates.push(addDays(new Date(), i));
    }
    return dates;
  }, []);

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

  return (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-8 bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative overflow-hidden group">
      
      {/* 🔮 Glow Decoration */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#667eea]/10 rounded-full blur-3xl group-hover:bg-[#667eea]/15 transition-all duration-700" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#764ba2]/10 rounded-full blur-3xl" />

      <AnimatePresence mode="wait">
        
        {step === "lead" && (
          <motion.div key="lead" {...containerVariants} className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
                Agende sua Reunião
              </h3>
              <p className="text-[#1D1D1F]/50 text-xs font-medium uppercase tracking-[0.15em]">
                Primeiro, precisamos te conhecer 🛡️
              </p>
            </div>

            <div className="space-y-4">
              <InputGlass 
                label="Nome Completo" 
                placeholder="Como devemos te chamar?" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <InputGlass 
                label="E-mail Corporativo" 
                placeholder="seu@email.com" 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <InputGlass 
                label="WhatsApp / Telefone" 
                placeholder="(00) 00000-0000" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
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
          <motion.div key="triagem" {...containerVariants} className="space-y-6">
             <div className="flex items-center gap-2">
              <button onClick={() => setStep("lead")} className="p-2 hover:bg-black/5 rounded-full transition-all">
                <ChevronLeft className="w-4 h-4 text-[#1D1D1F]/40" />
              </button>
              <h3 className="text-xl font-bold text-[#1D1D1F]">Triagem BPlen</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">
                  Qual o objetivo da reunião?
                </label>
                <textarea 
                  className="w-full bg-white/20 border border-gray-200/20 backdrop-blur-md rounded-2xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#667eea] transition-all min-h-[100px]"
                  placeholder="Conte um pouco sobre o que você busca..."
                  value={formData.screening.objetivo}
                  onChange={(e) => setFormData({...formData, screening: {...formData.screening, objetivo: e.target.value}})}
                />
              </div>
              
              <InputGlass 
                label="Sua Profissão / Cargo" 
                placeholder="Ex: Diretor de RH, Consultor..." 
                value={formData.screening.cargo}
                onChange={(e) => setFormData({...formData, screening: {...formData.screening, cargo: e.target.value}})}
              />

              <InputGlass 
                label="Como conheceu a BPlen?" 
                placeholder="Indicação, Instagram, LinkedIn..." 
                value={formData.screening.conheceu_como}
                onChange={(e) => setFormData({...formData, screening: {...formData.screening, conheceu_como: e.target.value}})}
              />
            </div>

            <div className="flex justify-between items-center pt-4">
              <p className="text-[9px] text-[#1D1D1F]/30 uppercase font-black tracking-widest italic">
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
          <motion.div key="calendar" {...containerVariants} className="space-y-6">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep("triagem")} className="p-2 hover:bg-black/5 rounded-full transition-all">
                <ChevronLeft className="w-4 h-4 text-[#1D1D1F]/40" />
              </button>
              <h3 className="text-xl font-bold text-[#1D1D1F]">Escolha um Horário</h3>
            </div>

            {/* 🗓️ Horizontal Scroll Dates */}
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2 mask-linear-r">
              {availableDates.map((date) => (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center justify-center min-w-[70px] h-[90px] rounded-3xl transition-all duration-300 border-2
                             ${isSameDay(date, selectedDate) 
                               ? "bg-gradient-to-br from-[#667eea] to-[#764ba2] border-[#667eea] text-white shadow-lg" 
                               : "bg-white/40 border-white/60 text-[#1D1D1F]/60 hover:bg-white/60"}`}
                >
                  <span className="text-[10px] font-black uppercase tracking-tighter mb-1 opacity-60">
                    {format(date, "EEE", { locale: ptBR })}
                  </span>
                  <span className="text-xl font-black">
                    {format(date, "dd")}
                  </span>
                </button>
              ))}
            </div>

            {/* ⏱️ Slots Grid */}
            <div className="min-h-[200px] relative">
              {isLoadingSlots ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#667eea]" />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((s) => (
                    <button
                      key={s.start}
                      disabled={!s.available}
                      onClick={() => setSelectedSlot(s.start)}
                      className={`py-3 rounded-2xl text-sm font-bold transition-all border-2
                                 ${!s.available ? "opacity-10 cursor-not-allowed border-transparent bg-black/5" : ""}
                                 ${selectedSlot === s.start 
                                   ? "bg-[#667eea] text-white border-[#667eea] scale-105 shadow-md" 
                                   : "bg-white/60 border-white/80 text-[#1D1D1F] hover:border-[#667eea]/40 hover:bg-white"}`}
                    >
                      {format(parseISO(s.start), "HH:mm")}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold leading-tight">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="pt-4">
              <button
                onClick={handleBooking}
                disabled={!selectedSlot || isSubmitting}
                className="w-full h-14 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {isSubmitting ? "Agendando..." : "Finalizar Agendamento"}
              </button>
            </div>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div key="success" {...containerVariants} className="text-center py-12 space-y-6">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-[#1D1D1F]">Tudo certo!</h3>
              <p className="text-[#1D1D1F]/60 text-sm font-medium">
                Enviamos a confirmação para <br/> 
                <span className="text-[#667eea] font-bold">{formData.email}</span>
              </p>
            </div>
            <p className="text-xs text-[#1D1D1F]/40 leading-relaxed max-w-xs mx-auto">
              Obrigado por escolher a BPlen. <br/> 
              Em instantes você receberá o convite oficial no seu calendário.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-8 py-3 bg-black/5 hover:bg-black/10 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Voltar ao Início
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
