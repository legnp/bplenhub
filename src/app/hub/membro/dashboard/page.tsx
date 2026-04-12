"use client";

import React, { useState, useEffect } from "react";
import { TriadDonutChart } from "@/components/hub/TriadDonutChart";
import { StackedBarChart } from "@/components/hub/StackedBarChart";
import { DiscChart } from "@/components/hub/DiscChart";
import { 
  getGestaoTempoResult, 
  getAprendizadoResult, 
  getReconhecimentoResult,
  getPreAnaliseComportamentalResult,
  getDiscResult
} from "@/actions/get-user-results";
import { getUserBookingsAction } from "@/actions/calendar";
import { UserBooking } from "@/types/calendar";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  MessageCircle, 
  AlertCircle, 
  Sparkles, 
  Heart, 
  Compass, 
  Target, 
  Brain, 
  FileDown, 
  Loader2,
  FileText,
  CheckCircle2,
  ExternalLink,
  ClipboardList,
  CalendarDays,
  Eye,
  Briefcase
} from "lucide-react";
import { HomeFooter } from "@/components/home/HomeFooter";
import { useAuthContext } from "@/context/AuthContext";
import { format, parseISO, isBefore, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useJourney } from "@/hooks/useJourney";
import { JourneyNav } from "@/components/journey/JourneyNav";
import { StageOverviewCard } from "@/components/journey/StageOverviewCard";
import { JOURNEY_STAGES } from "@/config/journey/steps-registry";
import { BookingDetailModal } from "@/components/ui/UserBookings";
import { submitEvaluationAction } from "@/actions/calendar";
import Link from "next/link";
import AtmosphericLoading from "@/components/shared/AtmosphericLoading";

/**
 * Member Dashboard — BPlen HUB 🧬
 * Estrutura central de resultados, assessments e evolução do membro.
 */
export default function MemberDashboardPage() {
  const { user, matricula } = useAuthContext();
  const [gestaoResult, setGestaoResult] = useState<any>(null);
  const [aprendizadoResult, setAprendizadoResult] = useState<any>(null);
  const [reconhecimentoResult, setReconhecimentoResult] = useState<any>(null);
  const [discResult, setDiscResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Histórico de Mentorias
  const [historyBookings, setHistoryBookings] = useState<UserBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Journey Integration
  const { progress, loading: loadingJourney, getStepStatus } = useJourney(user?.uid || "guest");
  const [activeStageId, setActiveStageId] = useState<string>("onboarding");

  // Dashboard Agenda Modal (Reuse)
  const [selectedBooking_Dashboard, setSelectedBooking_Dashboard] = useState<UserBooking | null>(null);
  const [isEvaluating_Dashboard, setIsEvaluating_Dashboard] = useState<string | null>(null);

  const handleEvaluate_Dashboard = async (id: string, r: number, f: string) => {
    if (!matricula || !user) return;
    setIsEvaluating_Dashboard(id);
    try {
       await submitEvaluationAction(matricula, id, r, f, user.uid);
       // Sincronizar localmente se necessário ou recarregar
       const bookings = await getUserBookingsAction(matricula);
       const completed = bookings.filter(b => b.eventLifecycleStatus === 'completed' || isBefore(parseISO(b.eventDetail?.start || ""), new Date()));
       setHistoryBookings(completed);
    } catch (error) {
       console.error("Erro ao avaliar no dashboard:", error);
    } finally {
       setIsEvaluating_Dashboard(null);
    }
  };

  useEffect(() => {
    if (progress?.lastActiveStepId) {
       setActiveStageId(progress.lastActiveStepId);
    }
  }, [progress]);

  useEffect(() => {
    if (!user) return;
    
    async function load() {
      try {
        console.log("🔍 [MemberDashboard] Iniciando carga resiliente para UID:", user!.uid);
        
        const results = await Promise.allSettled([
          getGestaoTempoResult(user!.uid, user!.email || ''),
          getAprendizadoResult(user!.uid, user!.email || ''),
          getReconhecimentoResult(user!.uid, user!.email || ''),
          getDiscResult(user!.uid, user!.email || '')
        ]);

        // Processar resultados individualmente
        results.forEach((res, index) => {
          const names = ["Gestão do Tempo", "Aprendizado", "Reconhecimento", "DISC"];
          const name = names[index];

          if (res.status === "fulfilled") {
            const data = res.value;
            console.log(`✅ [ResultadosPage] ${name}: Carregado com sucesso.`, data ? "Docs existem." : "Sem docs.");
            
            if (index === 0) setGestaoResult(data);
            if (index === 1) setAprendizadoResult(data);
            if (index === 2) setReconhecimentoResult(data);
            if (index === 3) setDiscResult(data);
          } else {
            console.error(`❌ [ResultadosPage] ${name}: Falha crítica na Server Action. Motivo:`, res.reason);
          }
        });

      } catch (error) {
        console.error("🚨 [ResultadosPage] Erro inesperado no orquestrador:", error);
      } finally {
        setLoading(false);
      }

      // Carga do Histórico (Bookings)
      setLoadingBookings(true);
      try {
        if (matricula) {
           const bookings = await getUserBookingsAction(matricula);
           // Filtrar apenas concluídos e com presença (opcional, pode mostrar todos os passados)
           const completed = bookings.filter(b => b.eventLifecycleStatus === 'completed' || isBefore(parseISO(b.eventDetail?.start || ""), new Date()));
           setHistoryBookings(completed);
        }
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
      } finally {
        setLoadingBookings(false);
      }
    }
    load();
  }, [user]);

  // Mapeamento dinâmico para os gráficos (conforme estrutura do Firestore)
  const triadData = gestaoResult?.scores ? [
    { label: 'Importância', percentage: gestaoResult.scores.importancia?.percentage || 0, color: '#ec4899' },
    { label: 'Urgência', percentage: gestaoResult.scores.urgencia?.percentage || 0, color: '#facc15' },
    { label: 'Circunstância', percentage: gestaoResult.scores.circunstancia?.percentage || 0, color: '#94a3b8' },
  ] : [];

  const vacdData = aprendizadoResult?.scores ? [
    { label: 'Vis', percentage: aprendizadoResult.scores.visual?.percentage || 0, color: '#ec4899' },
    { label: 'Aud', percentage: aprendizadoResult.scores.auditivo?.percentage || 0, color: '#3b82f6' },
    { label: 'Cin', percentage: aprendizadoResult.scores.cinestesico?.percentage || 0, color: '#10b981' },
    { label: 'Dig', percentage: aprendizadoResult.scores.digital?.percentage || 0, color: '#f59e0b' },
  ] : [];

  const reconhecimentoData = reconhecimentoResult?.scores ? [
    { label: 'Afi', percentage: reconhecimentoResult.scores.afirmacao?.percentage || 0, color: '#ef4444' },
    { label: 'Tem', percentage: reconhecimentoResult.scores.tempo?.percentage || 0, color: '#3b82f6' },
    { label: 'Pre', percentage: reconhecimentoResult.scores.presentes?.percentage || 0, color: '#10b981' },
    { label: 'Ser', percentage: reconhecimentoResult.scores.servico?.percentage || 0, color: '#f59e0b' },
    { label: 'Toq', percentage: reconhecimentoResult.scores.toque?.percentage || 0, color: '#ec4899' },
  ] : [];

  const discData = discResult?.scores ? [
    { label: 'Executor', percentage: discResult.scores.executor?.percentage || 0, color: '#3b82f6' },
    { label: 'Comunicador', percentage: discResult.scores.comunicador?.percentage || 0, color: '#facc15' },
    { label: 'Planejador', percentage: discResult.scores.planejador?.percentage || 0, color: '#10b981' },
    { label: 'Analista', percentage: discResult.scores.analista?.percentage || 0, color: '#ef4444' },
  ] : [];

  const handleDownload = async (fileId: string) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      window.open(`/api/docs/${fileId}?token=${token}`, "_blank");
    } catch (error) {
      console.error("Erro ao gerar token para download:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen animate-fade-in">
      <div className="max-w-[1400px] mx-auto p-6 md:p-12 space-y-12 flex-1 w-full">
        
        <AnimatePresence mode="wait">
          {loading ? (
            <AtmosphericLoading />
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              {/* Journey Header (100% width) */}
              <section className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[3.5rem] p-10 md:p-14 relative overflow-visible group shadow-sm transition-all hover:shadow-xl hover:shadow-[var(--accent-primary)]/5">
                  {/* Decorative Background - Encapsulamento para não cortar sombras do conteúdo */}
                  <div className="absolute inset-0 overflow-hidden rounded-[3.5rem] pointer-events-none">
                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                       <Compass size={180} className="text-[var(--accent-start)] rotate-12" />
                    </div>
                  </div>

                  <div className="relative z-10 space-y-8">
                     <div className="space-y-4">
                        <div className="flex items-center gap-2.5 text-[var(--accent-start)]">
                           <Target size={18} className="animate-pulse" />
                           <span className="text-[10px] font-black uppercase tracking-[0.4em]">Jornada de Membro BPlen</span>
                        </div>
                        <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Dashboard do seu desenvolvimento</h2>
                     </div>

                     {/* Journey Navigation (Horizontal Stepper) */}
                     <div className="pt-4">
                        <JourneyNav 
                           currentStepId={activeStageId} 
                           stepStatusMap={progress?.steps ? Object.fromEntries(
                              Object.entries(progress.steps).map(([k, v]) => [k, v.status])
                           ) : {}}
                           onSelectStep={setActiveStageId}
                        />
                     </div>
                  </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 items-start">
                
                <aside className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--text-muted)] px-6">Perfil & Assessments</h3>
                  
                  {/* Assessment DISC (Lógica Híbrida 🧬🚀) */}
                  <div className={`p-8 bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-[2.5rem] space-y-4 transition-all relative overflow-hidden group shadow-sm ${!discResult ? 'opacity-60 grayscale' : 'hover:translate-y-[-4px] hover:shadow-xl hover:shadow-blue-500/5'}`}>
                     <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="flex flex-col">
                           <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Assessment DISC</span>
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)]">Perfil Comportamental</h4>
                        </div>
                        {discResult?.isReleased === false ? (
                           <div className="flex items-center gap-2 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              <span className="text-[7px] font-black uppercase tracking-[0.15em] text-amber-600">
                                Diagnóstico Ativo
                              </span>
                           </div>
                        ) : discResult ? (
                           <div className="flex items-center gap-2 px-2.5 py-1 bg-green-500/10 border border-green-500/10 rounded-full">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              <span className="text-[7px] font-black uppercase tracking-[0.15em] text-green-600">
                                Concluído
                              </span>
                           </div>
                        ) : (
                           <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-muted)] opacity-50">Manual</span>
                        )}
                     </div>

                     {discResult ? (
                        <div className="space-y-6 relative z-10">
                           <DiscChart data={discData} mini />
                           
                           {discResult.file?.fileId && (
                              <button 
                                onClick={async () => {
                                  if (!user) return;
                                  const token = await user.getIdToken();
                                  window.open(`/api/docs/${discResult.file.fileId}?token=${token}`, "_blank");
                                }}
                                className="w-full py-3.5 bg-blue-600/10 hover:bg-blue-600 text-blue-600 hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 mt-4"
                              >
                                <FileDown size={14} />
                                Relatório Completo PDF
                              </button>
                           )}
                        </div>
                     ) : (
                        <div className="w-32 h-32 mx-auto rounded-full border border-dashed border-[var(--border-primary)] flex items-center justify-center bg-[var(--bg-primary)]/30">
                           <Brain size={24} className="text-[var(--text-muted)] opacity-20" />
                        </div>
                     )}
                     
                     {/* Decorative Background */}
                     {discResult && <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />}
                  </div>

                  {/* Gestão do Tempo */}
                  {gestaoResult && (
                     <MiniCard 
                        title="Gestão do Tempo" 
                        subtitle="Tríade do Tempo" 
                        isReleased={gestaoResult.isReleased !== false}
                        submittedAt={gestaoResult.submittedAt}
                        icon={<Clock size={14} className="text-[var(--accent-start)]" />}
                        chart={<TriadDonutChart data={triadData} mini />}
                        data={triadData} 
                     />
                  )}

                  {/* Aprendizado (VACD) */}
                  {aprendizadoResult && (
                     <MiniCard 
                        title="Preferências de Aprendizado" 
                        subtitle="Mapeamento VACD" 
                        isReleased={aprendizadoResult.isReleased !== false}
                        submittedAt={aprendizadoResult.submittedAt}
                        icon={<Sparkles size={14} className="text-[var(--accent-start)]" />}
                        chart={<TriadDonutChart data={vacdData} mini />}
                        data={vacdData}
                     />
                  )}

                  {/* Linguagens de Reconhecimento */}
                  {reconhecimentoResult && (
                     <MiniCard 
                        title="Linguagens de Reconhecimento" 
                        subtitle="Análise Premiações" 
                        isReleased={reconhecimentoResult.isReleased !== false}
                        submittedAt={reconhecimentoResult.submittedAt}
                        icon={<Target size={14} className="text-[var(--accent-start)]" />}
                        chart={<StackedBarChart data={reconhecimentoData} />}
                        data={reconhecimentoData}
                     />
                  )}
                </aside>

                {/* Main: Journey Outcomes Card & Minimized History */}
                <div className="space-y-8 flex flex-col">
                   
                   {/* Informative Minimized History */}
                   <div className="p-8 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[2.5rem] space-y-6 shadow-sm">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-[var(--accent-start)]/10 rounded-2xl border border-[var(--accent-start)]/20 text-[var(--accent-start)]">
                            <CalendarDays size={20} />
                         </div>
                         <div className="flex flex-col text-left">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Sua agenda BPlen</h3>
                            <p className="text-xs font-black text-[var(--text-primary)] tracking-tight mt-1">1 to 1 & Sessões</p>
                         </div>
                      </div>

                      <div className="space-y-4">
                        {loadingBookings ? (
                           <div className="py-8 flex items-center gap-4 opacity-30">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <p className="text-[9px] font-black uppercase tracking-widest">Sincronizando...</p>
                           </div>
                        ) : historyBookings.length === 0 ? (
                           <div className="py-10 bg-[var(--input-bg)]/30 border border-dashed border-[var(--border-primary)] rounded-2xl text-center px-6">
                              <p className="text-[9px] font-medium text-[var(--text-muted)] italic leading-relaxed">
                                Suas atividades de mentoria aparecerão aqui.
                              </p>
                           </div>
                        ) : (
                           // Mostra apenas o evento mais significativo (Ex: Próximo ou Último)
                           <div className="space-y-4">
                              <OutcomeCard 
                                 booking={
                                    historyBookings.find(b => isAfter(parseISO(b.eventDetail?.start || ""), new Date())) 
                                    || historyBookings[0]
                                 } 
                                 onDownload={handleDownload} 
                                 onViewDetails={(b) => setSelectedBooking_Dashboard(b)}
                                 compact
                              />
                              
                              <Link 
                                 href="/hub/membro/gestao_agenda"
                                 className="w-full py-4 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:scale-[1.01] transition-all shadow-lg"
                              >
                                 Gestão de Agenda completa
                                 <ExternalLink size={12} />
                              </Link>
                           </div>
                        )}
                      </div>
                   </div>

                   {/* Módulo Gestão de Carreira (Em Desenvolvimento) */}
                   <div className="p-8 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[3.5rem] space-y-6 shadow-sm opacity-60">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-[var(--accent-primary)]/5 rounded-2xl border border-[var(--accent-primary)]/20 text-[var(--accent-primary)]">
                            <Briefcase size={20} />
                         </div>
                         <div className="flex flex-col text-left">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Módulo Complementar</h3>
                            <p className="text-xs font-black text-[var(--text-primary)] tracking-tight mt-1">Gestão de Carreira</p>
                         </div>
                      </div>
                      
                      <div className="py-14 bg-[var(--input-bg)]/30 border border-dashed border-[var(--border-primary)] rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                         <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] italic">Em desenvolvimento</p>
                      </div>
                   </div>

                </div>

              </div>

              {/* Telenetria de Identidade (Debug) */}
              <div className="pt-12 border-t border-[var(--border-primary)] border-dashed opacity-20 hover:opacity-100 transition-opacity">
                  <div className="flex flex-col items-center gap-2 text-[8px] font-mono uppercase tracking-[0.2em] text-[var(--text-muted)] text-center">
                     <p>🧬 Sincronismo de Identidade Ativo</p>
                     <p>UID: {user?.uid}</p>
                     <p>E-mail: {user?.email}</p>
                  </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Detail Modal Reutilizado */}
      {selectedBooking_Dashboard && (
        <BookingDetailModal 
          booking={selectedBooking_Dashboard}
          isOpen={!!selectedBooking_Dashboard}
          onClose={() => setSelectedBooking_Dashboard(null)}
          onEvaluate={handleEvaluate_Dashboard}
          isSubmitting={isEvaluating_Dashboard === selectedBooking_Dashboard.id}
          onRefresh={async () => {
             if (matricula) {
                const bookings = await getUserBookingsAction(matricula);
                const completed = bookings.filter(b => b.eventLifecycleStatus === 'completed' || isBefore(parseISO(b.eventDetail?.start || ""), new Date()));
                setHistoryBookings(completed);
             }
          }}
        />
      )}

      <HomeFooter />
    </div>
  );
}


/**
 * MiniCard: Compact Assessment View
 */
function MiniCard({ title, subtitle, data, icon, isReleased, submittedAt, chart }: any) {
  const formattedDate = submittedAt ? new Date(submittedAt.seconds ? submittedAt.seconds * 1000 : submittedAt).toLocaleDateString("pt-BR") : null;

  return (
    <section className={`p-8 bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-[2.5rem] space-y-4 transition-all relative overflow-hidden group/card shadow-sm ${!isReleased ? 'opacity-70 grayscale-[0.5]' : 'hover:translate-y-[-4px] hover:shadow-xl hover:shadow-[var(--accent-start)]/5'}`}>
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center shadow-inner group-hover/card:bg-[var(--accent-soft)] transition-colors">
            {icon}
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)]">{title}</h4>
            <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-tight opacity-60 group-hover/card:opacity-100 transition-opacity">{subtitle}</p>
          </div>
        </div>
        
        {/* Status Badge */}
        {!isReleased && (
          <div className="flex items-center gap-2 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
            <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[7px] font-black uppercase tracking-[0.15em] text-amber-600">
              Diagnosticando
            </span>
          </div>
        )}
      </div>

      {/* Chart Area with Blur Effect if Pending */}
      <div className={`transition-all duration-700 ${!isReleased ? 'blur-md grayscale opacity-30 select-none' : 'opacity-100 group-hover/card:scale-[0.98]'}`}>
        {(data && data.length > 0) ? (
          chart
        ) : (
          <div className="w-32 h-32 mx-auto rounded-full border border-dashed border-[var(--border-primary)] flex items-center justify-center bg-[var(--bg-primary)]/30">
             <Heart size={16} className="text-[var(--accent-start)] opacity-20" />
          </div>
        )}
      </div>

      {/* Legend for Mini Chart */}
      {isReleased && data.length > 0 && (
         <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 px-4 transition-all duration-500 opacity-70 group-hover/card:opacity-100">
            {data.map((item: any) => (
               <div key={item.label} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[7.5px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
                     {item.label}
                  </span>
               </div>
            ))}
         </div>
      )}

      {/* Discreet Submission Date */}
      {formattedDate && (
        <div className="pt-2 border-t border-[var(--border-primary)] border-dashed opacity-30 group-hover/card:opacity-60 transition-opacity text-center">
           <p className="text-[8px] font-medium uppercase tracking-[0.2em] text-[var(--text-muted)] flex items-center justify-center gap-1.5">
              Mapeado em {formattedDate}
           </p>
        </div>
      )}

      {/* Decorative Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
    </section>
  );
}
function OutcomeCard({ 
  booking, 
  onDownload, 
  onViewDetails,
  compact 
}: { 
  booking: UserBooking, 
  onDownload: (fileId: string) => void, 
  onViewDetails: (booking: UserBooking) => void,
  compact?: boolean 
}) {
  const event = booking.eventDetail;
  if (!event) return null;

  const eventDate = parseISO(event.start);
  const isPast = isBefore(eventDate, new Date());
  const isPresente = booking.attendanceStatus === "present";
  const isAusente = booking.attendanceStatus === "absent";

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

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group flex flex-col md:flex-row gap-4 items-center px-6 py-5 bg-[var(--bg-primary)]/40 border border-[var(--border-primary)] rounded-[2rem] hover:border-[var(--accent-start)]/30 transition-all hover:translate-y-[-2px] shadow-sm relative overflow-hidden"
    >
       {/* Date Block */}
       <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[var(--accent-start)] to-[var(--accent-end)] flex flex-col items-center justify-center text-white shadow-lg shadow-[var(--accent-start)]/20 border border-white/10">
             <span className="text-[7px] font-black uppercase leading-none">{format(eventDate, "MMM", { locale: ptBR })}</span>
             <span className="text-xs font-black leading-tight">{format(eventDate, "dd")}</span>
          </div>
          <span className="text-[10px] font-bold text-[var(--text-muted)] opacity-60">{format(eventDate, "HH:mm")}h</span>
       </div>

       {/* Info Content */}
       <div className="flex-1 min-w-0 text-left">
          <h4 className="text-xs font-black text-[var(--text-primary)] truncate transition-colors group-hover:text-[var(--accent-start)]">
             {event.summary}
          </h4>
          <div className="flex items-center gap-3 mt-1">
             {event.theme && (
                <span className="text-[9px] font-bold text-[var(--accent-start)]/60 truncate"># {event.theme}</span>
             )}
             <span className="text-[9px] font-bold text-[var(--text-muted)] opacity-40">/ {event.mentor || "BPlen"}</span>
          </div>
       </div>

       {/* Status & Action */}
       <div className="flex items-center gap-4 shrink-0">
          <span className={`px-2.5 py-1 rounded-full text-[7px] font-black uppercase tracking-widest ${statusColor}`}>
             {statusLabel}
          </span>
          <button 
             onClick={() => onViewDetails(booking)}
             className="p-2.5 bg-[var(--input-bg)] rounded-xl border border-[var(--border-primary)] text-[var(--text-muted)] hover:text-[var(--accent-start)] hover:border-[var(--accent-start)]/30 transition-all shadow-sm"
          >
             <Eye size={16} />
          </button>
       </div>

       {/* Decorative Background */}
       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--accent-start)]/0 to-[var(--accent-start)]/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}
