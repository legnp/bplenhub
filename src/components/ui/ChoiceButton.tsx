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
      className={`px-4 py-2.5 rounded-[14px] border-[1px] text-[14px] text-left transition-all 
                 hover:bg-[var(--accent-soft)] active:scale-[0.98] shadow-sm backdrop-blur-md
                 ${active 
                   ? "border-[var(--accent-start)] bg-[var(--accent-soft)] text-[var(--accent-start)] font-semibold" 
                   : "border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-primary)] opacity-80 hover:opacity-100"
                 } ${className}`}
    >

      {children}
    </button>
  );
};
