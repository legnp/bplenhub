"use client";

import React, { useState, useEffect } from "react";
import { HubShell } from "@/components/hub/HubShell";
import { TriadDonutChart } from "@/components/hub/TriadDonutChart";
import { getAuth } from "firebase/auth";
import { getGestaoTempoResult, getPreferenciasAprendizadoResult, getPreferenciasReconhecimentoResult } from "@/actions/get-user-results";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MessageCircle, AlertCircle, Sparkles, Heart, Compass, Layout, Target } from "lucide-react";
import { HomeFooter } from "@/components/home/HomeFooter";

/**
 * Hub - Área de Resultados do Membro 🧬
 * Layout v4.0: Estrutura em Split (Sidebar 1/3) para Alta Performance.
 */
export default function ResultadosPage() {
  const [gestaoResult, setGestaoResult] = useState<any>(null);
  const [aprendizadoResult, setAprendizadoResult] = useState<any>(null);
  const [reconhecimentoResult, setReconhecimentoResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const [gestao, aprendizado, reconhecimento] = await Promise.all([
            getGestaoTempoResult(user.uid),
            getPreferenciasAprendizadoResult(user.uid),
            getPreferenciasReconhecimentoResult(user.uid)
          ]);
          setGestaoResult(gestao);
          setAprendizadoResult(aprendizado);
          setReconhecimentoResult(reconhecimento);
        }
      } catch (err) {
        console.error("Erro ao carregar resultados:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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
    <HubShell>
      <div className="min-h-screen flex flex-col">
        <div className="max-w-[1400px] mx-auto p-6 md:p-12 space-y-12 flex-1 w-full">
          
          <header className="space-y-3">
             <div className="flex items-center gap-3">
                <div className="bg-[var(--accent-soft)] p-2.5 rounded-2xl text-[var(--accent-start)]">
                   <Layout size={20} />
                </div>
                <h1 className="text-4xl font-black tracking-tight text-[var(--text-primary)]">Suas Análises</h1>
             </div>
             <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-xl">
                Dashboards de inteligência e mapeamento de performance para sua mentoria estratégica.
             </p>
          </header>

          <AnimatePresence mode="wait">
            {loading ? (
              <LoadingView />
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                {/* 1. Visão da sua jornada (Full Width) 🚀 */}
                <section className="p-10 blur-glass border border-white/10 rounded-[3rem] bg-white/5 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Compass size={120} className="text-white" />
                   </div>
                   <div className="relative space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                         <Target size={18} className="text-[var(--accent-start)]" />
                         <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Visão da sua jornada</h2>
                      </div>
                      <div className="h-24 flex items-center border border-dashed border-white/5 rounded-2xl px-6">
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-30 italic">
                            Evolução estratégica em processamento...
                         </p>
                      </div>
                   </div>
                </section>

                {/* 2. Grid de Split (1/3 Sidebar | 2/3 Content) 📋 */}
                <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 items-start">
                  
                  {/* Sidebar: Assessments (1/3) */}
                  <aside className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--text-muted)] px-6">Perfil & Assessments</h3>
                    
                    {/* DISC Placeholder */}
                    <div className="p-8 blur-glass border border-white/10 rounded-[2.5rem] bg-white/5 space-y-4 opacity-50 grayscale hover:grayscale-0 transition-all group">
                       <div className="flex items-center justify-between mb-4">
                          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Assessment DISC</span>
                          <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5">Em Breve</span>
                       </div>
                       <div className="w-32 h-32 mx-auto rounded-full border border-dashed border-white/10 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-center text-[var(--text-muted)] opacity-30">Perfil<br/>Comportamental</span>
                       </div>
                    </div>

                    {/* Aprendizado (VACD) */}
                    {aprendizadoResult && aprendizadoResult.isReleased && (
                       <MiniCard 
                          title="Aprendizado" 
                          subtitle="VACD" 
                          data={vacdData} 
                          icon={<Sparkles size={14} className="text-pink-500" />}
                       />
                    )}

                    {/* Reconhecimento */}
                    {reconhecimentoResult && reconhecimentoResult.isReleased && (
                       <MiniCard 
                          title="Reconhecimento" 
                          subtitle="Linguagem" 
                          data={reconhecimentoData} 
                          icon={<Heart size={14} className="text-red-500" />}
                       />
                    )}

                    {/* Gestão do Tempo (Tríade) */}
                    {gestaoResult && gestaoResult.isReleased && (
                       <MiniCard 
                          title="Tríade do Tempo" 
                          subtitle="Energia" 
                          data={triadData} 
                          icon={<Clock size={14} className="text-blue-500" />}
                       />
                    )}
                  </aside>

                  {/* Main: Journey Insights (2/3) */}
                  <div className="space-y-8 h-full min-h-[600px] blur-glass border border-white/5 rounded-[3.5rem] bg-white/[0.02] relative overflow-hidden flex flex-col items-center justify-center group/main">
                     <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-start)]/5 to-transparent opacity-0 group-hover/main:opacity-100 transition-opacity duration-1000" />
                     <div className="relative text-center space-y-4 opacity-20 group-hover/main:opacity-40 transition-opacity">
                        <div className="p-8 rounded-full border border-dashed border-white/20 inline-block">
                           <Layout size={40} className="text-white" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Conteúdo em curadoria</p>
                     </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <HomeFooter />
      </div>
    </HubShell>
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

function MiniCard({ title, subtitle, data, icon }: any) {
  return (
    <section className="p-8 blur-glass border border-white/10 rounded-[2.5rem] bg-white/5 space-y-6 hover:translate-y-[-4px] transition-all duration-300">
        <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                {icon && <div className="p-2 bg-white/5 rounded-xl">{icon}</div>}
                <div className="space-y-0.5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">{subtitle}</p>
                    <h2 className="text-sm font-bold text-[var(--text-primary)]">{title}</h2>
                </div>
            </div>
        </header>

        <div className="scale-90 -mx-4">
            <TriadDonutChart data={data} mini />
        </div>
    </section>
  );
}
