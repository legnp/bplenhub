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
export function NarrativeContent({ text, onComplete, speed = 25 }: NarrativeContentProps) {
  const [visibleBlockIndex, setVisibleBlockIndex] = React.useState(0);
  const [complete, setComplete] = React.useState(false);
  const blocks = React.useMemo(() => parseNarrativeBlocks(text), [text]);

  const handleBlockComplete = (index: number) => {
    if (index === blocks.length - 1) {
      setComplete(true);
      if (onComplete) onComplete();
    } else {
      setVisibleBlockIndex(index + 1);
    }
  };

  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        const isPast = i < visibleBlockIndex;
        const isCurrent = i === visibleBlockIndex && !complete;
        const isFuture = i > visibleBlockIndex;
        const isFinal = complete;

        if (isFuture) {
           // Reservar espaço com opacidade 0 para evitar reflow massivo
           return (
             <div key={i} className="opacity-0 pointer-events-none select-none">
               {renderBlockContent(block, true)}
             </div>
           );
        }

        if (isCurrent) {
          return (
            <div key={i}>
              {renderBlockContent(block, false, speed, () => handleBlockComplete(i))}
            </div>
          );
        }

        // Past ou Final (Estático)
        return (
          <motion.div 
            key={i}
            initial={isFinal && i === blocks.length - 1 ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
          >
            {renderBlockContent(block, true)}
          </motion.div>
        );
      })}
    </div>
  );
}

// Auxiliares para suporte a blocos narrativos sequenceáveis 🧬

interface NarrativeBlockData {
  type: "h3" | "p-muted" | "p-normal";
  content: string;
}

function parseNarrativeBlocks(text: string): NarrativeBlockData[] {
  if (!text) return [];
  const paragraphs = text.split('\n\n');
  return paragraphs.map(p => {
    if (p.startsWith('###')) return { type: "h3", content: p.replace('###', '').trim() };
    if (p.includes('•') || p.toLowerCase().includes('instruções') || p.toLowerCase().includes('importante')) {
      return { type: "p-muted", content: p };
    }
    return { type: "p-normal", content: p };
  });
}

function renderBlockContent(block: NarrativeBlockData, isStatic: boolean, speed?: number, onComplete?: () => void) {
  const classNameMap = {
    "h3": "text-lg font-semibold text-[var(--text-primary)] mt-6 mb-2 tracking-tight",
    "p-muted": "text-[13px] text-[var(--text-muted)] italic leading-relaxed pl-1 border-l border-white/5",
    "p-normal": "text-[15px] text-[var(--text-secondary)] leading-relaxed"
  };

  const Tag = block.type === "h3" ? "h3" : "p";

  if (isStatic) {
    return <Tag className={classNameMap[block.type]}>{processInlineStyles(block.content)}</Tag>;
  }

  return (
    <Tag className={classNameMap[block.type]}>
      <TypedText text={block.content} speed={speed} onComplete={onComplete} />
    </Tag>
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
