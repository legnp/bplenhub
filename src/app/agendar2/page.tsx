"use client";

import React, { useEffect } from "react";
import Script from "next/script";
import { ParticleNexus } from "@/components/home/ParticleNexus";

/**
 * Agendar2Page (Página de Teste para Integração Calendly 🎫)
 * Implementação do widget de selo (badge) do Calendly para teste de UX.
 */
export default function Agendar2Page() {
  
  // Função para inicializar o widget manualmente caso necessário (ex: navegação client-side)
  const initCalendly = () => {
    // @ts-ignore
    if (window.Calendly) {
      // @ts-ignore
      window.Calendly.initBadgeWidget({
        url: 'https://calendly.com/lisandra-lencina-bplen/30min?hide_event_type_details=1&hide_gdpr_banner=1&background_color=1a1a1a&text_color=f5f5f5&primary_color=d716ae',
        text: 'Agende sua conversa!',
        color: '#c90fdb',
        textColor: '#ffffff',
        branding: true
      });
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden theme-dark font-sans">
      
      {/* 🌌 Background Dinâmico (Mantendo o padrão visual BPlen) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#667eea15,transparent_50%)]" />

      {/* Importação do CSS do Calendly */}
      <link 
        href="https://assets.calendly.com/assets/external/widget.css" 
        rel="stylesheet" 
      />

      <div className="z-10 w-full max-w-4xl py-20">
         <div className="text-center mb-12 space-y-4 px-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-r from-white via-white to-white/30 bg-clip-text text-transparent leading-[1.1]">
              Teste de <br className="md:hidden" /> Agendamento Externo
            </h1>
            <p className="text-gray-400 font-medium max-w-lg mx-auto text-sm md:text-base leading-relaxed">
              Estamos testando a integração direta com o Calendly através do selo flutuante no canto inferior.
            </p>
            <div className="pt-8">
              <div className="inline-block px-6 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-pink-400 font-semibold animate-pulse">
                Olhe para o canto inferior direito ↘️
              </div>
            </div>
         </div>

         <div className="mt-20 text-center opacity-50">
            <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.3em]">Ambiente de Teste — Sandbox BPlen</p>
         </div>
      </div>

      {/* 🔮 Efeito Visual de Partículas */}
      <ParticleNexus />

      {/* 📜 Script do Calendly */}
      <Script 
        src="https://assets.calendly.com/assets/external/widget.js" 
        strategy="lazyOnload"
        onLoad={initCalendly}
      />
    </main>
  );
}
