"use client";

import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { GoogleLoginButton } from "@/components/auth/google-login-button";
import { LogOut, User as UserIcon, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";

/**
 * BPlen HUB — Laboratório de Testes: Autenticação
 * Área de espelhamento para validação de fluxos de login/logout.
 * Todas as funcionalidades aqui serão replicadas para a Página Principal.
 */

export default function TestAuthPage() {
  const { user, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-start" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F7FA] p-6 lg:p-12 flex flex-col items-center">
      {/* Header do Laboratório */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">
            Laboratório de <span className="text-[#667eea]">Testes</span>
          </h1>
          <p className="text-sm text-[#6E6E73] mt-1 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            Central de Distribuição: Funcionalidades Espelhadas
          </p>
        </div>

        <div className="glass px-4 py-2 flex items-center gap-2 self-start md:self-center">
          <ShieldCheck className="w-4 h-4 text-green-500" />
          <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">
            Ambiente Seguro
          </span>
        </div>
      </motion.div>

      {/* Grid de Teste */}
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Lado Esquerdo: Ação de Auth */}
        <section className="flex flex-col gap-6">
          <div className="glass p-8 flex flex-col gap-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <LogIn className="w-5 h-5 text-[#667eea]" />
              Fluxo de Entrada
            </h2>
            <p className="text-sm text-[#6E6E73]">
              Teste o login federado com o Google. Se bem-sucedido, o estado do usuário será propagado para todo o ecossistema.
            </p>
            
            {!user ? (
              <GoogleLoginButton />
            ) : (
              <motion.button
                onClick={() => signOut()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                Encerrar Sessão de Teste
              </motion.button>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100/50">
            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-2">Mirroring Logic</h3>
            <p className="text-xs text-blue-700 leading-relaxed">
              Este componente utiliza o hook <code>useAuth()</code>. Qualquer alteração no hook ou nos serviços de API refletirá automaticamente aqui e na Página Principal.
            </p>
          </div>
        </section>

        {/* Lado Direito: Estado do Usuário */}
        <section className="flex flex-col gap-6">
          <div className="glass p-8 relative overflow-hidden h-full">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-[#667eea]" />
              Estado do Objeto
            </h2>

            {user ? (
              <div className="space-y-6 animate-fade-in-up">
                <div className="flex items-center gap-4">
                  {user.photoURL && (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || "User"} 
                      className="w-16 h-16 rounded-full border-2 border-white shadow-sm"
                    />
                  )}
                  <div>
                    <p className="font-bold text-lg">{user.displayName}</p>
                    <p className="text-xs text-[#6E6E73]">{user.email}</p>
                  </div>
                </div>

                <div className="space-y-3 bg-white/40 p-4 rounded-xl border border-white/60">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-[#6E6E73] uppercase tabular-nums">UID Local</span>
                    <span className="text-xs font-mono break-all">{user.uid}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-[#6E6E73] uppercase tabular-nums">Status de Verificação</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full self-start ${user.emailVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {user.emailVerified ? 'VERIFICADO' : 'EM AGUARDO'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                <UserIcon className="w-12 h-12 mb-4" />
                <p className="text-sm font-medium">Nenhum usuário conectado ao laboratório.</p>
              </div>
            )}
          </div>
        </section>

      </div>
    </main>
  );
}

// Re-importação manual necessária para o ícone sumido no chunk
import { LogIn } from "lucide-react";
