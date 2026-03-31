"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  format, 
  parseISO, 
  isBefore 
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Star, 
  FileText, 
  RefreshCcw, 
  Calendar as CalendarIcon, 
  User, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Loader2,
  Send
} from "lucide-react";
import { getUserBookingsAction, submitEvaluationAction, cancelBookingAction } from "@/actions/calendar";
import { useAuthContext } from "@/context/AuthContext";
import { UserBooking, GoogleCalendarEvent } from "@/types/calendar";

export default function UserBookings({ refreshCounter = 0, onRefresh }: { refreshCounter?: number; onRefresh: () => void }) {
  const { user } = useAuthContext();
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadBookings = useCallback(async () => {
    if (!user?.uid) return;
    setIsLoading(true);
    try {
      const data = await getUserBookingsAction(user.uid);
      setBookings(data as UserBooking[]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings, refreshCounter]);

  const handleEvaluation = async (bookingId: string, rating: number, feedback: string) => {
    setIsSubmitting(bookingId);
    const res = await submitEvaluationAction(bookingId, rating, feedback);
    if (res.success) {
      // Atualiza localmente
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, rating, feedback } : b));
    }
    setIsSubmitting(null);
  };

  if (isLoading) {
    return (
      <div className="w-full h-40 flex items-center justify-center opacity-30">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="w-full p-12 bg-white/30 backdrop-blur-md rounded-3xl border border-white/60 flex flex-col items-center justify-center text-center">
        <div className="p-4 bg-black/5 rounded-full mb-4">
          <CalendarIcon className="w-6 h-6 text-[#1D1D1F]/10" />
        </div>
        <p className="text-[10px] font-black text-[#1D1D1F]/30 uppercase tracking-[0.2em]">Você ainda não possui agendamentos</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 animate-in fade-in duration-700">
      <div className="flex items-center gap-3 mb-2 px-2">
         <h4 className="text-[10px] font-black text-[#667eea] uppercase tracking-[0.2em]">Meus Agendamentos</h4>
         <div className="h-[1px] flex-1 bg-gradient-to-r from-black/[0.05] to-transparent" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bookings.map((booking) => (
          <BookingCard 
            key={booking.id} 
            booking={booking} 
            onEvaluate={handleEvaluation}
            isSubmitting={isSubmitting === booking.id}
            onRefresh={loadBookings}
          />
        ))}
      </div>
    </div>
  );
}

function BookingCard({ 
  booking, 
  onEvaluate, 
  isSubmitting,
  onRefresh 
}: { 
  booking: UserBooking, 
  onEvaluate: (id: string, r: number, f: string) => Promise<void>, 
  isSubmitting: boolean,
  onRefresh: () => void 
}) {
  const [rating, setRating] = useState(booking.rating || 0);
  const [feedback, setFeedback] = useState(booking.feedback || "");
  const [isHovering, setIsHovering] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const event = booking.eventDetail;
  if (!event) return null;

  const eventDate = parseISO(event.start);
  const isPast = isBefore(eventDate, new Date());
  
  // Lógica temporária de status
  const statusLabel = isPast ? "Realizada" : "Agendada";
  const statusColor = isPast ? "bg-black/5 text-[#1D1D1F]/40" : "bg-green-500/10 text-green-600";

  return (
    <div className="bg-white/60 backdrop-blur-lg border border-white/80 rounded-[32px] p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.02)] hover:shadow-xl transition-all duration-500 overflow-hidden group">
      <div className="flex flex-col gap-5">
        
        {/* Top Section: Date & Status */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#667eea] to-[#764ba2] flex flex-col items-center justify-center text-white shadow-lg shadow-[#667eea]/20">
                <span className="text-[8px] font-black uppercase leading-none">{format(eventDate, "MMM", { locale: ptBR })}</span>
                <span className="text-sm font-black leading-none">{format(eventDate, "dd")}</span>
             </div>
             <div>
                <p className="text-[10px] font-black text-[#1D1D1F] uppercase leading-none mb-1">{format(eventDate, "eeee", { locale: ptBR })}</p>
                <div className="flex items-center gap-1.5 opacity-40">
                   <Clock className="w-2.5 h-2.5" />
                   <p className="text-[9px] font-bold">{format(eventDate, "HH:mm")}h</p>
                </div>
             </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${statusColor}`}>
             {statusLabel}
          </div>
        </div>

        {/* Content Section: Title & Mentor */}
        <div className="text-left py-1">
          <h5 className="text-sm font-black text-[#1D1D1F] leading-tight group-hover:text-[#667eea] transition-colors line-clamp-1">{event.summary}</h5>
          <div className="flex items-center gap-2 mt-1.5 opacity-40">
             <User className="w-3 h-3 text-[#1D1D1F]" />
             <p className="text-[10px] font-bold uppercase tracking-tight">Orientador: {event.mentor || "BPlen"}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 border-y border-black/[0.03] py-4">
           {isPast ? (
              <div className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500/5 rounded-xl border border-green-500/10">
                 <CheckCircle2 className="w-3 h-3 text-green-600" />
                 <span className="text-[9px] font-black text-green-700 uppercase tracking-widest">Concluída</span>
              </div>
           ) : (
              <button 
                onClick={async () => {
                  if (confirm("Tem certeza que deseja cancelar este agendamento? A vaga será liberada no HUB.")) {
                    setIsDeleting(true);
                    const res = await cancelBookingAction(booking.id, event.id, booking.userId, booking.week, booking.year);
                    if (res?.success) {
                      onRefresh();
                    } else {
                      const msg = (res as { message?: string })?.message || "Falha na transação";
                      alert("Erro ao cancelar: " + msg);
                      setIsDeleting(false);
                    }
                  }
                }}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500/5 hover:bg-red-500/10 rounded-xl transition-all group/btn disabled:opacity-50"
              >
                 {isDeleting ? (
                   <Loader2 className="w-3 h-3 animate-spin text-red-500" />
                 ) : (
                   <RefreshCcw className="w-3 h-3 text-red-500/40 group-hover/btn:rotate-180 transition-all duration-500" />
                 )}
                 <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">
                   {isDeleting ? "Cancelando..." : "Cancelar Agendamento"}
                 </span>
              </button>
           )}
           
           <button 
             onClick={() => alert("Acesso aos materiais em Desenvolvimento")}
             className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-black/[0.03] hover:bg-black/[0.06] rounded-xl transition-all"
           >
              <FileText className="w-3 h-3 text-[#1D1D1F]/40" />
              <span className="text-[9px] font-black text-[#1D1D1F]/60 uppercase tracking-widest">Documentos</span>
           </button>
        </div>

        {/* Evaluation Section (Stars & Text) */}
        <div className="flex flex-col gap-3">
           <div className="flex items-center justify-between">
              <p className="text-[9px] font-black text-[#1D1D1F]/30 uppercase tracking-widest">Avaliação da Reunião</p>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(star => (
                   <button 
                     key={star} 
                     onMouseEnter={() => setIsHovering(star)}
                     onMouseLeave={() => setIsHovering(0)}
                     onClick={() => setRating(star)}
                     className="transition-transform active:scale-90"
                   >
                     <Star 
                        className={`w-3.5 h-3.5 transition-all duration-300 ${
                          star <= (isHovering || rating) 
                            ? "fill-[#FFB800] text-[#FFB800] drop-shadow-[0_0_8px_rgba(255,184,0,0.4)] scale-110" 
                            : "text-black/[0.08]"
                        }`} 
                     />
                   </button>
                ))}
              </div>
           </div>
           
           <div className="relative">
              <textarea 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Como foi sua experiência? (Opcional)"
                className="w-full p-4 bg-black/[0.02] border border-black/[0.03] rounded-2xl text-[10px] text-[#1D1D1F] placeholder:text-black/20 focus:outline-none focus:ring-2 focus:ring-[#667eea]/10 transition-all resize-none h-20 font-bold"
              />
              <button 
                onClick={() => onEvaluate(booking.id, rating, feedback)}
                disabled={isSubmitting || (rating === booking.rating && feedback === booking.feedback)}
                className={`absolute right-3 bottom-3 p-2 rounded-xl transition-all ${
                  isSubmitting 
                    ? "bg-black/5 opacity-50" 
                    : (rating !== booking.rating || feedback !== booking.feedback)
                      ? "bg-[#667eea] text-white shadow-lg shadow-[#667eea]/20 hover:scale-105"
                      : "bg-black/5 text-black/10 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              </button>
           </div>

           {booking.evaluatedAt && (
              <div className="flex items-center gap-1.5 opacity-30 mt-1">
                 <CheckCircle2 className="w-2.5 h-2.5 text-green-600" />
                 <p className="text-[8px] font-black uppercase tracking-tight italic">Avaliação enviada</p>
              </div>
           )}
        </div>

      </div>
    </div>
  );
}
