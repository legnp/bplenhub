"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuthContext } from "@/context/AuthContext";
import { redirect } from "next/navigation";
import { useTheme, BPlenTheme } from "@/context/ThemeContext";
import { FloatingSupport } from "@/components/layout/FloatingSupport";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Settings, 
  FileText, 
  Briefcase, 
  Users, 
  ArrowLeft,
  LayoutDashboard,
  ShieldCheck,
  Palette,
  Check,
  LogOut
} from "lucide-react";
import { useRouter } from "next/navigation";

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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading, logout } = useAuthContext();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-10 border-4 border-t-[var(--accent-start)] border-[var(--accent-soft)] rounded-full animate-spin"></div>
          <p className="mt-4 text-[var(--text-muted)] font-medium tracking-wide text-xs uppercase">Autenticando Acesso...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    redirect("/");
  }

  return (
    <div className={`flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-all duration-500 ${theme !== 'light' ? `theme-${theme}` : ''}`}>
      
      {/* 🔮 Ghost Sidebar Dashboard */}
      <aside className="w-68 fixed h-full bg-[var(--input-bg)] backdrop-blur-3xl border-r border-[var(--border-primary)] shadow-2xl p-8 flex flex-col z-20">
        <div className="mb-12 space-y-2">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[var(--accent-start)] to-[var(--accent-end)] rounded-xl shadow-lg shadow-[var(--accent-start)]/20">
                 <ShieldCheck size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)] group">
                BPlen <span className="text-[var(--accent-start)] italic">Admin</span>
              </h2>
           </div>
           <p className="text-[9px] uppercase tracking-[0.3em] text-[var(--text-muted)] font-black opacity-60">Control Center</p>
        </div>

        <nav className="flex-1 space-y-1.5">
          <NavLink href="/admin/agenda" icon={<Calendar size={18} />}>Agenda Hub</NavLink>
          <NavLink href="/admin/gestao-agenda" icon={<Settings size={18} />}>Gestão de Agenda</NavLink>
          <NavLink href="/admin/forms" icon={<FileText size={18} />}>Gestão de Formulários</NavLink>
          <NavLink href="/admin/portfolio" icon={<Briefcase size={18} />}>Gestão de Portfólio</NavLink>
          <NavLink href="/admin/users" icon={<Users size={18} />}>Gestão de Usuários</NavLink>
          <NavLink href="/admin/pesquisas" icon={<LayoutDashboard size={18} />}>Pesquisas Interativas</NavLink>
        </nav>

        <div className="mt-auto space-y-4">
          {/* Seletor de Temas (Sidebar) */}
          <div className="relative" ref={themeMenuRef}>
            <button 
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className={`w-full p-4 rounded-2xl transition-all border flex items-center gap-3
                ${isThemeMenuOpen 
                  ? "bg-[var(--accent-soft)] border-[var(--accent-start)] text-[var(--accent-start)]" 
                  : "bg-[var(--input-bg)] border-[var(--border-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-soft)]"}`}
            >
               <Palette size={18} />
               <span className="text-[10px] font-black uppercase tracking-widest text-left flex-1">Alterar Tema</span>
            </button>

            <AnimatePresence>
               {isThemeMenuOpen && (
                 <motion.div 
                   initial={{ opacity: 0, x: -12, scale: 0.95 }}
                   animate={{ opacity: 1, x: 0, scale: 1 }}
                   exit={{ opacity: 0, x: -12, scale: 0.95 }}
                   className="absolute bottom-16 left-0 p-3 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-3xl shadow-2xl w-64 backdrop-blur-2xl z-[200] overflow-hidden"
                 >
                    <div className="space-y-1">
                       <p className="px-3 py-2 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1">Cores do Sistema</p>
                       {THEMES.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => {
                              setTheme(opt.id);
                              setIsThemeMenuOpen(false);
                            }}
                            className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all group
                              ${theme === opt.id ? "bg-[var(--accent-start)]/20 text-[var(--accent-start)]" : "text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)]"}`}
                          >
                             <div className="flex items-center gap-3">
                                <div 
                                  className="w-4 h-4 rounded-full border border-[var(--border-primary)] shadow-sm"
                                  style={{ backgroundColor: opt.color }}
                                />
                                <span className={`text-xs font-bold ${theme === opt.id ? "text-[var(--accent-start)]" : "text-[var(--text-secondary)]"}`}>
                                   {opt.label}
                                </span>
                             </div>
                             {theme === opt.id && <Check size={14} className="text-[var(--accent-start)]" />}
                          </button>
                       ))}
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>
          </div>

          <Link href="/hub" className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-[var(--input-bg)] border border-[var(--border-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-soft)] transition-all group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Voltar ao Hub
          </Link>

          <button 
            onClick={async () => {
              setIsLoggingOut(true);
              await logout();
              router.push("/");
            }}
            disabled={isLoggingOut}
            className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:scale-95 disabled:opacity-30"
          >
             <LogOut size={14} className={isLoggingOut ? 'animate-pulse' : ''} />
             Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content Area Admin */}
      <main className="flex-1 ml-68 p-12 max-w-[1400px] relative z-10 transition-all duration-300">
        <div className="glass p-10 min-h-[calc(100vh-6rem)] relative overflow-hidden bg-[var(--input-bg)]/30 border border-[var(--border-primary)] rounded-[3rem]">
          {children}
          
          {/* Subtle Ambient Glows */}
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-[var(--accent-start)] rounded-full blur-[100px] opacity-[0.03] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-[var(--accent-end)] rounded-full blur-[100px] opacity-[0.03] pointer-events-none" />
        </div>
      </main>

      {/* Suporte & Redes Fixa */}
      <FloatingSupport />
    </div>
  );
}

function NavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)] transition-all hover:translate-x-1 active:scale-95 group border border-transparent hover:border-[var(--border-primary)]"
    >
      <span className="text-[var(--text-muted)] group-hover:text-[var(--accent-start)] transition-colors">{icon}</span>
      {children}
    </Link>
  );
}
