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
  Loader2,
  Send,
  MessageCircle
} from "lucide-react";
import { getUserBookingsAction, submitEvaluationAction, cancelBookingAction } from "@/actions/calendar";
import { useAuthContext } from "@/context/AuthContext";
import { UserBooking } from "@/types/calendar";

export default function UserBookings({ refreshCounter = 0, onRefresh = () => {} }: { refreshCounter?: number; onRefresh?: () => void }) {
  const { matricula, user } = useAuthContext();
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!matricula) return;
    setIsLoading(true);
    try {
      const data = await getUserBookingsAction(matricula);
      setBookings(data || []);
    } catch (err: unknown) {
      console.error("Erro ao carregar agendamentos:", err);
    } finally {
      setIsLoading(false);
    }
  }, [matricula]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings, refreshCounter]);

  const handleEvaluate = async (bookingId: string, rating: number, feedback: string) => {
    if (!matricula || !user?.uid) return;
    setIsEvaluating(bookingId);
    try {
      const res = await submitEvaluationAction(matricula, bookingId, rating, feedback, user.uid);
      if (res.success) {
        alert("Avaliação enviada com sucesso!");
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, rating, feedback, evaluatedAt: new Date().toISOString() } : b));
      } else {
        alert("Falha ao enviar avaliação.");
      }
    } catch (err: unknown) {
      console.error("Erro ao avaliar:", err);
    } finally {
      setIsEvaluating(null);
    }
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
      <div className="w-full p-12 bg-[var(--input-bg)]/30 backdrop-blur-md rounded-3xl border border-[var(--input-border)] flex flex-col items-center justify-center text-center">
        <div className="p-4 bg-[var(--accent-soft)] rounded-full mb-4">
          <CalendarIcon className="w-6 h-6 text-[var(--text-muted)] opacity-20" />
        </div>
        <p className="text-[10px] font-black text-[var(--text-muted)] opacity-50 uppercase tracking-[0.2em]">Você ainda não possui agendamentos</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 animate-in fade-in duration-700">
      <div className="flex items-center gap-3 mb-2 px-2">
         <h4 className="text-[10px] font-black text-[var(--accent-start)] uppercase tracking-[0.2em]">Meus Agendamentos</h4>
         <div className="h-[1px] flex-1 bg-gradient-to-r from-[var(--text-muted)] opacity-10 to-transparent" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bookings.map((booking) => (
          <BookingCard 
            key={booking.id} 
            booking={booking} 
            onEvaluate={handleEvaluate}
            isSubmitting={isEvaluating === booking.id}
            onRefresh={fetchBookings}
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
  const { user, matricula } = useAuthContext();
  const [rating, setRating] = useState(booking.rating || 0);
  const [feedback, setFeedback] = useState(booking.feedback || "");
  const [isHovering, setIsHovering] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const event = booking.eventDetail;
  if (!event) return null;

  const eventDate = parseISO(event.start);
  const isPast = isBefore(eventDate, new Date());
  
  // Lógica de Pós-Evento (Novos Campos 🧬)
  const isConcluido = booking.eventLifecycleStatus === "completed";
  const isPresente = booking.attendanceStatus === "present";
  const isAusente = booking.attendanceStatus === "absent";

  const statusLabel = booking.eventLifecycleStatus 
    ? (booking.eventLifecycleStatus === 'completed' ? 'Concluída' : booking.eventLifecycleStatus === 'cancelled' ? 'Cancelada' : booking.eventLifecycleStatus === 'postponed' ? 'Adiada' : 'Agendada')
    : (isPast ? "Realizada" : "Agendada");

  const statusColor = isPast 
    ? "bg-[var(--accent-soft)] text-[var(--text-muted)] opacity-80" 
    : "bg-green-500/10 text-green-600";

  return (
    <div className="bg-[var(--glass-bg)] backdrop-blur-lg border border-[var(--border-primary)] rounded-[32px] p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.02)] hover:shadow-xl transition-all duration-500 overflow-hidden group">
      <div className="flex flex-col gap-5">
        
        {/* Top Section: Date & Status */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[var(--accent-start)] to-[var(--accent-end)] flex flex-col items-center justify-center text-white shadow-lg shadow-[var(--accent-start)]/20">
                <span className="text-[8px] font-black uppercase leading-none">{format(eventDate, "MMM", { locale: ptBR })}</span>
                <span className="text-sm font-black leading-none">{format(eventDate, "dd")}</span>
             </div>
             <div>
                <p className="text-[10px] font-black text-[var(--text-primary)] uppercase leading-none mb-1">{format(eventDate, "eeee", { locale: ptBR })}</p>
                <div className="flex items-center gap-1.5 opacity-40">
                   <Clock className="w-2.5 h-2.5 text-[var(--text-muted)]" />
                   <p className="text-[9px] font-bold text-[var(--text-muted)]">{format(eventDate, "HH:mm")}h</p>
                </div>
             </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${statusColor}`}>
               {statusLabel}
            </div>
            {isPast && (
              <span className={`text-[8px] font-black uppercase tracking-widest ${isPresente ? "text-green-500" : isAusente ? "text-red-500" : "text-amber-500"}`}>
                {isPresente ? "✓ Presente" : isAusente ? "✕ Ausente" : "• Presença Pendente"}
              </span>
            )}
          </div>
        </div>

        {/* Content Section: Title & Mentor */}
        <div className="text-left py-1">
          <h5 className="text-sm font-black text-[var(--text-primary)] leading-tight group-hover:text-[var(--accent-start)] transition-colors line-clamp-1">{event.summary}</h5>
          <div className="flex items-center gap-2 mt-1.5 opacity-40">
             <User className="w-3 h-3 text-[var(--text-primary)]" />
             <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight">Orientador: {event.mentor || "BPlen"}</p>
          </div>
        </div>

        {/* POST-EVENT DELIVERABLES (ATA, COMENTÁRIOS, FEEDBACK) */}
        {isPast && isPresente && (
           <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
              <hr className="border-[var(--border-primary)]" />
              
              {/* Public Comment */}
              {booking.publicGeneralComment && (
                 <div className="p-4 bg-[var(--accent-soft)] rounded-2xl border border-[var(--accent-start)]/10">
                    <p className="text-[9px] font-black text-[var(--accent-start)] uppercase tracking-widest mb-2 flex items-center gap-2">
                       <MessageCircle size={10} /> Notas da Mentoria
                    </p>
                    <p className="text-[10px] text-[var(--text-primary)] font-medium leading-relaxed italic">
                      &quot;{booking.publicGeneralComment}&quot;
                    </p>
                 </div>
              )}

              {/* Individual Feedback & Tasks */}
              {(booking.participantFeedback || booking.participantTasks) && (
                 <div className="grid grid-cols-1 gap-3">
                    {booking.participantFeedback && (
                       <div className="space-y-1">
                          <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Feedback de Performance</p>
                          <div className="p-4 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)] text-[10px] text-[var(--text-primary)] font-bold">
                             {booking.participantFeedback}
                          </div>
                       </div>
                    )}
                    {booking.participantTasks && (
                       <div className="space-y-1">
                          <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Próximos Passos / Tarefas</p>
                          <div className="p-4 bg-[var(--accent-start)]/5 rounded-2xl border border-[var(--accent-start)]/10 text-[10px] text-[var(--accent-start)] font-bold whitespace-pre-line">
                             {booking.participantTasks}
                          </div>
                       </div>
                    )}
                 </div>
              )}

              {/* Documents Grid */}
              <div className="grid grid-cols-2 gap-2">
                 {booking.meetingMinutesFile && (
                    <button 
                      onClick={async () => {
                        if (!user) return;
                        const token = await user.getIdToken();
                        window.open(`/api/docs/${booking.meetingMinutesFile?.fileId}?token=${token}`, "_blank");
                      }}
                      className="flex items-center gap-3 p-3 bg-[var(--bg-primary)] rounded-2xl border border-[var(--accent-start)]/20 hover:border-[var(--accent-start)] transition-all group/doc w-full"
                    >
                       <div className="p-2 bg-[var(--accent-start)]/10 rounded-xl text-[var(--accent-start)] group-hover/doc:bg-[var(--accent-start)] group-hover/doc:text-white transition-all">
                          <FileText size={14} />
                       </div>
                       <span className="text-[9px] font-black uppercase tracking-widest truncate">Ata da Reunião</span>
                    </button>
                 )}
                 {booking.participantDocs && booking.participantDocs.length > 0 && booking.participantDocs.map((doc, idx) => (
                    <button 
                      key={idx}
                      onClick={async () => {
                        if (!user) return;
                        const token = await user.getIdToken();
                        window.open(`/api/docs/${doc.fileId}?token=${token}`, "_blank");
                      }}
                      className="flex items-center gap-3 p-3 bg-[var(--input-bg)] rounded-2xl border border-[var(--border-primary)] hover:border-[var(--accent-start)] transition-all group/doc w-full"
                    >
                       <div className="p-2 bg-[var(--bg-primary)] rounded-xl text-[var(--text-muted)] group-hover/doc:bg-[var(--accent-start)] group-hover/doc:text-white transition-all">
                          <FileText size={14} />
                       </div>
                       <span className="text-[9px] font-black uppercase tracking-widest truncate">{doc.fileName}</span>
                    </button>
                 ))}
              </div>
           </div>
        )}

        {/* Action Buttons (Refatorado) */}
        <div className="flex gap-2 border-t border-[var(--input-border)] pt-4">
           {isPast ? (
              <div className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500/5 rounded-xl border border-green-500/10">
                 <CheckCircle2 className={`w-3 h-3 ${isPresente ? "text-green-600" : "text-[var(--text-muted)] opacity-20"}`} />
                 <span className={`text-[9px] font-black uppercase tracking-widest ${isPresente ? "text-green-700" : "text-[var(--text-muted)] opacity-40"}`}>
                    {isPresente ? "Concluída" : isAusente ? "Ausência Registrada" : "Pós-Evento Pendente"}
                 </span>
              </div>
           ) : (
              <button 
                onClick={async () => {
                  if (!user || !matricula) return;
                  if (confirm("Tem certeza que deseja cancelar este agendamento? A vaga será liberada no HUB.")) {
                    setIsDeleting(true);
                    try {
                      const res = await cancelBookingAction(
                        matricula, 
                        booking.id, 
                        event.id, 
                        user.uid
                      );
                      if (res?.success) {
                        alert("Agendamento cancelado!");
                        onRefresh();
                      } else {
                        const msg = (res as { message?: string })?.message || "Falha na transação";
                        alert("Erro ao cancelar: " + msg);
                      }
                    } catch (err: unknown) {
                      console.error("Erro ao cancelar:", err);
                    } finally {
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
           
           {!isPast && (
              <button 
                onClick={() => alert("Materiais liberados após a conclusão do evento.")}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[var(--accent-soft)] hover:opacity-80 rounded-xl transition-all"
              >
                 <FileText className="w-3 h-3 text-[var(--text-muted)] opacity-40" />
                 <span className="text-[9px] font-black text-[var(--text-muted)] opacity-60 uppercase tracking-widest">Documentos</span>
              </button>
           )}
        </div>

        {/* Evaluation Section (Stars & Text) */}
        {isPast && isPresente && (
          <div className="flex flex-col gap-3 pt-2">
             <div className="flex items-center justify-between">
                <p className="text-[9px] font-black text-[var(--text-muted)] opacity-30 uppercase tracking-widest">Avaliação da Reunião</p>
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
                  className="w-full p-4 bg-[var(--input-bg)]/20 border border-[var(--input-border)] rounded-2xl text-[10px] text-[var(--text-primary)] placeholder:opacity-20 focus:outline-none focus:ring-2 focus:ring-[var(--accent-start)]/10 transition-all resize-none h-20 font-bold"
                />
                <button 
                  onClick={() => onEvaluate(booking.id, rating, feedback)}
                  disabled={isSubmitting || (rating === booking.rating && feedback === booking.feedback)}
                  className={`absolute right-3 bottom-3 p-2 rounded-xl transition-all ${
                    isSubmitting 
                      ? "bg-[var(--accent-soft)] opacity-50" 
                      : (rating !== booking.rating || feedback !== booking.feedback)
                        ? "bg-[var(--accent-start)] text-white shadow-lg shadow-[var(--accent-start)]/20 hover:scale-105"
                        : "bg-[var(--accent-soft)] text-[var(--text-muted)] opacity-20 cursor-not-allowed"
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
        )}

      </div>
    </div>
  );
}
