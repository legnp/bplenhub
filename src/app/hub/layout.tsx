"use client";

import React, { useEffect } from "react";
import { HubHeader } from "@/components/hub/HubHeader";
import { useTheme } from "@/context/ThemeContext";
import { useAuthContext } from "@/context/AuthContext";
import { redirect } from "next/navigation";

/**
 * HUB LAYOUT — O Frame Institucional Privado 🧬
 * Todas as páginas dentro de /hub herdam este layout.
 * Governança: Gate de Autenticação Centralizado 🛡️
 */
export default function HubLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const { user, loading } = useAuthContext();

  // 🛡️ Gate de Autenticação (Soberania de Acesso)
  // Impede reentrada no HUB sem sessão ativa após logout.
  useEffect(() => {
    if (!loading && !user) {
      console.warn("🚫 [Hub Layout] Sessão não detectada. Redirecionando para Home...");
      redirect("/");
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] transition-colors duration-500 ${theme !== 'light' ? `theme-${theme}` : ''}`}>
        <div className="w-10 h-10 border-4 border-t-[var(--accent-start)] border-[var(--accent-soft)] rounded-full animate-spin" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] animate-pulse">Sincronizando Ecossistema...</p>
      </div>
    );
  }

  // Se não houver usuário, as páginas internas não devem ser renderizadas (o useEffect cuidará do redirect)
  if (!user) return null;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${theme !== 'light' ? `theme-${theme}` : ''}`}>
      <HubHeader />
      <main className="flex-1 w-full bg-background transition-colors duration-500">
        {children}
      </main>
    </div>
  );
}
