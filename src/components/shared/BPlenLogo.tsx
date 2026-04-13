"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BPlenLogoProps {
  variant?: "main" | "hub";
  className?: string;
  size?: number | string;
}

/**
 * BPlenLogo — Componente centralizado de Branding 🧬
 * Gerencia a logo da consultoria e a versão HUB de forma unificada.
 * Utiliza o ativo único logo.svg para garantir consistência.
 */
export function BPlenLogo({ variant = "hub", className, size = 32 }: BPlenLogoProps) {
  return (
    <div className={cn("flex items-center gap-2 group cursor-pointer select-none", className)}>
      {/* Símbolo/Logo Base */}
      <img 
        src="/logo_bplen/logo.svg" 
        alt="BPlen"
        style={{ height: size, width: 'auto' }}
        className="object-contain"
      />
      
      {/* Identificador HUB se necessário */}
      {variant === "hub" && (
        <span className="gradient-accent bg-clip-text text-transparent italic font-black tracking-tighter ml-1.5 translate-y-[1px]">
          HUB
        </span>
      )}
    </div>
  );
}
