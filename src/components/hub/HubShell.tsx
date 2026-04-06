"use client";

import React from "react";
import { HubHeader } from "@/components/hub/HubHeader";
import { useTheme } from "@/context/ThemeContext";
import { useAuthContext } from "@/context/AuthContext";
import { redirect } from "next/navigation";

/**
 * HUB SHELL — O Frame Institucional Client-Side 🧬
 * Gerencia o tema e o cabeçalho privado.
 */
export function HubShell({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const { user, loading } = useAuthContext();

  // 🛡️ Gate Secundário (UX): Evita flash de conteúdo enquanto o AuthContext sincroniza
  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] transition-colors duration-500 ${theme !== 'light' ? `theme-${theme}` : ''}`}>
        <div className="w-10 h-10 border-4 border-t-[var(--accent-start)] border-[var(--accent-soft)] rounded-full animate-spin" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] animate-pulse">Sincronizando Ecossistema...</p>
      </div>
    );
  }

  // Se o guard do servidor falhar ou o usuário deslogar, redirecionamos via client
  if (!user) {
    redirect("/");
    return null;
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${theme !== 'light' ? `theme-${theme}` : ''}`}>
      <HubHeader />
      <main className="flex-1 w-full bg-background transition-colors duration-500 relative">
        {children}
      </main>
    </div>
  );
}
