"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface NavButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  size?: number;
}

/**
 * NavButton (Componente UI Atômico 🛡️)
 * Padrão redondo BPlen HUB com ícone centralizado.
 */
export const NavButton = ({ 
  onClick, 
  disabled = false, 
  variant = "primary",
  size = 18
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
        className={`w-10 h-10 rounded-full flex items-center justify-center text-white 
                   hover:scale-110 hover:shadow-lg transition-all active:scale-95
                   ${variant === "primary" ? "bg-[var(--accent-start)] hover:bg-[var(--accent-end)] shadow-md" : "bg-gray-400"}
                   ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
        aria-label="Avançar"
      >
        <ArrowRight size={size} />
      </button>
    </motion.div>
  );
};
