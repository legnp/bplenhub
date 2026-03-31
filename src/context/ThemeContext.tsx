"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

/**
 * BPlen HUB — Theme Engine (Contexto 🧠)
 * Gerencia a alternância entre modos visuais (Inclusividade + Personalização).
 */

export type BPlenTheme = 
  | "light" 
  | "dark" 
  | "rosa-pitaya" 
  | "lavanda-azulado" 
  | "amarelo-sol" 
  | "cinza-nublado" 
  | "daltonico";

interface ThemeContextType {
  theme: BPlenTheme;
  setTheme: (theme: BPlenTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<BPlenTheme>("light");

  const applyTheme = (newTheme: BPlenTheme) => {
    // Remover todas as classes de tema antigas
    const themes: BPlenTheme[] = ["dark", "rosa-pitaya", "lavanda-azulado", "amarelo-sol", "cinza-nublado", "daltonico"];
    document.body.classList.remove(...themes.map(t => `theme-${t}`));
    
    // Aplicar a nova, se não for light (default)
    if (newTheme !== "light") {
      document.body.classList.add(`theme-${newTheme}`);
    }
  };

  // Recuperar tema salvo ou preferência do sistema
  useEffect(() => {
    const savedTheme = localStorage.getItem("bplen_theme") as BPlenTheme;
    if (savedTheme) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const setTheme = (newTheme: BPlenTheme) => {
    setThemeState(newTheme);
    localStorage.setItem("bplen_theme", newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme deve ser usado dentro de um ThemeProvider");
  }
  return context;
}
