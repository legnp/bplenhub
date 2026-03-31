"use client";

import React from "react";
import { useTheme, BPlenTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";

/**
 * ThemeSelector (Componente de Teste UI 🎨)
 * Dock flutuante para alternância rápida entre os Modos BPlen.
 */
export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const themes: { id: BPlenTheme; color: string; label: string }[] = [
    { id: "light", color: "#667eea", label: "Claro" },
    { id: "dark", color: "#30D5C8", label: "Escuro" },
    { id: "rosa-pitaya", color: "#ff0080", label: "Pitaya" },
    { id: "lavanda-azulado", color: "#a78bfa", label: "Lavanda" },
    { id: "amarelo-sol", color: "#fde047", label: "Sol" },
    { id: "cinza-nublado", color: "#94a3b8", label: "Nublado" },
    { id: "daltonico", color: "#000000", label: "Contraste" },
  ];

  return (
    <motion.div 
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-xl border border-white/30 p-2 rounded-2xl shadow-2xl z-[999] flex items-center gap-2"
    >
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          title={t.label}
          className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-125 hover:-translate-y-1 active:scale-95
                     ${theme === t.id ? "border-white scale-110 shadow-lg" : "border-transparent opacity-60"}`}
          style={{ backgroundColor: t.color }}
        />
      ))}
    </motion.div>
  );
}
