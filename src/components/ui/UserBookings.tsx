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
  MessageCircle,
  ChevronRight,
  ExternalLink,
  XCircle,
  Eye
} from "lucide-react";
import { getUserBookingsAction, submitEvaluationAction, cancelBookingAction } from "@/actions/calendar";
import { useAuthContext } from "@/context/AuthContext";
import { UserBooking } from "@/types/calendar";
import GlassModal from "@/components/ui/GlassModal";

/* ═══════════════════════════════════════════════════════════════
   UserBookings — Layout de Linha Única por Evento
   Cada booking é uma row compacta. Detalhes completos no modal.
   ═══════════════════════════════════════════════════════════════ */

export default function UserBookings({ refreshCounter = 0, onRefresh = () => {} }: { refreshCounter?: number; onRefresh?: () => void }) {
  const { matricula, user } = useAuthContext();
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<UserBooking | null>(null);

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
        // Update selected booking if open
        setSelectedBooking(prev => prev?.id === bookingId ? { ...prev, rating, feedback, evaluatedAt: new Date().toISOString() } : prev);
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
    <div className="w-full flex flex-col gap-3 animate-in fade-in duration-700">
      <div className="flex items-center gap-3 mb-2 px-2">
         <h4 className="text-[10px] font-black text-[var(--accent-start)] uppercase tracking-[0.2em]">Meus Agendamentos</h4>
         <div className="h-[1px] flex-1 bg-gradient-to-r from-[var(--text-muted)] opacity-10 to-transparent" />
      </div>

      {/* Table Header */}
      <div className="hidden md:grid grid-cols-[0.8fr_2fr_1fr_0.8fr_0.8fr_0.8fr_1.2fr_0.5fr] gap-3 px-6 py-3 bg-[var(--input-bg)]/30 rounded-2xl border border-[var(--border-primary)] text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">
        <div>Data / Hora</div>
        <div>Evento</div>
        <div>Orientador</div>
        <div>Status</div>
        <div>Presença</div>
        <div className="text-center">Ata</div>
        <div className="text-center">Avaliação</div>
        <div className="text-right">Info</div>
      </div>

      {/* Rows */}
      <div className="space-y-2">
        {bookings.map((booking) => (
          <BookingRow 
            key={booking.id}
            booking={booking}
            onEvaluate={handleEvaluate}
            isSubmitting={isEvaluating === booking.id}
            onRefresh={fetchBookings}
            onOpenDetail={() => setSelectedBooking(booking)}
          />
        ))}
      </div>

      {/* Detail Modal */}
      {selectedBooking && (
        <BookingDetailModal 
          booking={selectedBooking}
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onEvaluate={handleEvaluate}
          isSubmitting={isEvaluating === selectedBooking.id}
          onRefresh={fetchBookings}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BookingRow — Uma linha compacta por evento
   ═══════════════════════════════════════════════════════════════ */

function BookingRow({ 
  booking, 
  onEvaluate, 
  isSubmitting,
  onRefresh,
  onOpenDetail
}: { 
  booking: UserBooking;
  onEvaluate: (id: string, r: number, f: string) => Promise<void>;
  isSubmitting: boolean;
  onRefresh: () => void;
  onOpenDetail: () => void;
}) {
  const { user } = useAuthContext();
  const [hoverStar, setHoverStar] = useState(0);
  const [localRating, setLocalRating] = useState(booking.rating || 0);

  const event = booking.eventDetail;
  if (!event) return null;

  const eventDate = parseISO(event.start);
  const isPast = isBefore(eventDate, new Date());
  
  const isPresente = booking.attendanceStatus === "present";
  const isAusente = booking.attendanceStatus === "absent";
  const hasMeetingMinutes = !!booking.meetingMinutesFile?.url;

  const statusLabel = booking.eventLifecycleStatus 
    ? (booking.eventLifecycleStatus === 'completed' ? 'Concluída' : booking.eventLifecycleStatus === 'cancelled' ? 'Cancelada' : booking.eventLifecycleStatus === 'postponed' ? 'Adiada' : 'Agendada')
    : (isPast ? "Realizada" : "Agendada");

  const statusColor = booking.eventLifecycleStatus === 'completed' 
    ? "bg-green-500/10 text-green-600" 
    : booking.eventLifecycleStatus === 'cancelled'
    ? "bg-red-500/10 text-red-500"
    : booking.eventLifecycleStatus === 'postponed'
    ? "bg-amber-500/10 text-amber-600"
    : isPast 
    ? "bg-[var(--accent-soft)] text-[var(--text-muted)]" 
    : "bg-blue-500/10 text-blue-500";

  const attendanceLabel = isPresente ? "Presente" : isAusente ? "Ausente" : isPast ? "Pendente" : "—";
  const attendanceColor = isPresente ? "text-green-600" : isAusente ? "text-red-500" : isPast ? "text-amber-500" : "text-[var(--text-muted)] opacity-30";

  const handleStarClick = async (star: number) => {
    setLocalRating(star);
    await onEvaluate(booking.id, star, booking.feedback || "");
  };

  return (
    <div className="group grid grid-cols-1 md:grid-cols-[0.8fr_2fr_1fr_0.8fr_0.8fr_0.8fr_1.2fr_0.5fr] gap-3 items-center px-6 py-4 bg-[var(--bg-primary)]/40 border border-[var(--border-primary)] rounded-2xl hover:border-[var(--accent-start)]/30 transition-all hover:translate-x-0.5">
      
      {/* Date / Time */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[var(--accent-start)] to-[var(--accent-end)] flex flex-col items-center justify-center text-white shadow-md shadow-[var(--accent-start)]/15 shrink-0">
          <span className="text-[7px] font-black uppercase leading-none">{format(eventDate, "MMM", { locale: ptBR })}</span>
          <span className="text-xs font-black leading-none">{format(eventDate, "dd")}</span>
        </div>
        <span className="text-[10px] font-bold text-[var(--text-muted)] opacity-60">{format(eventDate, "HH:mm")}h</span>
      </div>

      {/* Event Name + Theme */}
      <div className="min-w-0">
        <p className="text-xs font-black text-[var(--text-primary)] truncate leading-tight">{event.summary}</p>
        {event.theme && (
          <span className="text-[9px] font-medium text-[var(--accent-start)] opacity-60 truncate block mt-0.5"># {event.theme}</span>
        )}
      </div>

      {/* Mentor */}
      <div className="text-[10px] font-bold text-[var(--text-muted)] truncate">
        {event.mentor || "BPlen"}
      </div>

      {/* Event Status */}
      <div>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[7px] font-black uppercase tracking-widest ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      {/* Attendance */}
      <div>
        <span className={`text-[9px] font-black uppercase tracking-widest ${attendanceColor}`}>
          {attendanceLabel}
        </span>
      </div>

      {/* Meeting Minutes Button */}
      <div className="text-center">
        {hasMeetingMinutes ? (
          <button 
            onClick={async (e) => {
              e.stopPropagation();
              if (!user) return;
              const token = await user.getIdToken();
              window.open(`/api/docs/${booking.meetingMinutesFile?.fileId}?token=${token}`, "_blank");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent-start)]/10 hover:bg-[var(--accent-start)]/20 text-[var(--accent-start)] rounded-xl transition-all text-[8px] font-black uppercase tracking-widest"
          >
            <FileText className="w-3 h-3" />
            Ata
          </button>
        ) : (
          <span className="text-[8px] font-bold text-[var(--text-muted)] opacity-20">—</span>
        )}
      </div>

      {/* Star Rating (inline compact) */}
      <div className="flex items-center justify-center gap-0.5">
        {isPast && isPresente ? (
          [1,2,3,4,5].map(star => (
            <button 
              key={star}
              onMouseEnter={() => setHoverStar(star)}
              onMouseLeave={() => setHoverStar(0)}
              onClick={(e) => { e.stopPropagation(); handleStarClick(star); }}
              className="transition-transform active:scale-90 p-0.5"
              disabled={isSubmitting}
            >
              <Star 
                className={`w-3 h-3 transition-all duration-200 ${
                  star <= (hoverStar || localRating) 
                    ? "fill-[#FFB800] text-[#FFB800] drop-shadow-[0_0_4px_rgba(255,184,0,0.3)]" 
                    : "text-black/[0.06]"
                }`} 
              />
            </button>
          ))
        ) : (
          <span className="text-[8px] font-bold text-[var(--text-muted)] opacity-20">—</span>
        )}
      </div>

      {/* Detail Button */}
      <div className="flex justify-end">
        <button 
          onClick={onOpenDetail}
          className="p-2 rounded-xl bg-[var(--input-bg)] hover:bg-[var(--accent-start)] hover:text-white text-[var(--text-muted)] border border-[var(--border-primary)] hover:border-[var(--accent-start)] transition-all group/btn"
        >
          <Eye className="w-3.5 h-3.5 opacity-50 group-hover/btn:opacity-100" />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BookingDetailModal — Modal completo com todos os dados
   ═══════════════════════════════════════════════════════════════ */

function BookingDetailModal({
  booking,
  isOpen,
  onClose,
  onEvaluate,
  isSubmitting,
  onRefresh
}: {
  booking: UserBooking;
  isOpen: boolean;
  onClose: () => void;
  onEvaluate: (id: string, r: number, f: string) => Promise<void>;
  isSubmitting: boolean;
  onRefresh: () => void;
}) {
  const { user, matricula } = useAuthContext();
  const [rating, setRating] = useState(booking.rating || 0);
  const [feedback, setFeedback] = useState(booking.feedback || "");
  const [hoverStar, setHoverStar] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync state when booking changes
  useEffect(() => {
    setRating(booking.rating || 0);
    setFeedback(booking.feedback || "");
  }, [booking]);

  const event = booking.eventDetail;
  if (!event) return null;

  const eventDate = parseISO(event.start);
  const isPast = isBefore(eventDate, new Date());
  const isPresente = booking.attendanceStatus === "present";
  const isAusente = booking.attendanceStatus === "absent";
  const hasMeetingMinutes = !!booking.meetingMinutesFile?.url;

  const statusLabel = booking.eventLifecycleStatus 
    ? (booking.eventLifecycleStatus === 'completed' ? 'Concluída' : booking.eventLifecycleStatus === 'cancelled' ? 'Cancelada' : booking.eventLifecycleStatus === 'postponed' ? 'Adiada' : 'Agendada')
    : (isPast ? "Realizada" : "Agendada");

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={event.summary}
      subtitle={event.theme ? `# ${event.theme}` : undefined}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
        
        {/* ─── Header Info Grid ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <InfoPill 
            icon={<CalendarIcon className="w-3.5 h-3.5" />}
            label="Data"
            value={format(eventDate, "dd/MM/yyyy", { locale: ptBR })}
          />
          <InfoPill 
            icon={<Clock className="w-3.5 h-3.5" />}
            label="Horário"
            value={format(eventDate, "HH:mm") + "h"}
          />
          <InfoPill 
            icon={<User className="w-3.5 h-3.5" />}
            label="Orientador"
            value={event.mentor || "BPlen"}
          />
          <InfoPill 
            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
            label="Status"
            value={statusLabel}
            highlight
          />
        </div>

        {/* ─── Attendance Status ─── */}
        <div className={`flex items-center gap-3 p-4 rounded-2xl border ${
          isPresente ? "bg-green-500/5 border-green-500/20" : 
          isAusente ? "bg-red-500/5 border-red-500/20" : 
          "bg-amber-500/5 border-amber-500/20"
        }`}>
          <div className={`w-2.5 h-2.5 rounded-full ${isPresente ? "bg-green-500" : isAusente ? "bg-red-500" : "bg-amber-500"}`} />
          <span className={`text-[10px] font-black uppercase tracking-widest ${
            isPresente ? "text-green-600" : isAusente ? "text-red-500" : "text-amber-600"
          }`}>
            {isPresente ? "Presença Confirmada" : isAusente ? "Ausência Registrada" : isPast ? "Presença Pendente de Confirmação" : "Evento Futuro — Aguardando Realização"}
          </span>
        </div>

        {/* ─── Notas do Evento (Public Comment) ─── */}
        {booking.publicGeneralComment && (
          <div className="space-y-2">
            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 flex items-center gap-2">
              <MessageCircle size={10} className="text-[var(--accent-start)]" /> 
              Notas do Evento
            </p>
            <div className="p-5 bg-[var(--accent-soft)] rounded-2xl border border-[var(--accent-start)]/10">
              <p className="text-[11px] text-[var(--text-primary)] font-medium leading-relaxed italic">
                &quot;{booking.publicGeneralComment}&quot;
              </p>
            </div>
          </div>
        )}

        {/* ─── Feedback Individual ─── */}
        {booking.participantFeedback && (
          <div className="space-y-2">
            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">
              Feedback Individual
            </p>
            <div className="p-5 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)]">
              <p className="text-[11px] text-[var(--text-primary)] font-bold leading-relaxed">
                {booking.participantFeedback}
              </p>
            </div>
          </div>
        )}

        {/* ─── Tarefas ─── */}
        {booking.participantTasks && (
          <div className="space-y-2">
            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">
              Próximos Passos / Tarefas
            </p>
            <div className="p-5 bg-[var(--accent-start)]/5 rounded-2xl border border-[var(--accent-start)]/10">
              <p className="text-[11px] text-[var(--accent-start)] font-bold leading-relaxed whitespace-pre-line">
                {booking.participantTasks}
              </p>
            </div>
          </div>
        )}

        {/* ─── Documentos ─── */}
        {(hasMeetingMinutes || (booking.participantDocs && booking.participantDocs.length > 0)) && (
          <div className="space-y-3">
            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">
              Documentos do Evento
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {hasMeetingMinutes && (
                <button 
                  onClick={async () => {
                    if (!user) return;
                    const token = await user.getIdToken();
                    window.open(`/api/docs/${booking.meetingMinutesFile?.fileId}?token=${token}`, "_blank");
                  }}
                  className="flex items-center gap-3 p-4 bg-[var(--bg-primary)] rounded-2xl border border-[var(--accent-start)]/20 hover:border-[var(--accent-start)] transition-all group/doc"
                >
                  <div className="p-2 bg-[var(--accent-start)]/10 rounded-xl text-[var(--accent-start)] group-hover/doc:bg-[var(--accent-start)] group-hover/doc:text-white transition-all">
                    <FileText size={14} />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-black uppercase tracking-widest block">Ata da Reunião</span>
                    <span className="text-[8px] font-bold text-[var(--text-muted)] opacity-40">{booking.meetingMinutesFile?.fileName}</span>
                  </div>
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
                  className="flex items-center gap-3 p-4 bg-[var(--input-bg)] rounded-2xl border border-[var(--border-primary)] hover:border-[var(--accent-start)] transition-all group/doc"
                >
                  <div className="p-2 bg-[var(--bg-primary)] rounded-xl text-[var(--text-muted)] group-hover/doc:bg-[var(--accent-start)] group-hover/doc:text-white transition-all">
                    <FileText size={14} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest truncate">{doc.fileName}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <hr className="border-[var(--border-primary)] opacity-30" />

        {/* ─── Avaliação NPS ─── */}
        {isPast && isPresente && (
          <div className="space-y-4">
            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">
              Avaliação do Evento
            </p>

            <div className="flex items-center justify-between p-4 bg-[var(--input-bg)]/30 rounded-2xl border border-[var(--border-primary)]">
              <span className="text-[10px] font-black text-[var(--text-muted)] opacity-50">Como foi sua experiência?</span>
              <div className="flex gap-1.5">
                {[1,2,3,4,5].map(star => (
                  <button 
                    key={star}
                    onMouseEnter={() => setHoverStar(star)}
                    onMouseLeave={() => setHoverStar(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform active:scale-90"
                  >
                    <Star 
                      className={`w-5 h-5 transition-all duration-300 ${
                        star <= (hoverStar || rating) 
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
                placeholder="Compartilhe seu feedback sobre o evento... (Opcional)"
                className="w-full p-4 bg-[var(--input-bg)]/20 border border-[var(--input-border)] rounded-2xl text-[11px] text-[var(--text-primary)] placeholder:opacity-20 focus:outline-none focus:ring-2 focus:ring-[var(--accent-start)]/10 transition-all resize-none h-24 font-medium"
              />
              <button 
                onClick={() => onEvaluate(booking.id, rating, feedback)}
                disabled={isSubmitting || (rating === booking.rating && feedback === booking.feedback)}
                className={`absolute right-3 bottom-3 p-2.5 rounded-xl transition-all ${
                  isSubmitting 
                    ? "bg-[var(--accent-soft)] opacity-50" 
                    : (rating !== booking.rating || feedback !== booking.feedback)
                      ? "bg-[var(--accent-start)] text-white shadow-lg shadow-[var(--accent-start)]/20 hover:scale-105"
                      : "bg-[var(--accent-soft)] text-[var(--text-muted)] opacity-20 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>

            {booking.evaluatedAt && (
              <div className="flex items-center gap-1.5 opacity-30 mt-1 ml-1">
                <CheckCircle2 className="w-2.5 h-2.5 text-green-600" />
                <p className="text-[8px] font-black uppercase tracking-tight italic">Avaliação registrada</p>
              </div>
            )}
          </div>
        )}

        {/* ─── Cancel Action (Future Events Only) ─── */}
        {!isPast && (
          <div className="pt-2">
            <button 
              onClick={async () => {
                if (!user || !matricula) return;
                if (confirm("Tem certeza que deseja cancelar este agendamento? A vaga será liberada no HUB.")) {
                  setIsDeleting(true);
                  try {
                    const res = await cancelBookingAction(matricula, booking.id, event.id, user.uid);
                    if (res?.success) {
                      alert("Agendamento cancelado!");
                      onClose();
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
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-500/5 hover:bg-red-500/10 rounded-2xl border border-red-500/10 transition-all disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="w-3 h-3 animate-spin text-red-500" />
              ) : (
                <RefreshCcw className="w-3 h-3 text-red-500/50" />
              )}
              <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">
                {isDeleting ? "Cancelando..." : "Cancelar Agendamento"}
              </span>
            </button>
          </div>
        )}
      </div>
    </GlassModal>
  );
}

/* ═══════════════════════════════════════════════════════════════
   InfoPill — Pill compacta para dados do header do modal
   ═══════════════════════════════════════════════════════════════ */

function InfoPill({ icon, label, value, highlight = false }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-2xl border ${highlight ? "bg-[var(--accent-start)]/5 border-[var(--accent-start)]/15" : "bg-[var(--input-bg)]/30 border-[var(--border-primary)]"}`}>
      <div className={`shrink-0 ${highlight ? "text-[var(--accent-start)]" : "text-[var(--text-muted)] opacity-40"}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[7px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-50">{label}</p>
        <p className={`text-[10px] font-black truncate ${highlight ? "text-[var(--accent-start)]" : "text-[var(--text-primary)]"}`}>{value}</p>
      </div>
    </div>
  );
}
