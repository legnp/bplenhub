import React from "react";
import { ShieldCheck, ArrowRight, Zap, Briefcase, Lock } from "lucide-react";
import { Product } from "@/types/products";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MemberAreaViewProps {
  products: (Product & { isUnlocked: boolean })[];
}

/**
 * MEMBER AREA VIEW — O Conteúdo Real da Área de Membro 🏗️
 * Apresentado apenas após autorização soberana do servidor.
 */
export function MemberAreaView({ products }: MemberAreaViewProps) {
  
  if (products.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-6 py-20 min-h-[70vh] flex flex-col items-center justify-center text-center space-y-8 animate-fade-in">
        <div className="p-8 rounded-[3rem] bg-white/5 border border-white/10 opacity-30">
          <Briefcase size={64} className="text-gray-500" />
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)] uppercase italic">
            Nenhum Serviço <span className="text-[var(--accent-start)]">Ativo</span>
          </h1>
          <p className="text-sm font-medium text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
            Você ainda não possui serviços contratados ou o seu acesso está sendo processado. 
            Visite nossa vitrine para descobrir as melhores soluções para sua jornada.
          </p>
        </div>
        <Link 
          href="/servicos/people" 
          className="px-10 py-5 bg-white text-black rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl"
        >
          Explorar Serviços
        </Link>
      </div>
    );
  }

  const unlockedCount = products.filter(p => p.isUnlocked).length;

  return (
    <div className="w-full max-w-7xl mx-auto px-6 pt-[10px] pb-12 space-y-12 animate-fade-in">
      
      {/* 🧭 Header do Dashboard */}
      <div className="space-y-2">
         <h1 className="text-4xl font-black tracking-tighter uppercase italic">
            Meus <span className="text-[var(--accent-start)]">Serviços</span>
         </h1>
         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Ecossistema BPlen Ativo — {unlockedCount} itens desbloqueados
         </p>
      </div>

      {/* 📦 Grid de Cards de Serviço */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {products.map((product) => (
            <Link 
              key={product.id} 
              href={product.isUnlocked ? `/hub/servicos/${product.slug}` : `/servicos/${product.slug}`}
              className={!product.isUnlocked ? "cursor-pointer" : ""}
            >
               <div className={cn(
                 "group relative p-8 rounded-[2.5rem] border transition-all duration-500 hover:-translate-y-2 overflow-hidden h-full flex flex-col justify-between",
                 product.isUnlocked 
                   ? "bg-white/5 border-white/10 hover:border-[var(--accent-start)]/30 hover:bg-white/[0.08]" 
                   : "bg-white/[0.02] border-white/5 grayscale-[0.6] opacity-80 hover:grayscale-0 hover:opacity-100"
               )}>
                  {/* Background Accents */}
                  {product.isUnlocked && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-start)] rounded-full blur-[60px] opacity-0 group-hover:opacity-5 transition-opacity" />
                  )}
                  
                  <div className="space-y-4">
                     <div className={cn(
                       "w-12 h-12 rounded-2xl flex items-center justify-center p-3 transition-colors",
                       product.isUnlocked ? "bg-[var(--accent-start)]/10 text-[var(--accent-start)]" : "bg-white/5 text-gray-500"
                     )}>
                        {product.isUnlocked ? <Zap size={24} /> : <Lock size={20} />}
                     </div>
                     <div className="space-y-1">
                        <h3 className={cn(
                          "text-lg font-black tracking-tight uppercase leading-none transition-colors",
                          product.isUnlocked ? "group-hover:text-[var(--accent-start)]" : "text-gray-400"
                        )}>
                           {product.title}
                        </h3>
                        {product.isUnlocked ? (
                          <p className="text-[9px] font-black italic uppercase tracking-widest text-[var(--text-muted)] opacity-60">
                             Code: {product.serviceCode}
                          </p>
                        ) : (
                          <p className="text-[9px] font-black uppercase tracking-widest text-[var(--accent-start)] opacity-80">
                             Premium Access
                          </p>
                        )}
                     </div>
                     <p className="text-[11px] font-medium text-[var(--text-muted)] line-clamp-3 leading-relaxed">
                        {product.sheet.description}
                     </p>
                  </div>

                  <div className="pt-8 flex items-center justify-between">
                     <div className="flex -space-x-2">
                        {product.isUnlocked && product.capabilities.surveys.length > 0 && (
                           <div className="w-6 h-6 rounded-full bg-white/10 border border-[var(--bg-primary)] flex items-center justify-center" title="Pesquisas inclusas">
                              <ShieldCheck size={10} className="text-emerald-500" />
                           </div>
                        )}
                     </div>
                     <div className={cn(
                       "flex items-center gap-2 transition-all",
                       product.isUnlocked ? "text-[var(--accent-start)]" : "text-white/40 group-hover:text-white"
                     )}>
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                          {product.isUnlocked ? "Acessar Portal" : "Contratar Agora"}
                        </span>
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                     </div>
                  </div>
               </div>
            </Link>
         ))}
      </div>
    </div>
  );
}
