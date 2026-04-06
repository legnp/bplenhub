"use client";

import React from "react";
import { motion } from "framer-motion";
import { TypedText } from "@/components/ui/TypedText";

interface NarrativeContentProps {
  text: string;
  onComplete?: () => void;
  speed?: number;
}

/**
 * NarrativeContent (Componente de Hierarquia Tipográfica ✍️)
 * Processa strings com markdown-lite e aplica estilos institucionais.
 * Markdown suportado: **negrito**, ### subtítulo, [instrucao] texto [/instrucao]
 */
export function NarrativeContent({ text, onComplete, speed = 8 }: NarrativeContentProps) {
  const [complete, setComplete] = React.useState(false);

  const handleComplete = () => {
    setComplete(true);
    if (onComplete) onComplete();
  };

  return (
    <div className="space-y-4 animate-fade-in min-h-[1.5em]">
      {!complete ? (
        <TypedText
          text={text}
          speed={speed}
          onComplete={handleComplete}
          className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.6] tracking-tight whitespace-pre-line"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          {parseNarrative(text)}
        </motion.div>
      )}
    </div>
  );
}


/**
 * NarrativeBlock (Componente Estático para Visualização Imediata 🖼️)
 * Útil para estados onde a animação já terminou ou para previews.
 */
export function NarrativeBlock({ text }: { text: string }) {
  if (!text) return null;
  return <div className="space-y-4">{parseNarrative(text)}</div>;
}


/**
 * Utility: parseNarrative (Para uso quando o texto já estiver completo)
 * Se quisermos renderizar o texto instantaneamente com estilos.
 */
export function parseNarrative(text: string) {
  if (!text) return null;

  // 1. Quebras de linha
  const paragraphs = text.split('\n\n');

  return paragraphs.map((p, i) => {
    // 2. Detectar Subtítulo ###
    if (p.startsWith('###')) {
      return (
        <h3 key={i} className="text-lg font-semibold text-[var(--text-primary)] mt-6 mb-2 tracking-tight">
          {p.replace('###', '').trim()}
        </h3>
      );
    }

    // 3. Detectar Instrução [instrucao] ou Estilo Muted
    if (p.includes('•') || p.toLowerCase().includes('instruções') || p.toLowerCase().includes('importante')) {
       return (
         <p key={i} className="text-[13px] text-[var(--text-muted)] italic leading-relaxed pl-1 border-l border-white/5">
           {processInlineStyles(p)}
         </p>
       );
    }

    return (
      <p key={i} className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
        {processInlineStyles(p)}
      </p>
    );
  });
}

function processInlineStyles(text: string) {
  // Processamento de **negrito** simplificado
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-[var(--accent-start)]">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
