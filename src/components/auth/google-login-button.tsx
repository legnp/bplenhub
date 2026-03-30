"use client";

import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { LogIn, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

/**
 * BPlen HUB — GoogleLoginButton (Componente Premium)
 * Design System Glassmorphism v3.1
 * Estética Apple IOS Pro: Bordas finas, Blur suave, Transparência.
 */

export function GoogleLoginButton() {
  const { signInWithGoogle, isLoggingIn, error } = useAuth();

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <motion.button
        onClick={() => signInWithGoogle()}
        disabled={isLoggingIn}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="glass flex items-center justify-center gap-3 px-6 py-3 w-full max-w-sm font-medium transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
        style={{
          background: "rgba(255, 255, 255, 0.4)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          color: "var(--text-primary)",
        }}
      >
        {isLoggingIn ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        )}
        <span>{isLoggingIn ? "Conectando..." : "Entrar com Google"}</span>
      </motion.button>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-medium text-red-500 bg-red-50/50 px-3 py-1 rounded-full border border-red-200/50"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
