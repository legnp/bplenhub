"use client";

import React from "react";

interface InputGlassProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

/**
 * InputGlass (Átomo UI 💎)
 * Campo de texto translúcido com design system Apple IOS Pro.
 */
export const InputGlass = ({ label, className = "", ...props }: InputGlassProps) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-[10px] text-[var(--text-muted)] ml-1 font-medium uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`w-full bg-[var(--input-bg)] border-[1px] border-[var(--input-border)] backdrop-blur-xl rounded-[14px] px-4 py-2.5 
                   text-sm placeholder:text-[var(--input-placeholder)] focus:outline-none focus:border-[var(--accent-start)]/50 
                   transition-all text-[var(--text-primary)] shadow-sm ${className}`}
      />

    </div>
  );
};
