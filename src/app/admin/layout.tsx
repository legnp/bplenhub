"use client";

import React from "react";
import Link from "next/link";
import { useAuthContext } from "@/context/AuthContext";
import { redirect } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F5F7FA]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-10 border-4 border-t-[#667eea] border-[#667eea]/20 rounded-full animate-spin"></div>
          <p className="mt-4 text-[#1D1D1F] font-medium tracking-wide">Autenticando Acesso...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-[#F5F7FA] text-[#1D1D1F]">
      {/* Ghost Sidebar */}
      <aside className="w-64 fixed h-full bg-white/40 backdrop-blur-md border-r border-white/50 shadow-[0_4px_16px_0_rgba(31,38,135,0.05)] p-6 flex flex-col z-20">
        <div className="mb-10">
          <h2 className="text-xl font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
            BPlen HUB
          </h2>
          <p className="text-xs uppercase tracking-wider text-[#1D1D1F]/60 mt-1 font-semibold">
            Admin Dashboard
          </p>
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="/admin/agenda" className="block px-4 py-2.5 rounded-2xl text-sm font-medium hover:bg-white/60 transition-all hover:scale-[1.01] hover:shadow-[0_4px_16px_0_rgba(31,38,135,0.05)]">
            📅 Sincronizar Agenda
          </Link>
          <Link href="/admin/gestao-agenda" className="block px-4 py-2.5 rounded-2xl text-sm font-medium hover:bg-white/60 transition-all hover:scale-[1.01] hover:shadow-[0_4px_16px_0_rgba(31,38,135,0.05)]">
            ⚙️ Gestão de Agenda
          </Link>
          <Link href="/admin/forms" className="block px-4 py-2.5 rounded-2xl text-sm font-medium hover:bg-white/60 transition-all hover:scale-[1.01] hover:shadow-[0_4px_16px_0_rgba(31,38,135,0.05)]">
            📝 Gestão de Formulários
          </Link>
          <Link href="/admin/portfolio" className="block px-4 py-2.5 rounded-2xl text-sm font-medium hover:bg-white/60 transition-all hover:scale-[1.01] hover:shadow-[0_4px_16px_0_rgba(31,38,135,0.05)]">
            💼 Gestão de Portfólio
          </Link>
          <Link href="/admin/users" className="block px-4 py-2.5 rounded-2xl text-sm font-medium hover:bg-white/60 transition-all hover:scale-[1.01] hover:shadow-[0_4px_16px_0_rgba(31,38,135,0.05)]">
            👥 Gestão de Usuários
          </Link>
        </nav>

        <div className="mt-auto">
          <Link href="/" className="block px-4 py-2.5 rounded-2xl text-sm font-medium bg-[#1D1D1F]/5 hover:bg-[#1D1D1F]/10 transition-all text-center">
            Voltar ao Início
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-10 max-w-7xl relative z-10 transition-all duration-300">
        <div className="bg-white/40 backdrop-blur-xl border border-white/50 shadow-[0_4px_16px_0_rgba(31,38,135,0.05)] rounded-2xl p-8 h-[1000px] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
