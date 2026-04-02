"use client";

import React from "react";
import Link from "next/link";
import { useAuthContext } from "@/context/AuthContext";
import { redirect } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { FloatingSupport } from "@/components/layout/FloatingSupport";
import { 
  Calendar, 
  Settings, 
  FileText, 
  Briefcase, 
  Users, 
  ArrowLeft,
  LayoutDashboard,
  ShieldCheck
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuthContext();
  const { theme } = useTheme();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-10 border-4 border-t-accent-start border-accent-soft rounded-full animate-spin"></div>
          <p className="mt-4 text-secondary font-medium tracking-wide text-xs uppercase">Autenticando Acesso...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    redirect("/");
  }

  return (
    <div className={`flex min-h-screen bg-background text-foreground transition-all duration-500 ${theme !== 'light' ? `theme-${theme}` : ''}`}>
      
      {/* 🔮 Ghost Sidebar Dashboard */}
      <aside className="w-68 fixed h-full bg-white/5 backdrop-blur-3xl border-r border-white/5 shadow-2xl p-8 flex flex-col z-20">
        <div className="mb-12 space-y-2">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-accent-start to-accent-end rounded-xl shadow-lg shadow-accent-start/20">
                 <ShieldCheck size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white group">
                BPlen <span className="text-accent-start italic">Admin</span>
              </h2>
           </div>
           <p className="text-[9px] uppercase tracking-[0.3em] text-secondary font-black opacity-60">Control Center</p>
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
          <Link href="/hub" className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Voltar ao Hub
          </Link>
        </div>
      </aside>

      {/* Main Content Area Admin */}
      <main className="flex-1 ml-68 p-12 max-w-[1400px] relative z-10 transition-all duration-300">
        <div className="glass p-10 min-h-[calc(100vh-6rem)] relative overflow-hidden">
          {children}
          
          {/* Subtle Ambient Glows */}
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-accent-start rounded-full blur-[100px] opacity-[0.03] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-accent-end rounded-full blur-[100px] opacity-[0.03] pointer-events-none" />
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
      className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[11px] font-bold text-secondary uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all hover:translate-x-1 active:scale-95 group"
    >
      <span className="text-gray-500 group-hover:text-accent-start transition-colors">{icon}</span>
      {children}
    </Link>
  );
}
