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
        className={`w-full bg-[var(--input-bg)] border border-[var(--input-border)] backdrop-blur-md rounded-xl px-4 py-3 
                   text-sm placeholder:text-[var(--input-placeholder)] focus:outline-none focus:ring-1 
                   focus:ring-[var(--accent-start)] text-[var(--text-primary)] resize-none transition-all 
                   shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] ${className}`}
      />
    </div>
  );
};
