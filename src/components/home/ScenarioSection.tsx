"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { LANDING_TOKENS } from "@/constants/landing-tokens";

const stats = [
  {
    value: 62,
    suffix: "%",
    label: "Falta de mão de obra qualificada compromete o crescimento",
    source: "CNN Brasil",
    sourceUrl: "https://www.cnnbrasil.com.br/branded-content/nacional/o-impacto-do-custo-brasil-na-economia-nacional/",
    color: "#ff0080",
  },
  {
    value: 68,
    suffix: "%",
    label: "Aumento de licenças no INSS por saúde mental em 10 anos",
    source: "G1",
    sourceUrl: "https://g1.globo.com/trabalho-e-carreira/noticia/2025/03/10/crise-de-saude-mental-brasil-tem-maior-numero-de-afastamentos-por-ansiedade-e-depressao-em-10-anos.ghtml",
    color: "#c026d3",
  },
  {
    value: 50,
    suffix: "%",
    label: "Acreditam no autodesenvolvimento, mas <1% conta com o RH",
    source: "DHO360",
    sourceUrl: "https://lisdho.github.io/DHO360/",
    color: "#9333ea",
  },
  {
    value: 30,
    suffix: "%",
    label: "Dos negócios reconhecem: as barreiras são pessoas e comunicação",
    source: "DHO360",
    sourceUrl: "https://lisdho.github.io/DHO360/",
    color: "#7928ca",
  },
];

/* ——— Donut Ring (SVG Animado) ——— */
function DonutRing({
  value,
  color,
  suffix,
  delay = 0,
  isInView,
}: {
  value: number;
  color: string;
  suffix: string;
  delay?: number;
  isInView: boolean;
}) {
  const [count, setCount] = useState(0);
  const radius = 58;
  const stroke = 6;
  const circumference = 2 * Math.PI * radius;
  const progress = isInView ? (value / 100) * circumference : 0;

  // Animated counter
  useEffect(() => {
    if (!isInView) return;
    const duration = 1800; // ms
    const startTime = Date.now() + delay * 1000;
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed < 0) return;
      const ratio = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - ratio, 3);
      setCount(Math.round(eased * value));
      if (ratio >= 1) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [isInView, value, delay]);

  return (
    <div className="relative w-[140px] h-[140px] flex-shrink-0">
      <svg
        width="140"
        height="140"
        viewBox="0 0 140 140"
        className="transform -rotate-90"
      >
        {/* Background ring */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={stroke}
        />
        {/* Progress ring */}
        <motion.circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset: isInView
              ? circumference - progress
              : circumference,
          }}
          transition={{
            duration: 1.8,
            delay: delay,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            filter: `drop-shadow(0 0 8px ${color}40)`,
          }}
        />
      </svg>
      {/* Center number */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-3xl font-black tracking-tight"
          style={{ color }}
        >
          {count}
          <span className="text-lg">{suffix}</span>
        </span>
      </div>
    </div>
  );
}

/**
 * ScenarioSection — Seção 5: O Cenário Atual (Desafios)
 * 4 gráficos de rosca interativos lado a lado com animação ao scroll.
 */
export function ScenarioSection() {
  const gridRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(gridRef, { once: true, margin: "-100px" });

  return (
    <section className={LANDING_TOKENS.section}>
      {/* 🔮 Glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-[#ff0080] rounded-full blur-[200px] opacity-[0.03] pointer-events-none -z-10" />

      <div className={LANDING_TOKENS.container}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className={LANDING_TOKENS.header.centered}
        >
          <span className={LANDING_TOKENS.header.kicker}>
            O Cenário Atual
          </span>
          <h2 className={`${LANDING_TOKENS.header.title} max-w-3xl mx-auto mb-6`}>
            O desafio do{" "}
            <span className="text-gray-400">cenário atual</span>
          </h2>
          <p className={LANDING_TOKENS.header.descriptionCentered}>
            O futuro do trabalho é complexo porque a maioria das dores não é técnica, é humana. O desafio é cuidar do invisível: expectativas, confiança e coerência.
          </p>
        </motion.div>

        {/* Donut Charts Row */}
        <motion.div
          ref={gridRef}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.0, ease: "easeOut" }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4"
        >
          {stats.map((stat, index) => (
            <div
              key={stat.value}
              className={LANDING_TOKENS.card.container + " flex-col items-center text-center gap-5 p-6"}
            >
              {/* Donut */}
              <DonutRing
                value={stat.value}
                color={stat.color}
                suffix={stat.suffix}
                delay={index * 0.25}
                isInView={isInView}
              />

              {/* Label */}
              <p className="text-xs text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                {stat.label}
              </p>

              {/* Source */}
              {stat.source && (
                <a
                  href={stat.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] font-medium tracking-widest uppercase text-gray-600 hover:text-[#ff0080] transition-colors mt-auto"
                >
                  Fonte: {stat.source} ↗
                </a>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
