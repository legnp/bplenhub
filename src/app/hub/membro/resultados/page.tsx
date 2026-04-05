"use client";

import React, { useState, useEffect } from "react";
import { HubShell } from "@/components/hub/HubShell";
import { TriadDonutChart } from "@/components/hub/TriadDonutChart";
import { getAuth } from "firebase/auth";
import { getGestaoTempoResult } from "@/actions/get-user-results";
import { motion, AnimatePresence } from "framer-motion";
import { Time, Clock, MessageCircle, AlertCircle } from "lucide-react";

/**
 * Hub - Área de Resultados do Membro 🧬
 * Exibe o output das surveys institucionais e diagnósticos analíticos.
 */
export default function ResultadosPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const data = await getGestaoTempoResult(user.uid);
          setResult(data);
        }
      } catch (err) {
        console.error("Erro ao carregar resultados:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const triadData = result?.scores ? [
    { 
      label: "Importância", 
      percentage: result.scores.importancia.percentage, 
      color: "#6366F1", // Lavanda
      description: "Atividades que trazem resultados e têm significado na sua vida."
    },
    { 
      label: "Urgência", 
      percentage: result.scores.urgencia.percentage, 
      color: "#F59E0B", // Amarelo
      description: "Tarefas que precisam ser feitas agora, muitas vezes gerando estresse."
    },
    { 
      label: "Circunstância", 
      percentage: result.scores.circunstancia.percentage, 
      color: "#64748B", // Cinza/Muted
      description: "Atividades sem valor, sociais demais ou que não agregam ao seu propósito."
    }
  ] : [];

  return (
    <HubShell>
       <div className="max-w-[1200px] mx-auto p-6 md:p-12 space-y-12">
          
          <header className="space-y-3">
             <div className="flex items-center gap-3">
                <div className="bg-[var(--accent-soft)] p-2.5 rounded-2xl">
                   <Clock size={20} className="text-[var(--accent-start)]" />
                </div>
                <h1 className="text-3xl font-bold tracking-tighter text-[var(--text-primary)]">Suas Análises</h1>
             </div>
             <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-xl">
                Acompanhe aqui o resultado de seus testes, avaliações e exercícios de autoconhecimento realizados no BPlen HUB.
             </p>
          </header>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-white/5 rounded-[3rem]"
              >
                  <div className="w-8 h-8 border-2 border-t-[var(--accent-start)] border-white/10 rounded-full animate-spin mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Sincronizando Diagnósticos...</p>
              </motion.div>
            ) : !result ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-12 text-center blur-glass border border-white/10 rounded-[3rem] bg-white/5"
              >
                  <div className="w-16 h-16 bg-white/5 text-[var(--text-muted)] rounded-full flex items-center justify-center mx-auto mb-6 opacity-30">
                     <AlertCircle size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">Nenhum resultado ainda</h2>
                  <p className="text-sm text-[var(--text-muted)] mt-2 max-w-md mx-auto">
                     Realize suas pesquisas e atividades para visualizar seus dashboards de inteligência comportamental aqui.
                  </p>
              </motion.div>
            ) : !result.isReleased ? (
              <motion.div 
                key="waiting"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-10 md:p-16 border-2 border-[var(--accent-start)]/20 bg-[var(--accent-soft)] rounded-[3rem] text-center space-y-8 relative overflow-hidden"
              >
                 <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-start)] rounded-full blur-[100px] opacity-[0.05] pointer-events-none" />
                 
                 <div className="w-20 h-20 bg-[var(--accent-start)]/10 text-[var(--accent-start)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--accent-start)]/20">
                    <MessageCircle size={32} />
                 </div>
                 
                 <div className="space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Análise de Gestão do Tempo</h2>
                    <div className="flex items-center justify-center gap-2">
                       <span className="w-1.5 h-1.5 bg-[var(--accent-start)] rounded-full animate-pulse" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-start)]">Em processamento pela equipe</span>
                    </div>
                 </div>

                 <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-xl mx-auto italic">
                    "Agradecemos sua participação! Seus resultados estão sendo analisados e serão apresentados a você em detalhes na sua reunião de devolutiva da análise comportamental."
                 </p>

                 <div className="pt-6">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl inline-block">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Próximo Passo</span>
                        <p className="text-xs text-[var(--text-primary)] mt-1">Aguarde o agendamento da sua reunião institucional.</p>
                    </div>
                 </div>
              </motion.div>
            ) : (
                <motion.div 
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-12"
                >
                    <section className="p-8 md:p-12 blur-glass border border-white/10 rounded-[3rem] bg-white/5 space-y-10">
                        <header className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="space-y-1 text-center md:text-left">
                                <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Tríade do Tempo</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-start)]">Diagnóstico Liberado</p>
                            </div>
                            <div className="px-4 py-2 bg-white/5 rounded-2xl border border-white/10 text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                                Submetido em {new Date(result.submittedAt?.seconds * 1000).toLocaleDateString()}
                            </div>
                        </header>

                        <TriadDonutChart data={triadData} />

                        <div className="pt-8 border-t border-white/5">
                            <h3 className="text-lg font-bold mb-4">Sua Autoanálise</h3>
                            <div className="p-6 rounded-2xl bg-black/20 border border-white/5 text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line italic">
                                "{result.responses.auto_avaliacao}"
                            </div>
                        </div>
                    </section>
                </motion.div>
            )}
          </AnimatePresence>
       </div>
    </HubShell>
  );
}
