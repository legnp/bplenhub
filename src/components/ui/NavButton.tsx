"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface NavButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  size?: number;
  label?: string; // Novo campo para texto (ex: "Iniciar", "De acordo")
}

/**
 * NavButton (Componente UI Atômico 🛡️)
 * Suporta ícone padrão ou label textual para fluxos narrativos.
 */
export const NavButton = ({ 
  onClick, 
  disabled = false, 
  variant = "primary",
  size = 18,
  label
}: NavButtonProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className="flex justify-end"
    >
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          flex items-center justify-center transition-all active:scale-95 text-white shadow-lg
          ${label ? "px-6 py-3 rounded-[14px] text-[11px] font-bold uppercase tracking-[0.15em]" : "w-10 h-10 rounded-full"}
          ${variant === "primary" ? "bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)] hover:opacity-95" : "bg-gray-400"}
          ${disabled ? "opacity-30 cursor-not-allowed grayscale" : "cursor-pointer hover:scale-[1.02] hover:shadow-[0_8px_20px_-4px_rgba(255,44,141,0.3)]"}
        `}

        aria-label={label || "Avançar"}
      >
        {label ? (
          <span>{label}</span>
        ) : (
          <ArrowRight size={size} />
        )}
      </button>
    </motion.div>
  );
};
