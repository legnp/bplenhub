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
      className="fixed top-8 right-8 flex flex-col items-end gap-3 z-[100] hidden sm:flex"
    >
      <button 
        onClick={() => document.getElementById('servicos')?.scrollIntoView({ behavior: 'smooth' })}
        className="w-[170px] h-10 px-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-xl text-xs font-normal tracking-wide text-gray-400 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all flex items-center justify-center shadow-lg cursor-pointer"
      >
        Nossos Serviços
      </button>
      <Link 
        href="/agendar"
        className="w-[170px] h-10 px-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-xl text-xs font-normal tracking-wide text-gray-400 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all flex items-center justify-center shadow-lg cursor-pointer"
      >
        Agendar Conversa
      </Link>
      <Link 
        href="/hub"
        className="w-[170px] h-10 px-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-xl text-xs font-normal tracking-wide text-gray-400 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all flex items-center justify-center shadow-lg cursor-pointer"
      >
        Acessar BPlen HUB
      </Link>
    </motion.div>
  );
}
