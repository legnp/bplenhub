"use client";

import React from "react";

interface ChoiceButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: React.ReactNode;
}

/**
 * ChoiceButton (Átomo UI 🔘)
 * Botão de seleção com estados visuais Apple IOS Pro.
 */
export const ChoiceButton = ({ 
  active = false, 
  children, 
  className = "", 
  ...props 
}: ChoiceButtonProps) => {
  return (
    <button
      {...props}
      className={`px-4 py-3 rounded-xl border text-sm text-left transition-all 
                 hover:bg-white/10 active:scale-[0.98] shadow-sm backdrop-blur-sm
                 ${active 
                   ? "border-[var(--accent-start)] bg-[var(--accent-soft)] text-[var(--accent-start)] font-medium" 
                   : "border-gray-200/20 bg-[var(--glass-bg)] text-[var(--text-primary)]"
                 } ${className}`}
    >
      {children}
    </button>
  );
};
