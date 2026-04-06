"use client";

import React, { useState, useEffect } from "react";
import { TriadDonutChart } from "@/components/hub/TriadDonutChart";
import { getGestaoTempoResult, getPreferenciasAprendizadoResult, getPreferenciasReconhecimentoResult, getPreAnaliseComportamentalResult } from "@/actions/get-user-results";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MessageCircle, AlertCircle, Sparkles, Heart, Compass, Layout, Target, Brain } from "lucide-react";
import { HomeFooter } from "@/components/home/HomeFooter";
import { useAuthContext } from "@/context/AuthContext";

/**
 * Hub - Área de Resultados do Membro 🧬
 * Versão Refinada (Corrigido Auth e com todos os Cards)
 */
export default function ResultadosPage() {
  const { user } = useAuthContext();
  const [gestaoResult, setGestaoResult] = useState<any>(null);
  const [aprendizadoResult, setAprendizadoResult] = useState<any>(null);
  const [reconhecimentoResult, setReconhecimentoResult] = useState<any>(null);
  const [preAnaliseResult, setPreAnaliseResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    async function load() {
      try {
        console.log("🔍 [ResultadosPage] Iniciando carga de dados para UID:", user!.uid);
        const [gestao, aprendizado, reconhecimento, preAnalise] = await Promise.all([
          getGestaoTempoResult(user!.uid, user!.email || undefined),
          getPreferenciasAprendizadoResult(user!.uid, user!.email || undefined),
          getPreferenciasReconhecimentoResult(user!.uid, user!.email || undefined),
          getPreAnaliseComportamentalResult(user!.uid, user!.email || undefined)
        ]);

        console.log("🔍 [ResultadosPage] Dados recebidos:", { gestao, aprendizado, reconhecimento, preAnalise });
        
        setGestaoResult(gestao);
        setAprendizadoResult(aprendizado);
        setReconhecimentoResult(reconhecimento);
        setPreAnaliseResult(preAnalise);
      } catch (error) {
        console.error("❌ [ResultadosPage] Erro ao carregar resultados:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const triadData = gestaoResult?.scores ? [
    { label: "Importância", percentage: gestaoResult.scores.importancia.percentage, color: "#6366F1" },
    { label: "Urgência", percentage: gestaoResult.scores.urgencia.percentage, color: "#F59E0B" },
    { label: "Circunstância", percentage: gestaoResult.scores.circunstancia.percentage, color: "#64748B" }
  ] : [];

  const vacdData = aprendizadoResult?.scores ? [
    { label: "Visual", percentage: aprendizadoResult.scores.visual.percentage, color: "#EC4899" },
    { label: "Auditivo", percentage: aprendizadoResult.scores.auditivo.percentage, color: "#3B82F6" },
    { label: "Cinestésico", percentage: aprendizadoResult.scores.cinestesico.percentage, color: "#10B981" },
    { label: "Digital", percentage: aprendizadoResult.scores.digital.percentage, color: "#8B5CF6" }
  ] : [];

  const reconhecimentoData = reconhecimentoResult?.scores ? [
    { label: "Afirmação", percentage: reconhecimentoResult.scores.afirmacao.percentage, color: "#FF7F50" },
    { label: "Serviço", percentage: reconhecimentoResult.scores.servico.percentage, color: "#10B981" },
    { label: "Presentes", percentage: reconhecimentoResult.scores.presentes.percentage, color: "#FFD700" },
    { label: "Tempo", percentage: reconhecimentoResult.scores.tempo.percentage, color: "#007FFF" },
    { label: "Toque", percentage: reconhecimentoResult.scores.toque.percentage, color: "#DC143C" }
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
                  
                  {/* DISC Placeholder */}
                  <div className="p-8 bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-[2.5rem] space-y-4 opacity-60 grayscale hover:grayscale-0 transition-all group shadow-sm">
                     <div className="flex items-center justify-between mb-4">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Assessment DISC</span>
                        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-muted)]">Em Breve</span>
                     </div>
                     <div className="w-32 h-32 mx-auto rounded-full border border-dashed border-[var(--border-primary)] flex items-center justify-center bg-[var(--bg-primary)]/30">
                        <span className="text-[10px] font-bold text-center text-[var(--text-muted)] opacity-30">Perfil<br/>Comportamental</span>
                     </div>
                  </div>

                  {/* Pré-Análise Comportamental */}
                  {preAnaliseResult && (
                     <MiniCard 
                        title="Análise Comportamental" 
                        subtitle="Mapeamento" 
                        data={[]} 
                        isReleased={preAnaliseResult.isReleased}
                        submittedAt={preAnaliseResult.submittedAt}
                        icon={<Brain size={14} className="text-[var(--accent-start)]" />}
                     />
                  )}

                  {/* Aprendizado (VACD) */}
                  {aprendizadoResult && (
                     <MiniCard 
                        title="Aprendizado" 
                        subtitle="VACD" 
                        data={vacdData} 
                        isReleased={aprendizadoResult.isReleased}
                        submittedAt={aprendizadoResult.submittedAt}
                        icon={<Sparkles size={14} className="text-pink-500" />}
                     />
                  )}

                  {/* Reconhecimento */}
                  {reconhecimentoResult && (
                     <MiniCard 
                        title="Reconhecimento" 
                        subtitle="Linguagem" 
                        data={reconhecimentoData} 
                        isReleased={reconhecimentoResult.isReleased}
                        submittedAt={reconhecimentoResult.submittedAt}
                        icon={<Heart size={14} className="text-red-500" />}
                     />
                  )}

                  {/* Gestão do Tempo (Tríade) */}
                  {gestaoResult && (
                     <MiniCard 
                        title="Tríade do Tempo" 
                        subtitle="Energia" 
                        data={triadData} 
                        isReleased={gestaoResult.isReleased}
                        submittedAt={gestaoResult.submittedAt}
                        icon={<Clock size={14} className="text-blue-500" />}
                     />
                  )}
                </aside>

                {/* Main: Journey Insights (2/3) */}
                <div className="space-y-8 min-h-[600px] bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-[3.5rem] shadow-sm relative overflow-hidden flex flex-col items-center justify-center group/main">
                   <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-start)]/[0.03] to-transparent opacity-0 group-hover/main:opacity-100 transition-opacity duration-1000" />
                   <div className="relative text-center space-y-4 opacity-20 group-hover/main:opacity-40 transition-all duration-500">
                      <Layout size={48} className="mx-auto text-[var(--accent-start)]" />
                      <div>
                         <h4 className="text-sm font-black uppercase tracking-[0.3em] text-[var(--text-primary)]">Conteúdo em Curadoria</h4>
                         <p className="text-[10px] font-medium text-[var(--text-muted)] mt-2 italic">Aguardando definição da régua estratégica de mentoria.</p>
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
function MiniCard({ title, subtitle, data, icon, isReleased, submittedAt }: any) {
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

      {/* Donut Chart with Blur Effect if Pending */}
      <div className={`scale-90 -mx-4 transition-all duration-700 ${!isReleased ? 'blur-md grayscale opacity-30 select-none' : 'opacity-100 group-hover/card:scale-95'}`}>
        {data.length > 0 ? (
          <TriadDonutChart data={data} mini />
        ) : (
          <div className="w-32 h-32 mx-auto rounded-full border border-dashed border-[var(--border-primary)] flex items-center justify-center bg-[var(--bg-primary)]/30">
             <Heart size={16} className="text-[var(--accent-start)] opacity-20" />
          </div>
        )}
      </div>

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
