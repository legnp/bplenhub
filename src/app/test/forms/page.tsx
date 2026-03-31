"use client";

import React, { useState } from "react";
import { FormsEngine } from "@/components/forms/FormsEngine";
import { showroomFormConfig } from "@/config/forms/showroom";
import { ThemeSelector } from "@/components/ui/ThemeSelector";

/**
 * Laboratório de Formulários Dinâmicos 🧪
 * Valida a renderização da FormsEngine V1.0 + Theme Engine 🎨.
 */
export default function FormsTestPage() {
  const [complete, setComplete] = useState(false);
  const [matricula, setMatricula] = useState("");

  const handleComplete = (mat: string) => {
    setMatricula(mat);
    setComplete(true);
  };

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4 transition-colors duration-500">
      <ThemeSelector />
      {!complete ? (
        <div className="w-full max-w-[800px] bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl p-4">
          <header className="mb-8 text-center pt-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-start to-accent-end bg-clip-text text-transparent">
              {showroomFormConfig.title}
            </h1>
            <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest">Laboratório de UX BPlen HUB</p>
          </header>

          <FormsEngine 
            config={showroomFormConfig} 
            userUid="USER_LAB_TEST_123" 
            onComplete={handleComplete}
          />
        </div>
      ) : (
        <div className="w-full max-w-[500px] bg-white/20 backdrop-blur-lg rounded-3xl p-10 text-center border border-white/30 shadow-2xl">
          <div className="w-20 h-20 bg-green-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sucesso no Laboratório!</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            O formulário dinâmico foi enviado e a integração com o Google Drive foi testada para a matrícula:
          </p>
          <div className="bg-white/40 p-4 rounded-xl font-mono text-accent-start font-bold border border-white/40 text-lg">
            {matricula}
          </div>
          <button 
            onClick={() => setComplete(false)}
            className="mt-8 text-gray-500 hover:text-accent-start transition-all text-sm font-medium underline"
          >
            Fazer outro teste
          </button>
        </div>
      )}
    </main>
  );
}
