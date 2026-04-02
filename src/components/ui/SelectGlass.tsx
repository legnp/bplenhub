"use client";

import React from "react";

interface SelectGlassProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: React.ReactNode;
}

/**
 * SelectGlass (Átomo UI 📂)
 * Menu suspenso translúcido (Standard UI Glass).
 */
export const SelectGlass = ({ label, children, className = "", ...props }: SelectGlassProps) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-[10px] text-[var(--text-muted)] ml-1 font-medium uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        {...props}
        className={`w-full bg-[var(--input-bg)] border border-[var(--input-border)] backdrop-blur-md rounded-xl px-4 py-3 
                   text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-start)] 
                   transition-all text-[var(--text-primary)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] 
                   cursor-pointer ${className}`}
      >
        {children}
      </select>
    </div>
  );
};
