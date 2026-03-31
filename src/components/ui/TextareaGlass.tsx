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
        <label className="text-[10px] text-gray-500 ml-1 font-medium uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        {...props}
        className={`w-full bg-[var(--glass-bg)] border border-gray-200/20 backdrop-blur-md rounded-xl px-4 py-3 
                   text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 
                   focus:ring-[var(--accent-start)] text-[var(--text-primary)] resize-none transition-all 
                   shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] ${className}`}
      />
    </div>
  );
};
