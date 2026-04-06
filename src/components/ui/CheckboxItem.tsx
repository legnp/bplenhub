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
      className={`flex items-center gap-3 p-2.5 rounded-[14px] border-[1px] cursor-pointer 
                 hover:bg-[var(--accent-soft)] transition-all shadow-sm backdrop-blur-md active:scale-[0.99]
                 ${checked 
                   ? "border-[var(--accent-start)] bg-[var(--accent-soft)] text-[var(--accent-start)] font-medium" 
                   : "border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-primary)] opacity-90 hover:opacity-100"
                 } ${className}`}
    >

      <div className={`w-4.5 h-4.5 rounded-[6px] flex items-center justify-center border-[1px] transition-all
                      ${checked 
                        ? "bg-[var(--accent-start)] border-[var(--accent-start)] shadow-sm" 
                        : "border-[var(--input-border)] bg-white/5"
                      }`}>
        {checked && <Check size={12} strokeWidth={3} color="white" />}
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
