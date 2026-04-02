"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, 
  Palette,
  Check,
  ArrowLeft,
  X
} from "lucide-react";
import { useTheme, BPlenTheme } from "@/context/ThemeContext";

/**
 * HubHeader (Ecossistema Privado)
 * Cabeçalho compartilhado para Hub e Admin.
 * Inclui Seletor de Temas dinâmico e Navegação de Retorno.
 */

interface ThemeOption {
  id: BPlenTheme;
  label: string;
  color: string;
}

const THEMES: ThemeOption[] = [
  { id: "light", label: "Modo Claro", color: "#FFFFFF" },
  { id: "dark", label: "Modo BPlen", color: "#18181B" },
  { id: "rosa-pitaya", label: "Rosa Pitaya", color: "#FF0080" },
  { id: "lavanda-azulado", label: "Lavanda Azul", color: "#6366F1" },
  { id: "amarelo-sol", label: "Amarelo Sol", color: "#F59E0B" },
  { id: "cinza-nublado", label: "Cinza Profissional", color: "#64748B" },
  { id: "daltonico", label: "Alto Contraste", color: "#FBBF24" },
];

export function HubHeader() {
  const { theme, setTheme } = useTheme();
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Fechar menus ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isSubPage = pathname !== "/hub" && pathname !== "/admin";

  return (
    <header className="sticky top-0 z-[100] w-full px-6 py-4 flex items-center justify-between backdrop-blur-xl border-b border-white/5 bg-black/40">
      
      {/* Esquerda: Navegação & Logo */}
      <div className="flex items-center gap-4">
         <AnimatePresence mode="wait">
            {isSubPage && (
              <motion.div
                key="back-button"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <Link 
                  href={pathname.startsWith("/admin") ? "/admin" : "/hub"} 
                  className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all hover:bg-white/10 flex items-center gap-2 group"
                >
                  <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Voltar</span>
                </Link>
              </motion.div>
            )}
         </AnimatePresence>

         <Link href="/hub" className="text-lg font-bold tracking-tighter text-white">
            BPlen <span className="gradient-accent bg-clip-text text-transparent italic text-lg">HUB</span>
         </Link>
      </div>

      {/* Direita: Ações & Temas */}
      <div className="flex items-center gap-3">
         
         {/* Seletor de Temas (Dropdown) */}
         <div className="relative" ref={themeMenuRef}>
            <button 
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className={`p-3 rounded-2xl transition-all border flex items-center gap-2
                ${isThemeMenuOpen 
                  ? "bg-white/10 border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"}`}
              title="Personalizar Interface"
            >
               <Palette size={18} />
               <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Tema</span>
            </button>

            <AnimatePresence>
               {isThemeMenuOpen && (
                 <motion.div 
                   initial={{ opacity: 0, y: 12, scale: 0.95 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0, y: 12, scale: 0.95 }}
                   className="absolute top-16 right-0 p-3 bg-black/90 border border-white/10 rounded-3xl shadow-2xl w-64 backdrop-blur-2xl z-[200] overflow-hidden"
                 >
                    <div className="space-y-1">
                       <p className="px-3 py-2 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Escolha sua Imersão</p>
                       {THEMES.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => {
                              setTheme(opt.id);
                              setIsThemeMenuOpen(false);
                            }}
                            className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all group
                              ${theme === opt.id ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
                          >
                             <div className="flex items-center gap-3">
                                <div 
                                  className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                                  style={{ backgroundColor: opt.color }}
                                />
                                <span className={`text-xs font-bold ${theme === opt.id ? "text-white" : "text-gray-400"}`}>
                                   {opt.label}
                                </span>
                             </div>
                             {theme === opt.id && <Check size={14} className="text-accent-start" />}
                          </button>
                       ))}
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>
         </div>

         <div className="hidden lg:flex items-center gap-3 px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-soft" />
            Sincronizado
         </div>
      </div>
    </header>
  );
}
