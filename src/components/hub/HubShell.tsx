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
      <div className={`min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] transition-colors duration-500 overflow-hidden ${theme !== 'light' ? `theme-${theme}` : ''}`}>
        {/* Cinematic Backdrop Decor */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[var(--accent-start)] blur-[120px] rounded-full animate-pulse" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-[var(--accent-end)] blur-[120px] rounded-full animate-pulse [animation-delay:1s]" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative w-20 h-20 mb-8">
            {/* Outer Rotating Ring */}
            <div className="absolute inset-0 border-t-2 border-r-2 border-[var(--accent-start)] rounded-full animate-spin [animation-duration:2s]" />
            {/* Inner Rotating Ring */}
            <div className="absolute inset-2 border-b-2 border-l-2 border-[var(--accent-end)] rounded-full animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
            {/* Center BPlen Orb */}
            <div className="absolute inset-[30%] bg-gradient-to-br from-[var(--accent-start)] to-[var(--accent-end)] rounded-full blur-[2px] animate-pulse" />
          </div>

          <div className="flex flex-col items-center space-y-2">
            <h2 className="text-sm font-black uppercase tracking-[0.4em] text-[var(--text-primary)] opacity-80">
              BPlen <span className="text-[var(--accent-start)]">HUB</span>
            </h2>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--text-muted)] animate-pulse">
              Sincronizando Ecossistema...
            </p>
          </div>
        </div>
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
      <main className="flex-1 w-full bg-background transition-colors duration-500 relative pt-20">
        {children}
      </main>
    </div>
  );
}
