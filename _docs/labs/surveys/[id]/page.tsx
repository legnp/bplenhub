"use client";

import React, { use } from "react";
import { SurveyEngine } from "@/components/forms/SurveyEngine";
import { getSurveyConfig } from "@/config/surveys";
import { useParams, useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { Loader2, ArrowLeft } from "lucide-react";

/**
 * Survey Playground (Laboratório de Experiências 🧪)
 * Permite visualizar e testar qualquer survey registrada no sistema.
 */
export default function SurveyPlaygroundPage() {
  const params = useParams();
  const router = useRouter();
  const { user, nickname } = useAuthContext();
  const surveyId = params.id as string;
  
  const config = getSurveyConfig(surveyId);

  if (!config) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <h1 className="text-2xl font-bold text-red-500">Survey não encontrada: {surveyId}</h1>
        <p className="text-[var(--text-muted)]">Verifique se o ID está registrado no catálogo central.</p>
        <button 
          onClick={() => router.push("/admin/pesquisas")}
          className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-sm font-bold"
        >
          Voltar ao Admin
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <Loader2 className="animate-spin text-[var(--accent-start)]" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] relative overflow-hidden flex flex-col">
      {/* Header de Controle do Playground */}
      <div className="p-6 flex justify-between items-center z-50 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-[var(--text-muted)]"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-sm font-bold text-white uppercase tracking-widest">{config.title}</h1>
            <p className="text-[10px] text-[var(--accent-start)] font-bold uppercase tracking-tighter italic">Modo Preview / Playground</p>
          </div>
        </div>
        
        <div className="px-4 py-2 rounded-full bg-[var(--accent-soft)] border border-[var(--accent-start)]/20 text-[10px] text-[var(--accent-start)] font-bold uppercase tracking-widest">
           Soberania de Dados: Ativa
        </div>
      </div>

      {/* Background Decorativo (Aderente ao Design System) */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[var(--accent-start)]/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full" />

      {/* Renderização do Motor (Naked / Integrado) */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl flex items-center">
          <SurveyEngine 
            config={{
              ...config,
              templateData: {
                ...(config.templateData || {}),
                User_Nickname: nickname || "Membro BPlen"
              }
            }} 
            userUid={user.uid}
            onComplete={(mat) => {
              alert(`🎉 [PLAYGROUND] Survey concluída com sucesso!\nMatrícula: ${mat}\n\nNo ambiente real, o usuário seria redirecionado.`);
              router.push("/admin/pesquisas");
            }}
          />
        </div>
      </div>
      
      {/* Footer / Nota */}
      <div className="p-4 text-center">
        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest opacity-50 font-bold">
          As respostas enviadas neste modo serão registradas normalmente via Server Actions.
        </p>
      </div>
    </div>
  );
}
