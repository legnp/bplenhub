"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

/**
 * FloatingCTAs — Menu lateral fixo (Top Right)
 * Mantém os CTAs principais visíveis durante todo o scroll.
 */
export function FloatingCTAs() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
      className="fixed bottom-6 right-6 md:top-8 md:right-8 md:bottom-auto flex flex-col items-end gap-2 md:gap-3 z-[100]"
    >
      <button 
        onClick={() => document.getElementById('servicos')?.scrollIntoView({ behavior: 'smooth' })}
        className="w-[140px] md:w-[170px] h-9 md:h-10 px-3 md:px-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-xl text-[10px] md:text-xs font-normal tracking-wide text-gray-400 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all flex items-center justify-center shadow-lg cursor-pointer"
      >
        Nossos Serviços
      </button>
      <Link 
        href="/agendar"
        className="w-[140px] md:w-[170px] h-9 md:h-10 px-3 md:px-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-xl text-[10px] md:text-xs font-normal tracking-wide text-gray-400 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all flex items-center justify-center shadow-lg cursor-pointer"
      >
        Agendar Conversa
      </Link>
      <Link 
        href="/hub"
        className="w-[140px] md:w-[170px] h-9 md:h-10 px-3 md:px-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-xl text-[10px] md:text-xs font-normal tracking-wide text-gray-400 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all flex items-center justify-center shadow-lg cursor-pointer"
      >
        Acessar BPlen HUB
      </Link>
    </motion.div>
  );
}
