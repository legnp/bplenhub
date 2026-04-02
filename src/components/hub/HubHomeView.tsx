"use client";

import React, { useState } from "react";
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
  Briefcase
} from "lucide-react";
import { MOCK_SERVICES, MOCK_CONTENTS, MOCK_TOOLS, MOCK_SURVEYS } from "@/config/hub-data";
import { useTheme } from "@/context/ThemeContext";

/**
 * HUB HOME VIEW — O Coração da Experiência Privada 🧬
 * Estruturada como uma jornada de desenvolvimento.
 */

export function HubHomeView() {
  return (
    <div className="w-full flex flex-col min-h-screen relative font-sans">
      
      {/* 🔮 CONTEÚDO PRINCIPAL DO HUB */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 md:py-20 space-y-32">
        
        {/* 1. SEÇÃO JORNADA (VITRINE DE SERVIÇOS) */}
        <section className="space-y-12">
           <div className="space-y-4 max-w-2xl">
              <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent-start">
                 <Rocket size={14} /> Sua Evolução BPlen
              </span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
                 Como está sua <span className="text-secondary italic">Jornada BPlen?</span>
              </h2>
              <p className="text-secondary text-sm md:text-base leading-relaxed">
                 O hub organiza sua evolução com clareza. Veja como você já avançou 
                 e descubra os próximos passos ideais para o seu sucesso.
              </p>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Timeline de Serviços */}
              <div className="lg:col-span-12 relative flex flex-col md:flex-row gap-8 py-12">
                 {/* Linha de Progresso Sutil (Desktop) */}
                 <div className="absolute top-[4.5rem] left-0 w-full h-px bg-white/5 hidden md:block" />
                 
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
                             ${service.status === 'acquired' ? 'bg-accent-start border-accent-start shadow-[0_0_20px_rgba(255,44,141,0.4)]' : 
                               service.status === 'available' ? 'bg-white/5 border-white/15 group-hover:border-accent-start/50' : 'bg-transparent border-white/10'}`}>
                             {service.status === 'acquired' ? <CheckCircle2 size={24} className="text-white" /> : 
                              service.status === 'available' ? <Sparkles size={18} className="text-secondary" /> : <Lock size={18} className="text-gray-700" />}
                          </div>
                       </div>

                       {/* Service Card Card */}
                       <div className={`p-8 rounded-[2.5rem] border backdrop-blur-2xl transition-all duration-500 h-full flex flex-col
                        ${service.status === 'acquired' ? 'bg-white/[0.04] border-white/10' : 
                          service.status === 'available' ? 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05]' : 'bg-transparent border-white/5 opacity-40 grayscale pointer-events-none'}`}>
                          
                          <div className="mb-6 flex justify-between items-start">
                             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-secondary">Etapa {service.step}</span>
                             {service.status === 'acquired' && <span className="text-[9px] font-black uppercase tracking-[0.2em] text-accent-start">Ativo</span>}
                          </div>

                          <h3 className="text-xl font-bold text-foreground mb-3 leading-tight group-hover:text-accent-start transition-colors">
                             {service.title}
                          </h3>
                          <p className="text-xs text-secondary leading-relaxed mb-8 flex-grow">
                             {service.description}
                          </p>

                          {service.status !== 'locked' ? (
                             <Link href={service.ctaUrl || "#"} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-accent-start group-hover:gap-4 transition-all">
                                {service.status === 'acquired' ? 'Acessar Área Member' : 'Ver Detalhes'}
                                <ChevronRight size={14} />
                             </Link>
                          ) : (
                             <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-secondary opacity-50">
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
           
           {/* Feed de Conteúdo Preview */}
           <section className="space-y-8">
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                 <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
                    <Briefcase size={22} className="text-accent-start" /> Últimos Conteúdos
                 </h3>
                 <Link href="/conteudo" className="text-[10px] font-black uppercase tracking-widest text-secondary hover:text-foreground transition-all flex items-center gap-2 group">
                    Ver Todos <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                 </Link>
              </div>

              <div className="space-y-4">
                 {MOCK_CONTENTS.map((content) => (
                    <Link 
                      key={content.id}
                      href="/conteudo"
                      className="p-5 block rounded-[1.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all group"
                    >
                       <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                             <span className="text-[9px] font-black uppercase tracking-widest text-secondary mb-2 block">{content.source}</span>
                             <h4 className="text-sm font-bold text-secondary group-hover:text-foreground transition-all leading-relaxed">
                                {content.title}
                             </h4>
                          </div>
                          <div className="shrink-0 p-3 bg-white/5 rounded-xl text-gray-600 group-hover:text-accent-start transition-all">
                             <ExternalLink size={16} />
                          </div>
                       </div>
                    </Link>
                 ))}
              </div>
           </section>

           {/* Laboratório de Ferramentas Preview */}
           <section className="space-y-8">
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                 <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
                    <Target size={22} className="text-[#667eea]" /> Ferramentas
                 </h3>
                 <Link href="/hub/ferramentas" className="text-[10px] font-black uppercase tracking-widest text-secondary hover:text-foreground transition-all flex items-center gap-2 group">
                    Explorar Lab <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                 </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {MOCK_TOOLS.slice(0, 4).map((tool) => (
                    <Link 
                      key={tool.id}
                      href="/hub/ferramentas"
                      className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-[#667eea]/5 hover:border-[#667eea]/20 transition-all group relative overflow-hidden h-full flex flex-col"
                    >
                       <div className="flex flex-col gap-4 relative z-10 flex-grow">
                          <div className="p-3 bg-white/5 w-fit rounded-xl text-secondary group-hover:text-[#667eea] transition-colors">
                             <ToolPlaceholderIcon name={tool.icon} />
                          </div>
                          <h4 className="text-sm font-bold text-foreground group-hover:translate-x-1 transition-transform">{tool.title}</h4>
                       </div>
                       <div className="mt-6 flex items-center justify-between text-[8px] font-black uppercase tracking-[0.2em] text-gray-600 group-hover:text-secondary">
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
           <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/5 backdrop-blur-md -z-10" />
           <div className="absolute top-0 right-0 w-80 h-80 bg-accent-start rounded-full blur-[120px] opacity-[0.03] translate-x-1/2 -translate-y-1/2" />
           
           <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
              <div className="space-y-4">
                 <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-start/10 text-[9px] font-black uppercase tracking-widest text-accent-start border border-accent-start/10">
                    <MessageSquare size={12} /> Pulso da Comunidade
                 </span>
                 <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-[1.1]">
                    O hub evolui com a <span className="italic text-secondary">sua participação.</span>
                 </h3>
              </div>

              <div className="p-10 rounded-[2.5rem] bg-black/5 border border-white/10 text-left space-y-8 max-w-2xl mx-auto hover:border-accent-start/30 transition-all shadow-2xl backdrop-blur-xl">
                 <p className="text-lg font-bold text-foreground leading-relaxed">
                    {MOCK_SURVEYS[0].question}
                 </p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {MOCK_SURVEYS[0].options.map((opt) => (
                       <button 
                         key={opt.id}
                         className="p-4 bg-white/5 text-left rounded-2xl text-xs font-bold text-secondary border border-white/10 hover:bg-accent-start hover:text-white hover:border-accent-start transition-all"
                       >
                          {opt.label}
                       </button>
                    ))}
                 </div>
              </div>
           </div>
        </section>

      </main>

      {/* FOOTER DO HUB */}
      <footer className="w-full py-16 px-6 bg-black/40 border-t border-white/5">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="space-y-4 text-center md:text-left">
               <div className="text-xl font-bold tracking-tighter text-foreground">
                  BPlen <span className="gradient-accent bg-clip-text text-transparent italic">HUB</span>
               </div>
               <p className="max-w-xs text-[10px] text-secondary font-bold uppercase tracking-widest leading-loose">
                  Sua plataforma de evolução profissional e estratégica corporativa.
               </p>
            </div>
            
            <div className="flex gap-12">
               <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">Ecossistema</h4>
                  <ul className="space-y-2">
                     <li><Link href="/hub/ferramentas" className="text-xs text-secondary hover:text-foreground transition-all font-medium">Laboratório</Link></li>
                     <li><Link href="/servicos" className="text-xs text-secondary hover:text-foreground transition-all font-medium">Próximos Passos</Link></li>
                  </ul>
               </div>
               <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">Suporte</h4>
                  <ul className="space-y-2">
                     <li><Link href="https://wa.me/5511945152088" target="_blank" className="text-xs text-secondary hover:text-foreground transition-all font-medium">WhatsApp</Link></li>
                     <li><Link href="mailto:contato@bplen.com" className="text-xs text-secondary hover:text-foreground transition-all font-medium">Email</Link></li>
                  </ul>
               </div>
            </div>
         </div>
         <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-black uppercase tracking-widest text-secondary opacity-60">
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

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
    >
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
    >
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.6-4.12-1.31a8.707 8.707 0 0 1-1.87-1.42v10.37a7.51 7.51 0 1 1-7.51-7.51c.03.01.06 0 .09.01v4.03c-1.23-.39-2.6-.13-3.63.63-1.09.81-1.63 2.15-1.43 3.49.2 1.34 1.25 2.45 2.57 2.77.82.3 2.03.11 2.71-.35 1.05-.72 1.62-2 1.64-3.23.01-1.93 0-3.87 0-5.8 0-4.15 0-8.3 0-12.45z"/>
    </svg>
  );
}
