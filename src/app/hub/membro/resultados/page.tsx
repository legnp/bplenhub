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
  Layout, 
  Target, 
  Brain, 
  FileDown, 
  Loader2,
  FileText,
  CheckCircle2,
  ExternalLink,
  ClipboardList
} from "lucide-react";
import { HomeFooter } from "@/components/home/HomeFooter";
import { useAuthContext } from "@/context/AuthContext";
import { format, parseISO, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Hub - Área de Resultados do Membro 🧬
 * Versão Refinada (Corrigido Auth e com todos os Cards)
 */
export default function ResultadosPage() {
  const { user, matricula } = useAuthContext();
  const [gestaoResult, setGestaoResult] = useState<any>(null);
  const [aprendizadoResult, setAprendizadoResult] = useState<any>(null);
  const [reconhecimentoResult, setReconhecimentoResult] = useState<any>(null);
  const [discResult, setDiscResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Histórico de Mentorias
  const [historyBookings, setHistoryBookings] = useState<UserBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    async function load() {
      try {
        console.log("🔍 [ResultadosPage] Iniciando carga resiliente para UID:", user!.uid);
        
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

  return (
    <div className="flex flex-col min-h-screen animate-fade-in">
      <div className="max-w-[1400px] mx-auto p-6 md:p-12 space-y-12 flex-1 w-full">
        
        <AnimatePresence mode="wait">
          {loading ? (
            <LoadingView />
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              {/* Journey Header (100% width) */}
              <section className="bg-[var(--bg-primary)] border border-dashed border-[var(--border-primary)] rounded-[3.5rem] p-10 md:p-14 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                     <Compass size={180} className="text-[var(--accent-start)] rotate-12" />
                  </div>

                  <div className="relative z-10 max-w-2xl space-y-8">
                     <div className="space-y-4">
                        <div className="flex items-center gap-2.5 text-[var(--accent-start)]">
                           <Target size={18} className="animate-pulse" />
                           <span className="text-[10px] font-black uppercase tracking-[0.4em]">Visão Estratégica</span>
                        </div>
                        <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Visão da sua jornada</h2>
                     </div>
                     <div className="h-24 flex items-center border border-dashed border-[var(--border-primary)] rounded-2xl px-6 bg-[var(--bg-primary)]/50">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-40 italic">
                           Evolução estratégica em processamento...
                        </p>
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
                           
                           {discResult.file?.url && (
                              <a 
                                href={discResult.file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3.5 bg-blue-600/10 hover:bg-blue-600 text-blue-600 hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 mt-4"
                              >
                                <FileDown size={14} />
                                Relatório Completo PDF
                              </a>
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

                {/* Main: Journey Outcomes (2/3) — Histórico de Mentorias e Entregas 🧬 */}
                <div className="space-y-8 flex flex-col">
                   <div className="flex items-center justify-between px-6">
                      <div className="flex flex-col">
                         <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Histórico de Mentorias</h3>
                         <p className="text-[10px] font-bold text-[var(--accent-start)] uppercase tracking-widest mt-1">Sessões & Entregas Estratégicas</p>
                      </div>
                      <Layout size={18} className="text-[var(--text-muted)] opacity-20" />
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {loadingBookings ? (
                         <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 opacity-20">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Sincronizando Entregas...</p>
                         </div>
                      ) : historyBookings.length === 0 ? (
                         <div className="col-span-full py-24 bg-[var(--input-bg)] border border-dashed border-[var(--border-primary)] rounded-[3.5rem] flex flex-col items-center justify-center text-center px-10">
                            <Target size={40} className="text-[var(--text-muted)] opacity-20 mb-4" />
                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-[var(--text-primary)]">Sua jornada de mentoria está começando</h4>
                            <p className="text-[10px] font-medium text-[var(--text-muted)] mt-2 italic max-w-sm leading-relaxed">
                               As notas, documentos e feedbacks de suas sessões aparecerão aqui assim que as mentorias forem concluídas.
                            </p>
                         </div>
                      ) : (
                         historyBookings.map((booking) => (
                            <OutcomeCard key={booking.id} booking={booking} />
                         ))
                      )}
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
      <HomeFooter />
    </div>
  );
}

function LoadingView() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-white/5 rounded-[3rem]"
    >
        <div className="w-8 h-8 border-2 border-t-[var(--accent-start)] border-white/10 rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Sincronizando Diagnósticos...</p>
    </motion.div>
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

/**
 * OutcomeCard: Compact view of mentorship results
 */
function OutcomeCard({ booking }: { booking: UserBooking }) {
  const event = booking.eventDetail;
  if (!event) return null;

  const eventDate = parseISO(event.start);
  const isPresente = booking.attendanceStatus === "present";

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[var(--input-bg)]/40 border border-[var(--border-primary)] rounded-[2.5rem] p-6 space-y-4 hover:border-[var(--accent-start)]/30 transition-all group shadow-sm"
    >
       <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)] text-[var(--text-muted)] group-hover:text-[var(--accent-start)] transition-colors">
                <ClipboardList size={18} />
             </div>
             <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)]">{event.summary}</h4>
                <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-tight opacity-40">
                  {format(eventDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}
                </p>
             </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[7px] font-black uppercase tracking-widest ${isPresente ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
             {isPresente ? "Presença ✓" : "Ausência ✕"}
          </span>
       </div>

       {isPresente && (booking.participantFeedback || booking.participantTasks) && (
          <div className="space-y-3">
             {booking.participantFeedback && (
                <p className="text-[10px] text-[var(--text-primary)] font-medium leading-relaxed italic border-l-2 border-[var(--accent-start)]/20 pl-4 py-1">
                   &quot;{booking.participantFeedback}&quot;
                </p>
             )}
             
             <div className="flex flex-wrap gap-2">
                {booking.meetingMinutesFile && (
                   <a 
                     href={booking.meetingMinutesFile.url} 
                     target="_blank" 
                     className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl text-[8px] font-black uppercase tracking-widest hover:border-[var(--accent-start)] transition-all"
                   >
                      <FileText size={12} className="text-[var(--accent-start)]" />
                      Ata da Reunião
                   </a>
                )}
                {booking.participantDocs && booking.participantDocs.length > 0 && booking.participantDocs.map((doc, idx) => (
                   <a 
                     key={idx}
                     href={doc.url} 
                     target="_blank" 
                     className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl text-[8px] font-black uppercase tracking-widest hover:border-[var(--accent-start)] transition-all"
                   >
                      <ExternalLink size={12} className="text-[var(--text-muted)]" />
                   </a>
                ))}
             </div>
          </div>
       )}

       {!isPresente && (
          <div className="py-2 px-4 bg-red-500/5 rounded-2xl border border-red-500/10">
             <p className="text-[9px] font-bold text-red-600/60 leading-relaxed italic">
                Sua ausência foi registrada nesta sessão. Por favor, entre em contato com seu mentor em caso de dúvidas.
             </p>
          </div>
       )}
    </motion.div>
  );
}
