"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TextareaGlass } from "@/components/ui/TextareaGlass";

interface LikertValue {
  score: string;
  feedback?: string;
}

interface LikertScaleProps {
  value: LikertValue;
  onChange: (updated: LikertValue) => void;
  options?: string[];
  enunciado?: string;
}

export function LikertScale({ value = { score: "" }, onChange, options = ["1", "2", "3", "4", "5"] }: LikertScaleProps) {
  const handleScore = (score: string) => {
    onChange({ ...value, score });
  };

  const handleFeedback = (feedback: string) => {
    onChange({ ...value, feedback });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center gap-2 max-w-sm mx-auto">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => handleScore(opt)}
            className={`
              w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center font-bold text-sm
              ${value?.score === opt 
                ? "bg-accent-start border-accent-start text-white shadow-lg shadow-accent-start/30 scale-110" 
                : "bg-white/5 border-white/10 text-[var(--text-muted)] hover:border-[var(--accent-start)]/40"}
            `}
          >
            {opt}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {value?.score && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-3"
          >
            <label className="text-xs font-bold uppercase tracking-widest text-[var(--accent-start)]">
              Nos conte um pouco mais:
            </label>
            <TextareaGlass
              placeholder="Sinto que... Gostaria que continuassem..."
              value={value?.feedback || ""}
              onChange={(e) => handleFeedback(e.target.value)}
              rows={3}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
