"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { TypedText } from "@/components/ui/TypedText";
import { submitWelcomeSurvey } from "@/actions/welcome-survey";

interface WelcomeSurveyProps {
  userUid: string;
  userName: string;
  userEmail: string;
  onComplete: () => void;
}

export function WelcomeSurvey({ userUid, userName, userEmail, onComplete }: WelcomeSurveyProps) {
  const [step, setStep] = useState(0);
  const [typedComplete, setTypedComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [nickname, setNickname] = useState("");
  const [userType, setUserType] = useState<"PF" | "PJ" | "">("");
  const [topics, setTopics] = useState<string[]>([]);
  const [demand, setDemand] = useState("");
  const [origin, setOrigin] = useState("");

  const [showNextButton, setShowNextButton] = useState(false);

  const firstName = userName.split(" ")[0] || userName;
  const displayName = nickname || firstName;

  useEffect(() => {
    setTypedComplete(false);
    setShowNextButton(false);
  }, [step]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (typedComplete) {
      // O botão 'Próximo' aparece com delay de 3 segundos após o término da digitação
      timer = setTimeout(() => {
        setShowNextButton(true);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [typedComplete]);

  const handleNext = () => setStep((s) => s + 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitWelcomeSurvey({
        uid: userUid,
        email: userEmail,
        Authentication_Name: userName,
        User_Nickname: nickname,
        User_Type: userType as "PF" | "PJ", // CPF/CNPJ inferido
        Customer_FirstTopics: topics,
        Customer_FirstDemand: demand,
        Customer_Origin: origin,
      });
      onComplete();
    } catch (error: any) {
      console.error("Falha ao concluir pesquisa de boas-vindas:", error);
      alert(`Erro: ${error.message || "Houve um erro ao processar. Tente novamente."}`);
    } finally {
      setIsSubmitting(true); // Manter true para evitar clique repetido
    }
  };

  const steps = [
    // Step 1
    {
      question: `Olá ${firstName}!!!\nFicamos muito felizes com a sua chegada a BPlen HUB!\n\nComo devemos te chamar?`,
      content: (
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Ex: João, Lisa, Eng. Maria..."
          className="w-full bg-white/40 border border-gray-200/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent-start transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
        />
      ),
      canProgress: nickname.length > 0,
    },
    // Step 2
    {
      question: "Para o que você busca a BPlen?",
      content: (
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setUserType("PF")}
            className={`px-4 py-3 rounded-xl border text-sm text-left transition-all ${userType === "PF"
                ? "border-accent-start bg-accent-start/10 shadow-sm"
                : "border-gray-200/60 bg-white/60 hover:bg-white/80 shadow-sm active:scale-[0.98]"
              }`}
          >
            Para minha Carreira Profissional
          </button>
          <button
            onClick={() => setUserType("PJ")}
            className={`px-4 py-3 rounded-xl border text-sm text-left transition-all ${userType === "PJ"
                ? "border-accent-start bg-accent-start/10 shadow-sm"
                : "border-gray-200/60 bg-white/60 hover:bg-white/80 shadow-sm active:scale-[0.98]"
              }`}
          >
            Para o DHO da minha empresa
          </button>
        </div>
      ),
      canProgress: userType !== "",
    },
    // Step 3
    {
      question: `${displayName}, quais temas podemos te oferecer aqui na BPlen HUB?`,
      content: (
        <div className="flex flex-col gap-2 relative">
          <span className="text-[10px] text-gray-500 mb-1">Selecione uma ou mais opções</span>
          <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200/60 bg-white/60 cursor-pointer hover:bg-white/80 transition-all shadow-sm active:scale-[0.99]">
            <div className={`w-5 h-5 rounded flex items-center justify-center border ${topics.includes("Melhorar meu currículo") ? "bg-accent-start border-accent-start" : "border-gray-400"}`}>
              {topics.includes("Melhorar meu currículo") && <Check size={14} color="white" />}
            </div>
            <input
              type="checkbox"
              className="hidden"
              checked={topics.includes("Melhorar meu currículo")}
              onChange={(e) => {
                if (e.target.checked) setTopics([...topics, "Melhorar meu currículo"]);
                else setTopics(topics.filter((t) => t !== "Melhorar meu currículo"));
              }}
            />
            <span className="text-sm">Melhorar meu currículo</span>
          </label>
        </div>
      ),
      canProgress: topics.length > 0,
    },
    // Step 4
    {
      question: "Porque você acredita que podemos te ajudar com os temas selecionados?",
      content: (
        <textarea
          value={demand}
          onChange={(e) => setDemand(e.target.value)}
          placeholder="Descreva brevemente o que espera..."
          rows={4}
          className="w-full bg-white/40 border border-gray-200/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent-start resize-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
        />
      ),
      canProgress: demand.length > 3,
    },
    // Step 5
    {
      question: "Como você nos conheceu?",
      content: (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-gray-500 mb-1 ml-1">Selecione a origem</span>
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="w-full bg-white/40 border border-gray-200/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent-start transition-all text-gray-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
          >
            <option value="" disabled>Selecione uma opção</option>
            <option value="Instagram">Instagram</option>
          </select>
        </div>
      ),
      canProgress: origin !== "",
    },
    // End
    {
      question: `${displayName}, agradecemos a sua confiança em nós, e esperamos que aproveite ao máximo a BPlen HUB!`,
      content: (
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full mt-4 bg-accent-start hover:opacity-90 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? "Entrando..." : "clique aqui para entrar"}
        </button>
      ),
      canProgress: true,
    },
  ];

  const currentStep = steps[step];

  return (
    <div className="w-full max-w-[750px] mx-auto p-10 relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="h-[600px] flex flex-col justify-start relative pt-4"
        >
          {/* Enunciado */}
          <div className="mb-6 text-[#1D1D1F] text-[20px] font-medium leading-relaxed">
            <TypedText
              text={currentStep.question}
              onComplete={() => setTypedComplete(true)}
            />
          </div>

          {/* Conteúdo Dinâmico (Aparece imediatamente após a digitação) */}
          <AnimatePresence>
            {typedComplete && currentStep.content && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {currentStep.content}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botão de Avançar (Redondo Pequeno) -> Com delay de 3 segundos */}
          <AnimatePresence>
            {showNextButton && step < steps.length - 1 && currentStep.canProgress && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="mt-8 flex justify-end"
              >
                <button
                  onClick={handleNext}
                  className="w-10 h-10 rounded-full bg-accent-start flex items-center justify-center text-white hover:scale-105 hover:shadow-md transition-all"
                  aria-label="Próximo"
                >
                  <ArrowRight size={18} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
