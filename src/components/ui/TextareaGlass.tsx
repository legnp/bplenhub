"use client";

import React from "react";

interface TextareaGlassProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

/**
 * TextareaGlass (Átomo UI 📝)
 * Campo de texto longo translúcido (Standard UI Glass).
 */
export const TextareaGlass = ({ label, className = "", ...props }: TextareaGlassProps) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-[10px] text-[var(--text-muted)] ml-1 font-medium uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        {...props}
        className={`w-full bg-[var(--input-bg)] border-[1px] border-[var(--input-border)] backdrop-blur-xl rounded-[14px] px-4 py-3 
                   text-sm placeholder:text-[var(--input-placeholder)] focus:outline-none focus:border-[var(--accent-start)]/50 
                   text-[var(--text-primary)] resize-none transition-all shadow-sm ${className}`}
      />

    </div>
  );
};
