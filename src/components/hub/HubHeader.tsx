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
  X,
  LogOut,
  ShieldCheck
} from "lucide-react";
import { useTheme, BPlenTheme } from "@/context/ThemeContext";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

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
  const { user, nickname, logout } = useAuthContext();
  const router = useRouter();
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isSocialMenuOpen, setIsSocialMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const socialMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Fechar menus ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
      if (socialMenuRef.current && !socialMenuRef.current.contains(event.target as Node)) {
        setIsSocialMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isSubPage = pathname !== "/hub" && pathname !== "/admin";

  const socialLinks = [
    { icon: <img src="/linkedin.webp" alt="LinkedIn" className="w-5 h-5 object-contain" />, url: "https://www.linkedin.com/in/lisandralencina/", name: "LinkedIn" },
    { icon: <img src="/insta.png" alt="Instagram" className="w-5 h-5 object-contain" />, url: "https://www.instagram.com/lis_lencina", name: "Instagram" },
    { icon: <img src="/whatsapp.png" alt="WhatsApp" className="w-5 h-5 object-contain" />, url: "https://wa.me/5511945152088", name: "WhatsApp" },
    { icon: <img src="/tiktok.png" alt="TikTok" className="w-5 h-5 object-contain" />, url: "https://www.tiktok.com/@lis.lencina", name: "TikTok" },
  ];

  return (
    <header className="sticky top-0 z-[100] w-full px-6 py-4 flex items-center justify-between backdrop-blur-xl border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/80">
      
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
                  className="p-3 bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-2xl text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all hover:bg-[var(--accent-soft)] flex items-center gap-2 group"
                >
                  <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Voltar</span>
                </Link>
              </motion.div>
            )}
         </AnimatePresence>

         <Link href="/hub" className="text-lg font-bold tracking-tighter text-[var(--text-primary)]">
            BPlen <span className="gradient-accent bg-clip-text text-transparent italic text-lg">HUB</span>
         </Link>
      </div>

      {/* Direita: Ações & Temas */}
      <div className="flex items-center gap-2 md:gap-3">
         
         {/* Seletor de Temas (Dropdown) */}
         <div className="relative" ref={themeMenuRef}>
            <button 
              onClick={() => {
                setIsThemeMenuOpen(!isThemeMenuOpen);
                setIsSocialMenuOpen(false);
              }}
              className={`p-3 rounded-2xl transition-all border flex items-center justify-center
                ${isThemeMenuOpen 
                  ? "bg-[var(--accent-soft)] border-[var(--accent-start)] text-[var(--accent-start)] shadow-[0_0_20px_rgba(var(--accent-start-rgb),0.1)]" 
                  : "bg-[var(--input-bg)] border-[var(--border-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-soft)]"}`}
              title="Temas"
            >
               <Palette size={18} />
            </button>

            <AnimatePresence>
               {isThemeMenuOpen && (
                 <motion.div 
                   initial={{ opacity: 0, y: 8, scale: 0.95 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0, y: 8, scale: 0.95 }}
                   className="absolute top-16 right-0 p-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl shadow-2xl w-64 backdrop-blur-[var(--glass-blur)] z-[200] overflow-hidden"
                 >
                    <div className="space-y-1">
                       <p className="px-3 py-2 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Imersão</p>
                       {THEMES.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => {
                              setTheme(opt.id);
                              setIsThemeMenuOpen(false);
                            }}
                            className={`w-full p-2.5 rounded-2xl flex items-center justify-between transition-all group
                              ${theme === opt.id ? "bg-[var(--accent-start)]/20 text-[var(--accent-start)]" : "text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)]"}`}
                          >
                             <div className="flex items-center gap-3">
                                <div 
                                  className="w-4 h-4 rounded-full border border-[var(--border-primary)] shadow-sm"
                                  style={{ backgroundColor: opt.color }}
                                />
                                <span className={`text-[11px] font-bold ${theme === opt.id ? "text-[var(--accent-start)]" : "text-[var(--text-secondary)]"}`}>
                                   {opt.label}
                                </span>
                             </div>
                             {theme === opt.id && <Check size={12} className="text-[var(--accent-start)]" />}
                          </button>
                       ))}
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>
         </div>

         {/* Menu Social Sanduíche (Dropdown) */}
         <div className="relative" ref={socialMenuRef}>
            <button 
              onClick={() => {
                setIsSocialMenuOpen(!isSocialMenuOpen);
                setIsThemeMenuOpen(false);
              }}
              className={`p-3 rounded-2xl transition-all border flex items-center justify-center
                ${isSocialMenuOpen 
                  ? "bg-[var(--accent-soft)] border-[var(--accent-start)] text-[var(--accent-start)] shadow-[0_0_20px_rgba(var(--accent-start-rgb),0.1)]" 
                  : "bg-[var(--input-bg)] border-[var(--border-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-soft)]"}`}
              title="Redes Sociais"
            >
               <Menu size={18} />
            </button>

            <AnimatePresence>
               {isSocialMenuOpen && (
                 <motion.div 
                   initial={{ opacity: 0, y: 8, scale: 0.95 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0, y: 8, scale: 0.95 }}
                   className="absolute top-16 right-0 p-5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl shadow-2xl w-56 backdrop-blur-[var(--glass-blur)] z-[200]"
                 >
                    <div className="space-y-6">
                       
                       {/* Status de Conexão */}
                       <div className="flex items-center gap-2 py-1 px-2 bg-[var(--accent-start)]/5 rounded-lg border border-[var(--accent-start)]/5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-soft" />
                          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--accent-start)]">Sincronizado</span>
                       </div>

                       {/* Identidade do Usuário */}
                       <div className="space-y-1.5 px-1">
                          <p className="text-[11px] font-black tracking-tight text-[var(--text-primary)] leading-tight uppercase truncate">
                             {user?.displayName || "Membro BPlen"}
                          </p>
                          <div className="flex flex-col gap-0.5">
                             <p className="text-[10px] font-bold text-[var(--accent-start)] italic">
                                @{nickname || "user"}
                             </p>
                             <p className="text-[8px] font-bold text-[var(--text-muted)] opacity-60 truncate">
                                {user?.email}
                             </p>
                          </div>
                       </div>

                       {/* Links Principais do Usuário */}
                       <div className="space-y-1">
                          <Link 
                            href="/hub/membro"
                            onClick={() => setIsSocialMenuOpen(false)}
                            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-[var(--accent-soft)]/50 border border-[var(--accent-start)]/20 text-[var(--accent-start)] hover:bg-[var(--accent-soft)] transition-all group"
                          >
                             <ShieldCheck size={16} />
                             <span className="text-[10px] font-black uppercase tracking-widest">Área de Membro</span>
                          </Link>

                          <button 
                            onClick={async () => {
                              setIsLoggingOut(true);
                              await logout();
                              router.push("/");
                            }}
                            disabled={isLoggingOut}
                            className="w-full flex items-center gap-3 p-3 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all group border border-transparent hover:border-red-500/10"
                          >
                             <LogOut size={16} className={isLoggingOut ? "animate-pulse" : ""} />
                             <span className="text-[10px] font-black uppercase tracking-widest">{isLoggingOut ? "Saindo..." : "Sair"}</span>
                          </button>
                       </div>

                       <div className="h-px bg-[var(--border-primary)] opacity-40" />

                       <div className="space-y-3">
                          <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] text-center">Conexão Digital</p>
                          <div className="grid grid-cols-2 gap-2">
                             {socialLinks.map((social, i) => (
                               <Link
                                 key={i}
                                 href={social.url}
                                 target="_blank"
                                 className="p-3 bg-[var(--social-bg)] border border-[var(--border-primary)] rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-start)]/30 hover:bg-[var(--accent-soft)] transition-all flex items-center justify-center group"
                                 title={social.name}
                               >
                                  <div className="scale-90 group-hover:scale-100 transition-transform">
                                     {social.icon}
                                  </div>
                               </Link>
                             ))}
                          </div>
                       </div>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>
    </header>
  );
}
