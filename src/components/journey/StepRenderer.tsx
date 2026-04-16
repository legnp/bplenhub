"use client";

import React from "react";
import { SubStepConfig } from "@/types/journey";
import { 
  Loader2, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  PlayCircle, 
  Calendar as CalendarIcon, 
  ClipboardCheck, 
  Sparkles,
  Star,
  Download,
  Send,
  Clock 
} from "lucide-react";
import { ptBR } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import Calendar from "@/components/ui/Calendar";
import UserBookings from "@/components/ui/UserBookings";
import { fetchCalendarEvents, getUserBookingsAction, submitEvaluationAction } from "@/actions/calendar";
import { UserBooking } from "@/actions/calendar";
import { SurveyEngine } from "@/components/forms/SurveyEngine";
import { getSurveyConfig } from "@/config/surveys";
import { useAuthContext } from "@/context/AuthContext";

interface StepRendererProps {
  substep: SubStepConfig;
  status: "locked" | "available" | "current" | "completed";
  onComplete: () => void;
}

/**
 * BPlen HUB — StepRenderer 🧬🛡️
 * Orchestrator that renders the appropriate content type for a journey substep.
 */
export function StepRenderer({ substep, status, onComplete }: StepRendererProps) {
  const { user, matricula } = useAuthContext();

  if (status === "locked") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-16 bg-[var(--input-bg)]/5 rounded-[3.5rem] border border-dashed border-[var(--border-primary)] opacity-40">
        <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mb-6">
           <AlertCircle size={24} className="text-[var(--text-muted)]" />
        </div>
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-[var(--text-primary)]">Conteúdo Bloqueado</h3>
        <p className="text-[10px] font-medium text-[var(--text-muted)] mt-2 text-center max-w-xs">
           Esta parte da jornada será liberada assim que você concluir os passos anteriores.
        </p>
      </div>
    );
  }

  const [events, setEvents] = React.useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = React.useState(false);
  const [userBookings, setUserBookings] = React.useState<UserBooking[]>([]);
  const [isEvaluating, setIsEvaluating] = React.useState(false);
  const [rating, setRating] = React.useState(0);
  const [feedback, setFeedback] = React.useState("");

  const loadData = React.useCallback(async () => {
    setLoadingEvents(true);
    try {
      const allEvents = await fetchCalendarEvents(new Date());
      
      if (substep.referenceId === "onboarding") {
        setEvents(allEvents.filter(ev => ev.summary.toLowerCase().includes("onboarding")));
      } else {
        setEvents(allEvents);
      }

      if (matricula) {
        const bookings = await getUserBookingsAction(matricula);
        setUserBookings(bookings);
      }
    } catch (error) {
       console.error("Erro StepRenderer loadData:", error);
    } finally {
      setLoadingEvents(false);
    }
  }, [substep.type, substep.referenceId, matricula]);

  React.useEffect(() => {
    if (substep.type === "meeting") {
      loadData();
    }
  }, [loadData, substep.type]);

  const handleNPS = async (bookingId: string) => {
    if (!rating || !matricula || !user?.uid) return;
    setIsEvaluating(true);
    try {
      const res = await submitEvaluationAction(matricula, bookingId, rating, feedback, user.uid);
      if (res.success) {
        loadData(); // Refresh UI
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsEvaluating(false);
    }
  };

  const [isSurveyActive, setIsSurveyActive] = React.useState(false);

  React.useEffect(() => {
    setIsSurveyActive(false);
  }, [substep.id]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
       if (window.location.search.includes("action=finishTour") && substep.referenceId === "welcome_video_01") {
          onComplete();
          window.history.replaceState({}, "", window.location.pathname);
       }
    }
  }, [substep.referenceId, onComplete]);

  const renderContent = () => {
    switch (substep.type) {
      case "content":
        const isGuidedTour = substep.referenceId === "welcome_video_01";

        if (isGuidedTour) {
            return (
              <div className="flex-1 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 relative">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-pink-500/10 rounded-xl flex items-center justify-center text-pink-500">
                          <Sparkles size={18} />
                       </div>
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-500/high">Tour Guiado BPlen</span>
                    </div>
                    <h2 className="text-3xl font-black tracking-tight">Boas-vindas ao HUB</h2>
                    <p className="text-[12px] font-medium text-[var(--text-muted)] max-w-xl leading-relaxed">Prepare-se para conhecer o seu novo ecossistema de desenvolvimento de carreira.</p>
                 </div>
                 
                 <div className="p-16 border border-[var(--border-primary)] rounded-[3.5rem] bg-[var(--input-bg)]/20 flex flex-col items-center justify-center text-center gap-8 shadow-inner">
                    <div 
                       className="w-20 h-20 rounded-[2rem] flex items-center justify-center text-white shadow-xl bg-pink-600 cursor-pointer hover:scale-105 active:scale-95 transition-all" 
                       onClick={() => window.location.href = "/hub/membro?startTour=true"}
                    >
                       <PlayCircle size={32} />
                    </div>
                    <div className="space-y-2">
                       <p className="text-[12px] font-black uppercase tracking-widest">Aperte o Play para iniciar o Tour</p>
                       <p className="text-[10px] font-medium text-[var(--text-muted)] max-w-xs mx-auto">
                          A BPlen preparou um guia narrado para te apresentar todos os recursos do HUB.
                       </p>
                    </div>
                 </div>
              </div>
           );
        }

        return (
          <div className="flex-1 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                      <PlayCircle size={18} />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500/high">Conteúdo Educativo</span>
                </div>
                <h2 className="text-3xl font-black tracking-tight">{substep.title}</h2>
                <p className="text-[12px] font-medium text-[var(--text-muted)] max-w-xl leading-relaxed">{substep.description}</p>
             </div>
             
             <div className="aspect-video w-full rounded-[3rem] bg-black/40 border border-white/5 flex items-center justify-center relative group overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <PlayCircle size={64} className="text-white opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 z-10" />
                <div className="absolute bottom-8 left-8 z-10 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 text-white">
                   <p className="text-[10px] font-black uppercase tracking-widest">Aperte o Play para iniciar</p>
                </div>
             </div>

             <div className="flex justify-end pt-4">
                <button 
                   onClick={onComplete}
                   className="px-10 py-4 bg-[var(--accent-start)] text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[var(--accent-start)]/20"
                >
                   Marcar como Concluído
                </button>
             </div>
          </div>
        );

      case "form":
      case "survey":
        const isSurvey = substep.type === "survey";
        const surveyConfig = getSurveyConfig(substep.referenceId);

        if (isSurveyActive && surveyConfig) {
           return (
              <div className="flex-1 animate-in zoom-in duration-500 py-4">
                 <SurveyEngine 
                    config={surveyConfig}
                    userUid={user?.uid || "guest"}
                    onComplete={() => {
                       setIsSurveyActive(false);
                       onComplete();
                    }}
                 />
              </div>
           );
        }

        return (
          <div className="flex-1 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center",
                      isSurvey ? "bg-purple-500/10 text-purple-500" : "bg-emerald-500/10 text-emerald-500"
                   )}>
                      {isSurvey ? <ClipboardCheck size={18} /> : <FileText size={18} />}
                   </div>
                   <span className={cn(
                      "text-[10px] font-black uppercase tracking-[0.3em]",
                      isSurvey ? "text-purple-500" : "text-emerald-500"
                   )}>
                      {isSurvey ? "Passaporte do Membro BPlen" : "Formulário BPlen"}
                   </span>
                </div>
                <h2 className="text-3xl font-black tracking-tight">{substep.title}</h2>
                <p className="text-[12px] font-medium text-[var(--text-muted)] max-w-xl leading-relaxed">{substep.description}</p>
             </div>
             
             <div className="p-16 border border-[var(--border-primary)] rounded-[3.5rem] bg-[var(--input-bg)]/20 flex flex-col items-center justify-center text-center gap-8 shadow-inner">
                <div className={cn(
                   "w-20 h-20 rounded-[2rem] flex items-center justify-center text-white shadow-xl",
                   isSurvey ? "bg-purple-600" : "bg-emerald-600"
                )}>
                   {isSurvey ? <ClipboardCheck size={32} /> : <FileText size={32} />}
                </div>

                {status === "completed" ? (
                   <div className="space-y-4 max-w-sm">
                      <p className="text-[12px] font-black uppercase tracking-widest text-[var(--accent-start)]">Check-in Concluído</p>
                      <p className="text-[10px] font-medium text-[var(--text-muted)]">
                         Muito obrigada por nos contar sobre você! Siga para a próxima parada para agendar a sua sessão de onboarding.
                      </p>
                   </div>
                ) : (
                   <>
                     <div className="space-y-2">
                        <p className="text-[12px] font-black uppercase tracking-widest">{isSurvey ? "Check-in disponível." : "Aguardando Preenchimento"}</p>
                        <p className="text-[10px] font-medium text-[var(--text-muted)] max-w-xs mx-auto">
                           {isSurvey ? "Nos conte mais sobre você para personalizarmos a sua jornada." : "Complete as informações necessárias para este estágio."}
                        </p>
                     </div>
                     <button 
                        onClick={() => setIsSurveyActive(true)}
                        className="px-10 py-4 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl"
                     >
                        {isSurvey ? "Fazer Check-In" : "Preencher Formulário"}
                     </button>
                   </>
                )}
             </div>
          </div>
        );

      case "meeting":
        // Identificar se há um agendamento existente para este contexto
        const activeBooking = userBookings.find(b => 
           b.eventDetail?.summary.toLowerCase().includes(substep.referenceId === "onboarding" ? "onboarding" : substep.title.toLowerCase()) &&
           b.eventLifecycleStatus !== "cancelled"
        );

        const isCompleted = activeBooking?.eventLifecycleStatus === "completed" || activeBooking?.attendanceStatus === "present";

        return (
          <div className="flex-1 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                      <CalendarIcon size={18} />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">
                      {isCompleted ? "Sessão Concluída" : activeBooking ? "Sessão Agendada" : "Agendamento de Sessão"}
                   </span>
                </div>
                <h2 className="text-3xl font-black tracking-tight">
                   {isCompleted ? "Histórico da Sessão" : activeBooking ? "Tudo certo para o encontro!" : substep.title}
                </h2>
                <p className="text-[12px] font-medium text-[var(--text-muted)] max-w-xl leading-relaxed">
                   {isCompleted 
                     ? "Sua sessão foi concluída com sucesso. Veja abaixo os documentos e avalie sua experiência."
                     : activeBooking 
                        ? `Sua ${substep.title} está confirmada. O 100% desta etapa será liberado assim que a sessão for concluída e o consultor emitir sua Ata.`
                        : (substep.referenceId === "onboarding" 
                           ? "Escolha um horário para sua sessão de Onboarding." 
                           : "Selecione o melhor horário para sua sessão com nossos especialistas.")}
                </p>
             </div>
             
             {!activeBooking ? (
                <div className="flex-1 min-h-[600px] border border-[var(--border-primary)] rounded-[3rem] bg-[var(--input-bg)]/10 overflow-hidden relative">
                   {loadingEvents ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--bg-primary)]/40 backdrop-blur-sm z-50">
                         <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                         <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-amber-500">Sincronizando Agenda...</p>
                      </div>
                   ) : (
                      <div className="p-4 sm:p-8 h-full">
                         <Calendar 
                            events={events} 
                            onBookingSuccess={() => { loadData(); onComplete(); }}
                         />
                      </div>
                   )}
                </div>
             ) : (
                <div className="space-y-6">
                   {/* CARD DE VIGÍLIA / SUCESSO */}
                   <div className="p-10 border border-[var(--border-primary)] rounded-[3.5rem] bg-[var(--input-bg)]/20 glass flex flex-col md:flex-row gap-10 items-center">
                      <div className="shrink-0 w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-amber-500 border border-amber-500/10 shadow-inner">
                         {isCompleted ? <CheckCircle2 size={48} className="text-emerald-500" /> : <Clock size={48} className="animate-pulse" />}
                      </div>

                      <div className="flex-1 text-center md:text-left space-y-4">
                         <div className="space-y-1">
                            <span className={cn(
                               "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                               isCompleted ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                            )}>
                               {isCompleted ? "Módulo Finalizado" : "Sessão Confirmada"}
                            </span>
                            <h3 className="text-2xl font-black text-[var(--text-primary)]">
                               {activeBooking.eventDetail?.summary || substep.title}
                            </h3>
                            <p className="text-[11px] font-bold text-[var(--text-muted)] opacity-60">
                               Orientador: <span className="text-[var(--text-primary)]">{activeBooking.eventDetail?.mentor || "BPlen Consultoria"}</span>
                            </p>
                         </div>

                         <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                            <div className="px-4 py-2 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-2">
                               <CalendarIcon size={14} className="text-[var(--text-muted)]" />
                               <span className="text-[11px] font-bold text-[var(--text-primary)]">
                                  {format(parseISO(activeBooking.eventDetail?.start!), "dd 'de' MMMM", { locale: ptBR })}
                               </span>
                            </div>
                            <div className="px-4 py-2 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-2">
                               <Clock size={14} className="text-[var(--text-muted)]" />
                               <span className="text-[11px] font-bold text-[var(--text-primary)]">
                                  {format(parseISO(activeBooking.eventDetail?.start!), "HH:mm")}
                               </span>
                            </div>
                         </div>

                         {activeBooking.meetingMinutesFile && (
                            <a 
                               href={activeBooking.meetingMinutesFile.url} 
                               target="_blank" 
                               rel="noopener noreferrer"
                               className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors shadow-lg"
                            >
                               <Download size={16} />
                               Baixar Ata da Sessão
                            </a>
                         )}
                      </div>
                   </div>

                   {/* NPS & AVALIAÇÃO (Apenas no Cofre / Completed) */}
                   {isCompleted && (
                      <div className="p-8 border border-[var(--border-primary)] rounded-[3rem] bg-[var(--input-bg)]/20 animate-in slide-in-from-bottom-4 delay-200">
                         <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="space-y-1 text-center md:text-left">
                               <h4 className="font-black text-[var(--text-primary)]">Avalie sua Experiência</h4>
                               <p className="text-[10px] font-medium text-[var(--text-muted)]">Como você avalia a condução deste encontro?</p>
                            </div>

                            <div className="flex gap-2">
                               {[1, 2, 3, 4, 5].map((num) => (
                                  <button
                                     key={num}
                                     disabled={!!activeBooking.evaluatedAt || isEvaluating}
                                     onClick={() => setRating(num)}
                                     className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                        (rating >= num || activeBooking.rating >= num)
                                          ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                                          : "bg-white/5 text-[var(--text-muted)] hover:bg-white/10"
                                     )}
                                  >
                                     <Star size={20} fill={(rating >= num || activeBooking.rating >= num) ? "currentColor" : "none"} />
                                  </button>
                               ))}
                            </div>
                         </div>

                         {(rating > 0 && !activeBooking.evaluatedAt) && (
                            <div className="mt-8 space-y-4 animate-in fade-in zoom-in">
                               <textarea 
                                  value={feedback}
                                  onChange={(e) => setFeedback(e.target.value)}
                                  placeholder="Conte um pouco mais sobre o que achou da sessão (opcional)..."
                                  className="w-full p-5 bg-white/5 border border-white/10 rounded-3xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 min-h-[100px] resize-none"
                               />
                               <div className="flex justify-end">
                                  <button 
                                     onClick={() => handleNPS(activeBooking.id)}
                                     disabled={isEvaluating}
                                     className="px-8 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
                                  >
                                     {isEvaluating ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                     Enviar Avaliação
                                  </button>
                               </div>
                            </div>
                         )}

                         {activeBooking.evaluatedAt && (
                            <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-emerald-500 text-center flex items-center justify-center gap-2">
                               <CheckCircle2 size={14} />
                               Sua avaliação foi registrada. Obrigado!
                            </p>
                         )}
                      </div>
                   )}
                </div>
             )}

             {/* Outros Agendamentos */}
             {!isCompleted && !activeBooking && (
                <div className="mt-4">
                   <UserBookings 
                      compact={true} 
                      filterSummary={substep.referenceId === "onboarding" ? "onboarding" : undefined} 
                   />
                </div>
             )}
          </div>
        );

      case "result":
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-16 bg-blue-500/5 rounded-[3.5rem] border border-blue-500/10 animate-in zoom-in duration-700">
             <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mb-8 relative">
                <CheckCircle2 size={40} className="text-blue-500" />
                <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse" />
             </div>
             <h3 className="text-xl font-black tracking-tight">Análise Concluída!</h3>
             <p className="text-[11px] font-medium text-[var(--text-muted)] mt-2 text-center max-w-xs leading-relaxed">
                Seus insights estratégicos já foram processados e estão prontos para visualização.
             </p>
             <button 
                onClick={onComplete}
                className="mt-10 px-10 py-4 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20"
             >
                Ver Relatório Completo
             </button>
          </div>
        );

      default:
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-20">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--accent-start)]" />
            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] opacity-50">Sincronizando Experiência...</p>
          </div>
        );
    }
  };

  return <div className="flex-1 flex flex-col h-full min-h-[500px]">{renderContent()}</div>;
}
