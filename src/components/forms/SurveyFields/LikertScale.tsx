"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TextareaGlass } from "@/components/ui/TextareaGlass";
import { Star } from "lucide-react";

interface LikertValue {
  score: string;
  feedback?: string;
}

interface LikertScaleProps {
  value: LikertValue;
  onChange: (updated: LikertValue) => void;
  options?: string[];
}

export function LikertScale({ value = { score: "" }, onChange, options = ["1", "2", "3", "4", "5"] }: LikertScaleProps) {
  const [hoveredScore, setHoveredScore] = useState<string | null>(null);

  const handleScore = (score: string) => {
    onChange({ ...value, score });
  };

  const handleFeedback = (feedback: string) => {
    onChange({ ...value, feedback });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-center items-center gap-4 max-w-sm mx-auto">
        {options.map((opt) => {
          const scoreNum = parseInt(opt);
          const currentScoreNum = value?.score ? parseInt(value.score) : 0;
          const hoveredScoreNum = hoveredScore ? parseInt(hoveredScore) : 0;
          
          const isActive = scoreNum <= currentScoreNum;
          const isHovered = scoreNum <= hoveredScoreNum;

          return (
            <motion.button
              key={opt}
              type="button"
              onMouseEnter={() => setHoveredScore(opt)}
              onMouseLeave={() => setHoveredScore(null)}
              onClick={() => handleScore(opt)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="relative p-1 focus:outline-none"
            >
              <Star 
                size={36}
                strokeWidth={1.5}
                className={`
                  transition-all duration-300
                  ${isActive || isHovered 
                    ? "fill-[#FFB800] text-[#FFB800] transform drop-shadow-[0_0_12px_rgba(255,184,0,0.6)]" 
                    : "text-black/40 fill-black/5 dark:text-white/30 dark:fill-white/5"}
                `}
              />
              {isActive && (
                <motion.div 
                  layoutId="activeStar"
                  className="absolute inset-0 bg-[#FFB800] blur-xl opacity-20 rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {value?.score && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
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
