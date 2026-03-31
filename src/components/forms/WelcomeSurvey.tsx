"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { TypedText } from "@/components/ui/TypedText";
import { UserType, WelcomeSurveyData, SurveyStep } from "@/types/survey";
import { NavButton } from "@/components/ui/NavButton";
import { submitWelcomeSurvey } from "@/actions/welcome-survey";

import { InputGlass } from "@/components/ui/InputGlass";
import { ChoiceButton } from "@/components/ui/ChoiceButton";
import { CheckboxItem } from "@/components/ui/CheckboxItem";
import { TextareaGlass } from "@/components/ui/TextareaGlass";
import { SelectGlass } from "@/components/ui/SelectGlass";

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
  const [userType, setUserType] = useState<UserType | "">("");
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

  const handleInteraction = () => {
    if (!showNextButton) setShowNextButton(true);
  };

  const handleNext = () => setStep((s) => s + 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const surveyData: WelcomeSurveyData = {
        uid: userUid,
        email: userEmail,
        Authentication_Name: userName,
        User_Nickname: nickname,
        User_Type: userType as UserType,
        Customer_FirstTopics: topics,
        Customer_FirstDemand: demand,
        Customer_Origin: origin,
      };
      await submitWelcomeSurvey(surveyData);
      onComplete();
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Falha ao concluir pesquisa de boas-vindas:", error);
      alert(`Erro: ${error.message || "Houve um erro ao processar. Tente novamente."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps: SurveyStep[] = [
    {
      id: "nickname",
      question: `Olá ${firstName}!!!\nFicamos muito felizes com a sua chegada a BPlen HUB!\n\nComo devemos te chamar?`,
      content: (
        <InputGlass
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value);
            handleInteraction();
          }}
          placeholder="Ex: João, Lisa, Eng. Maria..."
          autoFocus
        />
      ),
      canProgress: nickname.length > 0,
    },
    {
      id: "userType",
      question: "Para o que você busca a BPlen?",
      content: (
        <div className="flex flex-col gap-3">
          <ChoiceButton
            active={userType === "PF"}
            onClick={() => {
              setUserType("PF");
              handleInteraction();
            }}
          >
            Para minha Carreira Profissional
          </ChoiceButton>
          <ChoiceButton
            active={userType === "PJ"}
            onClick={() => {
              setUserType("PJ");
              handleInteraction();
            }}
          >
            Para o DHO da minha empresa
          </ChoiceButton>
        </div>
      ),
      canProgress: userType !== "",
    },
    {
      id: "topics",
      question: `${displayName}, quais temas podemos te oferecer aqui na BPlen HUB?`,
      content: (
        <div className="flex flex-col gap-2 relative">
          <span className="text-[10px] text-gray-500 mb-1">Selecione uma ou mais opções</span>
          {[
            "Melhorar meu currículo",
            "Transição de carreira",
            "Liderança e gestão",
            "Soft Skills",
            "Desenvolvimento de talentos (DHO)",
          ].map((topic) => (
            <CheckboxItem
              key={topic}
              label={topic}
              checked={topics.includes(topic)}
              onChange={() => {
                if (topics.includes(topic)) setTopics(topics.filter((t) => t !== topic));
                else setTopics([...topics, topic]);
                handleInteraction();
              }}
            />
          ))}
        </div>
      ),
      canProgress: topics.length > 0,
    },
    {
      id: "demand",
      question: "Porque você acredita que podemos te ajudar com os temas selecionados?",
      content: (
        <TextareaGlass
          value={demand}
          onChange={(e) => {
            setDemand(e.target.value);
            handleInteraction();
          }}
          placeholder="Descreva brevemente o que espera..."
          rows={4}
        />
      ),
      canProgress: demand.length > 3,
    },
    {
      id: "origin",
      question: "Como você nos conheceu?",
      content: (
        <SelectGlass
          label="Selecione a origem"
          value={origin}
          onChange={(e) => {
            setOrigin(e.target.value);
            handleInteraction();
          }}
        >
          <option value="" disabled>Selecione uma opção</option>
          <option value="Instagram">Instagram</option>
          <option value="LinkedIn">LinkedIn</option>
          <option value="Indicação">Indicação</option>
          <option value="Outro">Outro</option>
        </SelectGlass>
      ),
      canProgress: origin !== "",
    },
    {
      id: "end",
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
          <div className="mb-6 text-[#1D1D1F] text-[20px] font-medium leading-relaxed">
            <TypedText
              text={currentStep.question}
              onComplete={() => setTypedComplete(true)}
            />
          </div>

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

          <div className="mt-8">
            <AnimatePresence>
              {showNextButton && step < steps.length - 1 && currentStep.canProgress && (
                <NavButton onClick={handleNext} />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
