import React from "react";
import { Metadata } from "next";
import { 
  Wrench, 
  Lock, 
  ArrowRight, 
  Zap, 
  Target, 
  BarChart3, 
  Layout, 
  ShieldCheck 
} from "lucide-react";
import Link from "next/link";
import { MOCK_TOOLS } from "@/config/hub-data";

export const metadata: Metadata = {
  title: "Ferramentas & Análises | BPlen HUB",
  description: "Acesse utilitários e mapeamentos comportamentais exclusivos.",
};

export function ToolIcon({ icon, className }: { icon: string; className?: string }) {
  switch (icon) {
    case "BarChart": return <BarChart3 className={className} />;
    case "Target": return <Target className={className} />;
    case "Layout": return <Layout className={className} />;
    case "ShieldCheck": return <ShieldCheck className={className} />;
    default: return <Wrench className={className} />;
  }
}

export default function HubToolsPage() {
  return (
    <div className="pt-[10px] px-8 pb-8 space-y-12 animate-fade-in-up">
      
      {/* Header Seção */}
      <div className="space-y-4 max-w-2xl">
        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-accent-start">Ecossistema BPlen</span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
          Laboratório de <span className="text-secondary">Ferramentas.</span>
        </h1>
        <p className="text-secondary text-sm md:text-base leading-relaxed">
          Explore utilitários, automações e mapeamentos comportamentais desenhados para 
          dar clareza à sua evolução profissional.
        </p>
      </div>

      {/* Grid de Ferramentas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MOCK_TOOLS.map((tool) => (
          <div 
            key={tool.id} 
            className="group glass relative p-8 rounded-[2.5rem] flex flex-col h-full hover:bg-white/[0.05] transition-all duration-500 overflow-hidden"
          >
            {/* Background elements */}
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[80px] opacity-[0.05] pointer-events-none
              ${tool.status === 'soon' ? 'bg-gray-500' : 'bg-accent-start'}`} 
            />
            
            <div className="relative z-10 flex flex-col h-full">
               {/* Icon & Status */}
               <div className="flex justify-between items-start mb-10">
                 <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-accent-soft group-hover:text-accent-start transition-all">
                   <ToolIcon icon={tool.icon} className="w-8 h-8" />
                 </div>
                 {tool.isMemberOnly && (
                   <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-secondary">
                     <Lock size={10} /> Membros
                   </span>
                 )}
               </div>

               {/* Info */}
               <div className="space-y-3 flex-grow mb-10">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-secondary opacity-60">
                   {tool.category}
                 </span>
                 <h3 className="text-2xl font-bold text-foreground group-hover:text-accent-start transition-colors leading-tight">
                   {tool.title}
                 </h3>
                 <p className="text-sm text-secondary leading-relaxed font-medium">
                   {tool.description}
                 </p>
               </div>

               {/* Action Buttons */}
               <div className="pt-6 border-t border-white/5">
                 {tool.status === "soon" ? (
                   <button disabled className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 flex items-center justify-center gap-2 cursor-not-allowed">
                      <Zap size={14} /> Em breve no HUB
                   </button>
                 ) : (
                   <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-foreground hover:bg-accent-start hover:border-accent-start hover:text-white transition-all flex items-center justify-center gap-3">
                      Acessar Ferramenta <ArrowRight size={14} />
                   </button>
                 )}
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sugestão de Ferramenta CTA */}
      <div className="p-12 rounded-[3rem] bg-gradient-to-r from-accent-soft/20 to-transparent border border-white/10 flex flex-col md:flex-row items-center justify-between gap-12 mt-20">
         <div className="space-y-4 max-w-lg">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Sentindo falta de algo?</h2>
            <p className="text-secondary text-sm leading-relaxed">
               Nossa equipe de DHO e tecnologia está sempre buscando novas formas de automatizar 
               análises e processos. Sugira uma ferramenta para o HUB.
            </p>
         </div>
         <Link 
            href="/hub/agendar-feedback" 
            className="px-8 py-5 bg-foreground text-background font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all text-center rounded-2xl"
         >
            Enviar Sugestão
         </Link>
      </div>
    </div>
  );
}
