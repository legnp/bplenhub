"use client";

import React, { useEffect } from "react";
import { HubHeader } from "@/components/hub/HubHeader";
import { FloatingSupport } from "@/components/layout/FloatingSupport";
import { useTheme } from "@/context/ThemeContext";

/**
 * HUB LAYOUT — O Frame Institucional Privado 🧬
 * Todas as páginas dentro de /hub herdam este layout.
 */
export default function HubLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${theme !== 'light' ? `theme-${theme}` : ''}`}>
      <HubHeader />
      <main className="flex-1 w-full bg-background transition-colors duration-500">
        {children}
      </main>
      
      {/* Central de Suporte & Redes Fixa */}
      <FloatingSupport />
    </div>
  );
}
