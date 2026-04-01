"use client";

import React from "react";
import { motion } from "framer-motion";
import { PublicBookingFlow } from "@/components/ui/PublicBookingFlow";
import { LANDING_TOKENS } from "@/constants/landing-tokens";

/**
 * BookingSection (Seção de Agendamento Público)
 * Wrapper para o fluxo de agendamento na Landing Page.
 */
export function BookingSection() {
  return (
    <section id="agendar" className={`${LANDING_TOKENS.section} relative py-32`}>
      <div className={LANDING_TOKENS.container}>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Coluna de Texto: Branding & Contexto */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-[1.1]">
                Um passo para <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#667eea] to-[#764ba2]">
                  sua evolução.
                </span>
              </h2>
              <p className="text-gray-400 text-lg max-w-md leading-relaxed">
                Agende uma conversa estratégica de 30 minutos. Sem custos, sem compromisso, apenas foco no seu desenvolvimento.
              </p>
            </div>

            <div className="space-y-6">
              {[
                { title: "Diagnóstico Rápido", desc: "Entendemos seu cenário em 30 minutos." },
                { title: "Design Personalizado", desc: "Soluções desenhadas para sua realidade." },
                { title: "Execução BPlen", desc: "Foco total na entrega de resultados." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#667eea] mt-2.5 shrink-0" />
                  <div>
                    <h4 className="text-white font-bold text-sm uppercase tracking-widest">{item.title}</h4>
                    <p className="text-white/40 text-[11px] font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Coluna do Fluxo: O Motor de Agendamento */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <PublicBookingFlow />
          </motion.div>

        </div>

      </div>
    </section>
  );
}
