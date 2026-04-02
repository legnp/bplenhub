"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, 
  Sun, 
  Moon,
  ArrowLeft
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export function HubHeader() {
  const { theme, setTheme } = useTheme();
  const [isSocialMenuOpen, setIsSocialMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isSubPage = pathname !== "/hub" && pathname !== "/admin";

  return (
    <header className="sticky top-0 z-[100] w-full px-6 py-4 flex items-center justify-between backdrop-blur-xl border-b border-white/5 bg-black/40">
      <div className="flex items-center gap-4">
         {/* Botão Voltar (Apenas em Subpáginas) */}
         <AnimatePresence>
            {isSubPage && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <Link 
                  href={pathname.startsWith("/admin") ? "/admin" : "/hub"} 
                  className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all hover:bg-white/10 flex items-center gap-2 group"
                >
                  <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Voltar</span>
                </Link>
              </motion.div>
            )}
         </AnimatePresence>

         {/* Botão Redes Sociais (Sanduíche) */}
         <div className="relative">
            <button 
              onClick={() => setIsSocialMenuOpen(!isSocialMenuOpen)}
              className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all hover:bg-white/10"
            >
              <Menu size={20} />
            </button>
            
            <AnimatePresence>
              {isSocialMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute top-16 left-0 p-4 bg-black border border-white/10 rounded-3xl shadow-2xl w-48 z-[200] overflow-hidden"
                >
                   <div className="flex flex-col gap-2">
                      <Link href="/conteudo" className="p-3 rounded-xl hover:bg-white/5 text-xs font-bold text-gray-400 hover:text-white transition-all flex items-center gap-3">
                         <LinkedinIcon className="w-4 h-4" /> LinkedIn
                      </Link>
                      <Link href="/conteudo" className="p-3 rounded-xl hover:bg-white/5 text-xs font-bold text-gray-400 hover:text-white transition-all flex items-center gap-3">
                         <InstagramIcon className="w-4 h-4" /> Instagram
                      </Link>
                      <Link href="/conteudo" className="p-3 rounded-xl hover:bg-white/5 text-xs font-bold text-gray-400 hover:text-white transition-all flex items-center gap-3">
                         <TikTokIcon className="w-4 h-4" /> TikTok
                      </Link>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
         </div>

         <Link href="/hub" className="text-lg font-bold tracking-tighter text-white">
            BPlen <span className="gradient-accent bg-clip-text text-transparent italic text-lg">HUB</span>
         </Link>
      </div>

      <div className="flex items-center gap-4">
         {/* Alternância de Tema */}
         <button 
           onClick={toggleTheme}
           className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all hover:bg-white/10"
           title="Alternar Tema"
         >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
         </button>

         <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Sincronizado
         </div>
      </div>
    </header>
  );
}

// Icons (Deduplicated or kept local for safety)
function LinkedinIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>;
}

function InstagramIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>;
}

function TikTokIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.6-4.12-1.31a8.707 8.707 0 0 1-1.87-1.42v10.37a7.51 7.51 0 1 1-7.51-7.51c.03.01.06 0 .09.01v4.03c-1.23-.39-2.6-.13-3.63.63-1.09.81-1.63 2.15-1.43 3.49.2 1.34 1.25 2.45 2.57 2.77.82.3 2.03.11 2.71-.35 1.05-.72 1.62-2 1.64-3.23.01-1.93 0-3.87 0-5.8 0-4.15 0-8.3 0-12.45z"/></svg>;
}
