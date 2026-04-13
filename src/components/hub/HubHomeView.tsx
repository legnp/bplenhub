"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Rocket, 
  ChevronRight, 
  Sparkles, 
  ArrowRight, 
  Zap, 
  Lock, 
  MessageSquare, 
  CheckCircle2, 
  Layout, 
  BarChart, 
  Menu, 
  User, 
  Phone, 
  Sun, 
  Moon,
  ExternalLink,
  Target,
  Briefcase,
  Globe
} from "lucide-react";
import { MOCK_SERVICES, MOCK_TOOLS } from "@/config/hub-data";
import { useTheme } from "@/context/ThemeContext";
import { getSocialPosts } from "@/actions/social";
import { SocialPost } from "@/types/social";

/**
 * HUB HOME VIEW — O Coração da Experiência Privada 🧬
 * Estruturada como uma jornada de desenvolvimento.
 */

export function HubHomeView() {
  const [latestPosts, setLatestPosts] = useState<SocialPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await getSocialPosts(true); // Apenas ativos
        setLatestPosts(data.slice(0, 3)); // Pegar apenas os 3 mais recentes
      } catch (error) {
        console.error("Erro ao carregar posts no Hub:", error);
      } finally {
        setIsLoadingPosts(false);
      }
    }
    loadPosts();
  }, []);

  const getPlatformLabel = (platform: string) => {
    const labels: Record<string, string> = {
      linkedin: "LinkedIn",
      instagram: "Instagram",
      tiktok: "TikTok",
      whatsapp: "WhatsApp",
      other: "Conteúdo"
    };
    return labels[platform] || "Conteúdo";
  };

  return (
    <div className="w-full flex flex-col min-h-screen relative font-sans">
      
      {/* 🔮 CONTEÚDO PRINCIPAL DO HUB */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 pt-[10px] pb-12 md:pt-[10px] md:pb-20 space-y-32">
        
        {/* 1. SEÇÃO JORNADA (VITRINE DE SERVIÇOS) */}
        <section className="space-y-12">
           <div className="space-y-4 max-w-2xl">
              <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-start)]">
                 <Rocket size={14} /> Sua Evolução BPlen
              </span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)] leading-tight text-left">
                 Como está sua <span className="text-[var(--text-secondary)] italic">Jornada BPlen?</span>
              </h2>
              <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed text-left">
                 O hub organiza sua evolução com clareza. Veja como você já avançou 
                 e descubra os próximos passos ideais para o seu sucesso.
              </p>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Timeline de Serviços */}
              <div className="lg:col-span-12 relative flex flex-col md:flex-row gap-8 py-12">
                 {/* Linha de Progresso Sutil (Desktop) */}
                 <div className="absolute top-[4.5rem] left-0 w-full h-px bg-[var(--border-primary)] hidden md:block" />
                 
                 {MOCK_SERVICES.map((service, idx) => (
                    <motion.div 
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative z-10 flex-1 group"
                    >
                       {/* Circle Indicator */}
                       <div className="flex flex-col items-center mb-8">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500
                             ${service.status === 'acquired' ? 'bg-[var(--accent-start)] border-[var(--accent-start)] shadow-[0_0_20px_rgba(255,44,141,0.4)]' : 
                                service.status === 'available' ? 'bg-[var(--input-bg)] border-[var(--input-border)] group-hover:border-[var(--accent-start)]/50' : 'bg-transparent border-[var(--border-primary)]'}`}>
                             {service.status === 'acquired' ? <CheckCircle2 size={24} className="text-white" /> : 
                              service.status === 'available' ? <Sparkles size={18} className="text-[var(--text-secondary)]" /> : <Lock size={18} className="text-[var(--text-muted)]" />}
                          </div>
                       </div>

                       {/* Service Card Card */}
                       <div className={`p-8 rounded-[2.5rem] border backdrop-blur-2xl transition-all duration-500 h-full flex flex-col
                        ${service.status === 'acquired' ? 'bg-[var(--input-bg)] border-[var(--input-border)]' : 
                          service.status === 'available' ? 'bg-[var(--input-bg)] border-[var(--input-border)] hover:bg-[var(--accent-soft)]' : 'bg-transparent border-[var(--border-primary)] opacity-40 grayscale pointer-events-none'}`}>
                          
                          <div className="mb-6 flex justify-between items-start">
                             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">Etapa {service.step}</span>
                             {service.status === 'acquired' && <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--accent-start)]">Ativo</span>}
                          </div>

                          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 leading-tight group-hover:text-[var(--accent-start)] transition-colors text-left">
                             {service.title}
                          </h3>
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-8 flex-grow text-left">
                             {service.description}
                          </p>

                          {service.status !== 'locked' ? (
                             <Link href={service.ctaUrl || "#"} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[var(--accent-start)] group-hover:gap-4 transition-all">
                                {service.status === 'acquired' ? 'Acessar Área Member' : 'Ver Detalhes'}
                                <ChevronRight size={14} />
                             </Link>
                          ) : (
                             <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-50">
                                Próxima Etapa
                                <Lock size={14} />
                             </div>
                          )}
                       </div>
                    </motion.div>
                 ))}
              </div>
           </div>
        </section>

        {/* 2. ULTIMOS CONTEÚDOS E FERRAMENTAS (GRID MISTO) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
           
           {/* Feed de Conteúdo Dinâmico ✨ */}
           <section className="space-y-8">
              <div className="flex items-center justify-between border-b border-[var(--border-primary)] pb-6">
                 <h3 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                    <Briefcase size={22} className="text-[var(--accent-start)]" /> Últimos Conteúdos
                 </h3>
                 <Link href="/conteudo" className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex items-center gap-2 group">
                    Ver Todos <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                 </Link>
              </div>

              <div className="space-y-4">
                 {isLoadingPosts ? (
                    Array.from({ length: 3 }).map((_, i) => (
                       <div key={i} className="h-24 bg-[var(--input-bg)] animate-pulse rounded-[1.5rem] border border-[var(--border-primary)]" />
                    ))
                 ) : latestPosts.length > 0 ? (
                    latestPosts.map((post) => (
                       <Link 
                         key={post.id}
                         href={post.url}
                         target="_blank"
                         className="p-5 block rounded-[1.5rem] bg-[var(--input-bg)] border border-[var(--input-border)] hover:bg-[var(--accent-soft)] hover:border-[var(--accent-start)] transition-all group"
                       >
                          <div className="flex items-start justify-between gap-4">
                             <div className="space-y-1 text-left">
                                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2 block">
                                   {getPlatformLabel(post.platform)}
                                </span>
                                <h4 className="text-sm font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-all leading-relaxed line-clamp-2">
                                   {post.title}
                                </h4>
                             </div>
                             <div className="shrink-0 p-3 bg-[var(--input-bg)] rounded-xl text-[var(--text-muted)] group-hover:text-[var(--accent-start)] transition-all">
                                <ExternalLink size={16} />
                             </div>
                          </div>
                       </Link>
                    ))
                 ) : (
                    <div className="py-12 px-6 border border-dashed border-[var(--border-primary)] rounded-[2rem] text-center">
                       <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-40">Novos conteúdos em breve</p>
                    </div>
                 )}
              </div>
           </section>

           {/* Laboratório de Ferramentas Preview */}
           <section className="space-y-8">
              <div className="flex items-center justify-between border-b border-[var(--border-primary)] pb-6">
                 <h3 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                    <Target size={22} className="text-[#667eea]" /> Ferramentas
                 </h3>
                 <Link href="/hub/ferramentas" className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex items-center gap-2 group">
                    Explorar Lab <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                 </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {MOCK_TOOLS.slice(0, 4).map((tool) => (
                    <Link 
                      key={tool.id}
                      href="/hub/ferramentas"
                      className="p-6 rounded-[2rem] bg-[var(--input-bg)] border border-[var(--input-border)] hover:bg-[#667eea]/5 hover:border-[#667eea]/20 transition-all group relative overflow-hidden h-full flex flex-col"
                    >
                       <div className="flex flex-col gap-4 relative z-10 flex-grow text-left">
                          <div className="p-3 bg-[var(--input-bg)] w-fit rounded-xl text-[var(--text-secondary)] group-hover:text-[var(--accent-end)] transition-colors">
                             <ToolPlaceholderIcon name={tool.icon} />
                          </div>
                          <h4 className="text-sm font-bold text-[var(--text-primary)] group-hover:translate-x-1 transition-transform">{tool.title}</h4>
                       </div>
                       <div className="mt-6 flex items-center justify-between text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]">
                          {tool.status === 'soon' ? 'Em Breve' : 'Disponível'}
                          <ChevronRight size={12} />
                       </div>
                    </Link>
                 ))}
              </div>
           </section>

        </div>

        {/* 3. SEÇÃO DE PESQUISAS INTERATIVAS */}
        <section className="py-24 relative rounded-[3rem] overflow-hidden">
           {/* Background Overlay */}
           <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-[var(--border-primary)] backdrop-blur-md -z-10" />
           <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--accent-start)] rounded-full blur-[120px] opacity-[0.03] translate-x-1/2 -translate-y-1/2" />
           
           <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
              <div className="space-y-4">
                 <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-soft)] text-[9px] font-black uppercase tracking-widest text-[var(--accent-start)] border border-[var(--accent-start)]/10">
                    <MessageSquare size={12} /> Pulso da Comunidade
                 </span>
                 <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.1]">
                    O hub evolui com a <span className="italic text-[var(--text-secondary)]">sua participação.</span>
                 </h3>
              </div>

              <div className="p-10 rounded-[3.5rem] bg-gradient-to-br from-[var(--input-bg)] to-transparent border border-[var(--border-primary)] text-center space-y-8 max-w-2xl mx-auto hover:border-[var(--accent-start)]/20 transition-all shadow-2xl backdrop-blur-xl relative group">
                 {/* Decorative Glow */}
                 <div className="absolute inset-0 bg-[var(--accent-start)]/5 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                 <div className="space-y-4 relative z-10">
                    <div className="w-16 h-16 bg-[var(--input-bg)] rounded-3xl border border-[var(--border-primary)] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                       <Zap size={28} className="text-[var(--accent-start)]" />
                    </div>
                    <p className="text-xl font-bold text-[var(--text-primary)] leading-tight">
                       O BPlen HUB está em <br /> <span className="text-[var(--accent-start)] italic">Evolução Constante.</span>
                    </p>
                    <p className="text-[10px] md:text-xs text-[var(--text-muted)] font-black uppercase tracking-[0.2em] max-w-xs mx-auto leading-relaxed">
                       No momento, não há enquetes abertas. Fique atento às notificações para participar das próximas decisões.
                    </p>
                 </div>

                 <div className="pt-6 relative z-10">
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-500">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                       Monitoramento Ativo
                    </div>
                 </div>
              </div>
           </div>
        </section>

      </main>

      {/* FOOTER DO HUB */}
      <footer className="w-full py-16 px-6 bg-[var(--bg-primary)] border-t border-[var(--border-primary)]">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="space-y-4 text-center md:text-left">
               <div className="text-xl font-bold tracking-tighter text-[var(--text-primary)]">
                  BPlen <span className="gradient-accent bg-clip-text text-transparent italic">HUB</span>
               </div>
               <p className="max-w-xs text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest leading-loose">
                  Sua plataforma de evolução profissional e estratégica corporativa.
               </p>
            </div>
            
            <div className="flex gap-12">
               <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)]">Ecossistema</h4>
                  <ul className="space-y-2">
                     <li><Link href="/hub/ferramentas" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all font-medium">Laboratório</Link></li>
                     <li><Link href="/servicos" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all font-medium">Próximos Passos</Link></li>
                  </ul>
               </div>
               <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)]">Suporte</h4>
                  <ul className="space-y-2">
                     <li><Link href="https://wa.me/5511945152088" target="_blank" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all font-medium">WhatsApp</Link></li>
                     <li><Link href="mailto:contato@bplen.com" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all font-medium">Email</Link></li>
                  </ul>
               </div>
            </div>
         </div>
         <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-[var(--border-primary)] flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-60">
            <span>© 2025 BPlen Consultoria. Todos os direitos reservados.</span>
            <div className="flex gap-8">
               <span>Privacidade</span>
               <span>Governança</span>
            </div>
         </div>
      </footer>

    </div>
  );
}

function ToolPlaceholderIcon({ name }: { name: string }) {
   if (name === "BarChart") return <BarChart size={20} />;
   if (name === "Target") return <Target size={20} />;
   return <Layout size={20} />;
}
