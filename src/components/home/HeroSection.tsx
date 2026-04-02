"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Calendar, Sparkles } from "lucide-react";

/**
 * HeroSection (Bloco da Home 🚀)
 * A majestosa entrada Dark Premium da nova Consultoria BPlen.
 */
export function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden px-6 text-center">
      
      {/* 🔮 Background Glow Elements (Aura Premium) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ff0080] rounded-full blur-[150px] opacity-[0.08] pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white rounded-full blur-[120px] opacity-[0.05] pointer-events-none -z-10" />


      {/* Mobile Top Right Hash (for small screens) */}
      <div className="absolute top-6 right-6 z-50 sm:hidden flex flex-col items-end gap-2">
         <Link href="/hub" className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-primary)] rounded px-2 py-1 transition-colors">HUB</Link>
      </div>

      {/* 🏔️ Content */}
      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        
        {/* Gigantic Clickable Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex justify-center"
        >
          <button 
            onClick={() => document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="group flex flex-col items-center justify-center text-center cursor-pointer transition-transform hover:scale-[1.02]"
            aria-label="Clique aqui para descomplicar o desenvolvimento humano no trabalho"
          >
            <span className="text-[var(--text-muted)] text-xs tracking-widest lowercase mb-1 group-hover:text-[var(--text-primary)] transition-colors">
              clique aqui para
            </span>
            <span className="text-white text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight block -mb-2 z-10">
              descomplicar o
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff0080] via-[#c026d3] to-[#7928ca] bg-[size:200%_auto] animate-gradient-flow text-5xl md:text-7xl lg:text-[6.5rem] font-black tracking-tighter leading-[0.85] z-20 pb-2">
              desenvolvimento
            </span>
            <span 
              className="text-transparent bg-clip-text bg-gradient-to-r from-[#c026d3] via-[#ff0080] to-[#7928ca] bg-[size:200%_auto] animate-gradient-flow text-5xl md:text-7xl lg:text-[6.5rem] font-black tracking-tighter leading-[0.85] -mt-1 md:-mt-3 z-30 pb-2"
              style={{ animationDelay: "2s" }}
            >
              humano
            </span>
            <span className="text-[var(--text-secondary)] text-xl md:text-2xl font-medium tracking-tight mt-1 group-hover:text-[var(--text-primary)] transition-colors">
              no trabalho
            </span>
          </button>
        </motion.div>
      </div>

    </section>
  );
}
