"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface TypedTextProps {
  text: string;
  onComplete?: () => void;
  speed?: number; // em ms por caractere
  className?: string;
}

export function TypedText({ 
  text, 
  onComplete, 
  speed = 40,
  className = ""
}: TypedTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const onCompleteRef = useRef(onComplete);

  // Mantém a refença atualizada sem disparar o useEffect principal
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Resetar quando o texto mudar
    setDisplayedText("");
    let currentText = "";
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        currentText += text[currentIndex];
        setDisplayedText(currentText);
        currentIndex++;
      } else {
        clearInterval(interval);
        if (onCompleteRef.current) onCompleteRef.current();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]); // Removido onComplete dependência para evitar resets

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`inline-block text-left whitespace-pre-wrap ${className}`}
    >
      {displayedText}
    </motion.span>
  );
}
