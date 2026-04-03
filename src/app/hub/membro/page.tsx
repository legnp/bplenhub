"use client";

import React, { useEffect, useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { redirect } from "next/navigation";
import { ShieldCheck, Lock } from "lucide-react";
import { auth } from "@/lib/firebase";
import { validateMemberAreaAccess } from "@/actions/member-area";

/**
 * BPlen HUB — Área de Membro (Shell Foundation 🏗️🔒)
 * Governança: Servidor como autoridade final de acesso.
 */

export default function MemberAreaPage() {
  const { user, loading, services, isAdmin } = useAuthContext();
  const [isServerAuthorized, setIsServerAuthorized] = useState<boolean | null>(null);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    async function performServerValidation() {
      // 1. Diagnóstico de Estado no Cliente
      console.log(`🔍 [MemberArea] Estado Client: isAdmin=${isAdmin}, Entitlement=${services?.member_area_access ? 'ATIVO' : 'INATIVO'}`);

      if (!user) return;

      setValidating(true);
      try {
        const token = await auth.currentUser?.getIdToken();
        
        // 2. Validação Server-Side (Soberana 🛡️)
        const result = await validateMemberAreaAccess(token);
        
        console.log(`📡 [MemberArea] Resultado Servidor: Authorized=${result.authorized}`, result.error ? `| Erro: ${result.error}` : "");
        
        setIsServerAuthorized(result.authorized);
      } catch (err: any) {
        console.error("❌ [MemberArea] Falha crítica na validação:", err.message);
        setIsServerAuthorized(false);
      } finally {
        setValidating(false);
      }
    }

    if (!loading && user) {
      performServerValidation();
    }
  }, [user, loading, services, isAdmin]);

  // Redirecionamento baseado exclusivamente na decisão final do servidor
  useEffect(() => {
     if (isServerAuthorized === false) {
        console.warn("🚫 [MemberArea] Bloqueio definitivo aplicado via Servidor. Redirecionando...");
        redirect("/hub");
     }
  }, [isServerAuthorized]);

  // Loading State (Auth ou Validação Server-side)
  if (loading || validating || isServerAuthorized === null) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-12 min-h-[60vh]">
        <div className="relative">
           <div className="w-16 h-16 rounded-full border-2 border-[var(--accent-start)]/20 border-t-[var(--accent-start)] animate-spin" />
           <Lock size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--accent-start)] opacity-50" />
        </div>
        <p className="mt-8 text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] animate-pulse">
           Validando Governança...
        </p>
      </main>
    );
  }

  // Shell Vazia Autenticada e Autorizada
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-20 space-y-12 min-h-[70vh] flex flex-col items-center justify-center">
      
      {/* 🔮 Shell Estrutural — Mantém estética sem conteúdo */}
      <div className="text-center space-y-6 opacity-30 select-none pointer-events-none group">
         <div className="inline-flex p-8 rounded-[3rem] bg-gradient-to-br from-[var(--input-bg)] to-transparent border border-[var(--border-primary)] shadow-2xl transition-all duration-700 group-hover:scale-105 group-hover:opacity-100">
            <ShieldCheck size={64} className="text-[var(--accent-start)]" />
         </div>
         
         <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
               Área de Membro <span className="text-[var(--accent-start)] italic">BPlen</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">
               Foundation Shell v1.1 — Reatividade Full & Auth Sincronizada
            </p>
         </div>

         {/* Divisória Decorativa Estéril */}
         <div className="w-24 h-px bg-gradient-to-r from-transparent via-[var(--border-primary)] to-transparent mx-auto mt-12" />
      </div>

      {/* 💡 Nota Arquitetural (Invisível para o usuário final, documentando o estado da shell) */}
      <div className="fixed bottom-12 right-12 p-4 glass bg-emerald-500/5 border-emerald-500/10 rounded-2xl hidden md:block">
         <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600/60">Server-Side Authorization Sovereignty</span>
         </div>
      </div>
    </div>
  );
}
