"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  maxWidth?: string;
  className?: string;
}

/**
 * BPlen HUB — Componente de Modal Cristal (Glassmorphism Premium)
 * Padroniza o visual de popups com 2% de opacidade e 40px de blur.
 */
export default function GlassModal({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  maxWidth = "max-w-md",
  className = "",
}: GlassModalProps) {

  const [mounted, setMounted] = useState(false);

  // Client-side hydration check for Portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fechar ao pressionar ESC e Gerenciar Classe Global do Body
  useEffect(() => {
    // Esc handler
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.classList.add("glass-modal-open");
    } else {
      document.body.classList.remove("glass-modal-open");
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.classList.remove("glass-modal-open");
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Sombra imersiva sutil atrás do modal */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/5" 
            onClick={onClose} 
          />

          {/* Wrapper de Animação (Invisível) */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`relative w-full ${maxWidth} ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Vidro Estático Nativo Tailwind (Sem backdrop-blur, agora que a página recua) */}
            <div className="w-full h-full bg-white/70 border border-white/50 shadow-2xl rounded-[40px] p-8">
              {/* Header do Modal */}
              {(title || subtitle) && (
                <div className="flex justify-between items-start mb-6">
                  <div className="text-left">
                    {title && <h3 className="text-xl font-black text-[#1D1D1F] leading-tight">{title}</h3>}
                    {subtitle && (
                      <p className="text-[10px] font-black text-[#1D1D1F]/40 uppercase tracking-[0.2em] mt-1">
                        {subtitle}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="p-3 hover:bg-black/5 rounded-2xl transition-all group"
                    aria-label="Fechar"
                  >
                    <X className="w-5 h-5 text-[#1D1D1F]/20 group-hover:text-[#1D1D1F]/40 transition-colors" />
                  </button>
                </div>
              )}

              {/* Conteúdo Dinâmico */}
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
