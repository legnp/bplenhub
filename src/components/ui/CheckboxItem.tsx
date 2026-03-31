"use client";

import React from "react";
import { Check } from "lucide-react";

interface CheckboxItemProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  className?: string;
}

/**
 * CheckboxItem (Átomo UI ✅)
 * Item de seleção múltipla com design system BPlen HUB.
 */
export const CheckboxItem = ({ 
  label, 
  checked, 
  onChange, 
  className = "" 
}: CheckboxItemProps) => {
  return (
    <label 
      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer 
                 hover:bg-white/10 transition-all shadow-sm backdrop-blur-sm active:scale-[0.99]
                 ${checked 
                   ? "border-[var(--accent-start)] bg-[var(--accent-soft)]" 
                   : "border-gray-200/20 bg-[var(--glass-bg)]"
                 } ${className}`}
    >
      <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all
                      ${checked 
                        ? "bg-[var(--accent-start)] border-[var(--accent-start)]" 
                        : "border-gray-400"
                      }`}>
        {checked && <Check size={14} color="white" />}
      </div>
      <input
        type="checkbox"
        className="hidden"
        checked={checked}
        onChange={onChange}
      />
      <span className="text-sm font-light text-[var(--text-primary)]">{label}</span>
    </label>
  );
};
