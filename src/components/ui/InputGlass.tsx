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
        <label className="text-[10px] text-gray-500 ml-1 font-medium uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`w-full bg-[var(--glass-bg)] border border-gray-200/20 backdrop-blur-md rounded-xl px-4 py-3 
                   text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 
                   focus:ring-[var(--accent-start)] transition-all text-[var(--text-primary)]
                   shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] ${className}`}
      />
    </div>
  );
};
