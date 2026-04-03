import React from "react";
import { Metadata } from "next";
import { 
  MessageSquareText, 
  Sparkles, 
  ArrowRight 
} from "lucide-react";
import { SocialFeedView } from "@/components/hub/SocialFeedView";
import { getSocialPosts } from "@/actions/social";
import { HomeFooter } from "@/components/home/HomeFooter";
import { FloatingCTAs } from "@/components/layout/FloatingCTAs";
import { SocialSidebar } from "@/components/layout/SocialSidebar";
import { ParticleNexus } from "@/components/home/ParticleNexus";
import { LANDING_TOKENS } from "@/constants/landing-tokens";

export const metadata: Metadata = {
  title: "Conteúdos | BPlen HUB",
  description: "Explore os últimos artigos, vídeos e reflexões da BPlen sobre Desenvolvimento Humano.",
};

export default async function ContentPage() {
  const posts = await getSocialPosts(true); // Apenas ativos
  
  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#1D1D1F] relative isolate overflow-x-hidden transition-colors duration-500">
      
      {/* Glows Decorativos (Suaves para modo claro) */}
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#ff0080] rounded-full blur-[180px] opacity-[0.03] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#667eea] rounded-full blur-[180px] opacity-[0.03] pointer-events-none -z-10" />

      {/* Hero Section (Light Mode) */}
      <section className="pt-32 pb-16 px-6">
        <div className={LANDING_TOKENS.container}>
          <div className="text-center mb-16 space-y-4">
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#ff0080]">Editorial BPlen</span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-black">
              Conexões de <span className="text-gray-400">Valor</span>
            </h1>
            <p className="max-w-2xl mx-auto text-gray-500 text-lg leading-relaxed">
              Um agregador de conhecimento para facilitar seu acesso aos nossos conteúdos 
              espalhados pelas redes e canais oficiais.
            </p>
          </div>
        </div>
      </section>

      {/* Content Explorer Container */}
      <section className="px-6 pb-24">
        <div className={LANDING_TOKENS.container}>
          <SocialFeedView posts={posts} />
        </div>
      </section>

      {/* Feedback / Survey Section (Mockup) */}
      <section className="py-24 px-6 bg-white border-t border-gray-100">
        <div className={LANDING_TOKENS.container}>
          <div className="max-w-4xl mx-auto p-12 rounded-[3rem] bg-gray-50 border border-gray-100 flex flex-col md:flex-row items-center gap-12">
            <div className="space-y-6 text-center md:text-left flex-grow">
              <div className="flex items-center justify-center md:justify-start gap-2 text-[#ff0080] font-bold text-xs uppercase tracking-widest">
                <Sparkles size={16} />
                Sua Opinião Importa
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-black tracking-tight">
                O que você gostaria de <br /> ver por aqui?
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                Estamos sempre evoluindo nosso ecossistema de conteúdo. 
                Deixe seu feedback para nos ajudar a priorizar novos temas.
              </p>
            </div>
            
            <div className="w-full md:max-w-xs space-y-4">
              <button className="w-full py-4 px-6 rounded-2xl bg-white border border-gray-200 text-black font-bold text-xs tracking-widest uppercase hover:border-[#ff0080] transition-all flex items-center justify-between group">
                Avaliar Conteúdos <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full py-4 px-6 rounded-2xl bg-black text-white font-bold text-xs tracking-widest uppercase hover:scale-[1.02] transition-all flex items-center justify-between group">
                Sugerir Temas <MessageSquareText size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Elementos Institucionais (Ajustados para o fundo claro do rodapé ou mantendo o dark original) */}
      <div className="bg-black text-white pt-2">
         <HomeFooter />
      </div>

      {/* 🏙️ Elementos de Interface */}
      <FloatingCTAs />
      <SocialSidebar />
      <ParticleNexus />
      
    </main>
  );
}
