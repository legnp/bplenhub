"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SurveyConfig, SurveyFieldConfig, SurveyValue } from "@/types/survey";
import { TypedText } from "@/components/ui/TypedText";
import { NavButton } from "@/components/ui/NavButton";
import { ChoiceButton } from "@/components/ui/ChoiceButton";
import { InputGlass } from "@/components/ui/InputGlass";
import { TextareaGlass } from "@/components/ui/TextareaGlass";
import { CheckboxItem } from "@/components/ui/CheckboxItem";

// Novos Componentes de Campo 🧬
import { MultiSelect } from "./SurveyFields/MultiSelect";
import { CascadedSelect } from "./SurveyFields/CascadedSelect";
import { BenefitsPackage } from "./SurveyFields/BenefitsPackage";
import { CurrencyGroup } from "./SurveyFields/CurrencyGroup";
import { LikertScale } from "./SurveyFields/LikertScale";

interface SurveyEngineProps {
  config: SurveyConfig;
  userUid: string;
  onComplete?: (matricula: string) => void;
}

/**
 * SurveyEngine (Motor de Pesquisas V2.5 📊)
 * Focado em UX narrativa, progressão guiada e algoritmos de decisão.
 * Agora suporta NAVEGAÇÃO CONDICIONAL (Grafos).
 */
export function SurveyEngine({ config, userUid, onComplete }: SurveyEngineProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, SurveyValue>>({});
  const [typedComplete, setTypedComplete] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime] = useState<number>(Date.now());

  const currentStep = config.steps[currentStepIndex];
  const isLastStep = currentStepIndex === config.steps.length - 1;

  // Lógica de Interpolação de Texto Reativa (Suporta {{nickname}} e {User-nickname})
  const interpolate = (text: string) => {
    const combinedData = {
      ...(config.templateData || {}),
      ...responses
    };

    let interpolated = text;
    Object.entries(combinedData).forEach(([key, value]) => {
      const valStr = typeof value === "string" || typeof value === "number" ? String(value) : "";
      interpolated = interpolated.replace(new RegExp(`{{${key}}}`, 'g'), valStr);
      interpolated = interpolated.replace(new RegExp(`{${key}}`, 'g'), valStr);
    });

    return interpolated;
  };

  const currentQuestion = interpolate(currentStep.question);
  const fullNarrative = `${currentStep.question}${currentStep.description ? "\n\n" + currentStep.description : ""}`;
  const isInfoOnly = currentStep.fields.every(f => f.type === "info");

  useEffect(() => {
    setTypedComplete(false);
    setShowNextButton(false);
  }, [currentStepIndex]);

  const handleInteraction = () => {
    if (!showNextButton) setShowNextButton(true);
  };

  const handleNarrativeComplete = () => {
    setTypedComplete(true);
    if (isInfoOnly) {
      setShowNextButton(true);
    }
  };

  const handleNext = () => {
    // 1. Verificar Lógica Condicional (Salto de Grafo) 🧬
    const firstField = currentStep.fields[0];
    const userValue = responses[firstField.id];
    
    if (firstField.logic && typeof userValue === "string" && firstField.logic[userValue]) {
      const nextStepId = firstField.logic[userValue];
      const nextIndex = config.steps.findIndex(s => s.id === nextStepId);
      if (nextIndex !== -1) {
        setCurrentStepIndex(nextIndex);
        return;
      }
    }

    // 2. Verificar Salto de Etapa Fixo (ID direta) 🧬
    if (currentStep.nextStepId) {
      const nextIndex = config.steps.findIndex(s => s.id === currentStep.nextStepId);
      if (nextIndex !== -1) {
        setCurrentStepIndex(nextIndex);
        return;
      }
    }

    // 3. Fallback para Progressão Linear
    if (!isLastStep) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const endTime = Date.now();
      const durationSeconds = Math.round((endTime - startTime) / 1000);
      
      const payload = {
        ...responses,
        metadata: {
          ...(responses.metadata as any || {}),
          startTime,
          endTime,
          durationSeconds
        }
      };

      const { submitSurvey } = await import("@/actions/submit-survey");
      const res = await submitSurvey(config, payload, userUid);
      
      if (config.completionMessage) {
        setIsFinished(true);
      } else if (onComplete) {
        onComplete(res.matricula || "");
      }
    } catch (err: unknown) {
      console.error("Erro na submissão do SurveyEngine:", err);
      alert("Houve um erro ao enviar sua pesquisa. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateResponse = (fieldId: string, value: SurveyValue) => {
    setResponses(prev => ({ ...prev, [fieldId]: value }));
    handleInteraction();
  };

  // Renderizador de Átomos Narrativos (Extendido)
  const renderField = (field: SurveyFieldConfig) => {
    const rawValue = responses[field.id];

    switch (field.type) {
      case "buttons":
      case "choice":
        if (field.isMultiple) {
          return (
             <MultiSelect
              options={field.options as string[]}
              selected={(rawValue as string[]) || []}
              onChange={(val) => updateResponse(field.id, val)}
              minSelections={field.validation?.minSelections}
              maxSelections={field.validation?.maxSelections}
            />
          );
        }
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(field.options as string[])?.map((opt) => (
              <ChoiceButton
                key={opt}
                active={rawValue === opt}
                onClick={() => updateResponse(field.id, opt)}
              >
                {opt}
              </ChoiceButton>
            ))}
          </div>
        );

      case "multi_select":
        return (
          <MultiSelect
            options={field.options as string[]}
            selected={(rawValue as string[]) || []}
            onChange={(val) => updateResponse(field.id, val)}
            minSelections={field.validation?.minSelections}
            maxSelections={field.validation?.maxSelections}
          />
        );

      case "cascaded":
        return (
          <CascadedSelect
            options={field.options as any[]}
            value={rawValue as any}
            onChange={(val) => updateResponse(field.id, val)}
            labels={{ primary: field.label || "Nicho", secondary: field.secondaryLabel || "Subdivisão" }}
          />
        );

      case "benefits":
        return (
          <BenefitsPackage
            options={field.options as string[]}
            value={rawValue as any}
            onChange={(val) => updateResponse(field.id, val)}
          />
        );

      case "currency_group":
        return (
          <CurrencyGroup
            labels={field.options as string[]}
            value={rawValue as any}
            onChange={(val) => updateResponse(field.id, val)}
          />
        );

      case "likert":
        return (
          <LikertScale
            value={rawValue as any}
            onChange={(val) => updateResponse(field.id, val)}
            options={field.options as string[]}
          />
        );

      case "text":
        return (
          <div className="pt-2">
            <InputGlass
              autoFocus={field.autoFocus}
              placeholder={field.placeholder || "Escreva aqui..."}
              value={String(rawValue || "")}
              onChange={(e) => updateResponse(field.id, e.target.value)}
            />
          </div>
        );

      case "textarea":
        return (
          <div className="pt-2">
            <TextareaGlass
              autoFocus={field.autoFocus}
              placeholder={field.placeholder || "Descreva aqui..."}
              value={String(rawValue || "")}
              onChange={(e) => updateResponse(field.id, e.target.value)}
              rows={4}
            />
          </div>
        );

      case "scale":
        const scaleOptions = (field.options as string[]) || ["1", "2", "3", "4", "5"];
        return (
          <div className="flex justify-between items-center gap-2 pt-4 px-2">
            {scaleOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => updateResponse(field.id, opt)}
                className={`
                  w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center font-bold text-sm
                  ${rawValue === opt 
                    ? "bg-[var(--accent-start)] border-[var(--accent-start)] text-white shadow-lg shadow-[var(--accent-start)]/30 scale-110" 
                    : "bg-white/5 border-white/10 text-[var(--text-muted)] hover:border-[var(--accent-start)]/40"}
                `}
              >
                {opt}
              </button>
            ))}
          </div>
        );

      case "info":
        return (
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-sm text-[var(--text-muted)] leading-relaxed italic">
              {field.label || "Informação adicional importante."}
            </p>
          </div>
        );

      default:
        return <p className="text-red-500">Tipo de campo não suportado: {field.type}</p>;
    }
  };

  const canProgress = currentStep.fields.every(f => {
    if (!f.required) return true;
    const val = responses[f.id];
    if (f.type === "multi_select" || f.isMultiple) {
      const arr = (val as string[]) || [];
      const min = f.validation?.minSelections || 1;
      return arr.length >= min;
    }
    if (f.type === "cascaded") {
      const v = (val as any) || {};
      return !!v.primary && !!v.secondary;
    }
    if (f.type === "currency_group") {
      const v = (val as any) || {};
      return !!v.declined || Object.values(v).some((c: any) => !!c.value);
    }
    if (f.type === "likert") {
      const v = (val as any) || {};
      return !!v.score;
    }
    if (f.type === "info") return true;
    return val !== undefined && val !== null && String(val).trim().length > 0;
  });

  if (isFinished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-8 py-20 px-6 backdrop-blur-xl bg-white/5 rounded-[3rem] border border-white/10"
      >
        <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
           <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
           </svg>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Excelente!</h2>
        <p className="text-[var(--text-muted)] leading-relaxed max-w-md mx-auto whitespace-pre-line">
          {config.completionMessage}
        </p>
        <button
          onClick={() => onComplete?.("")}
          className="px-10 py-4 bg-[var(--accent-soft)] hover:bg-[var(--accent-start)] hover:text-white text-[var(--accent-start)] rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
        >
           Voltar ao Início
        </button>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-[750px] mx-auto relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="min-h-[400px] flex flex-col justify-start relative pt-4 space-y-10"
        >
          <div className="space-y-6">
            <div className="text-[var(--text-primary)] text-2xl md:text-3xl font-bold leading-tight tracking-tight whitespace-pre-line">
              <TypedText
                text={interpolate(fullNarrative)}
                onComplete={handleNarrativeComplete}
              />
            </div>
          </div>

          <AnimatePresence>
            {typedComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {currentStep.fields.filter(f => f.type !== "info").map(field => (
                  <div key={field.id} className="animate-fade-in">
                    {renderField(field)}
                  </div>
                ))}

                <div className="pt-8">
                  {isLastStep ? (
                     <button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !canProgress}
                      className="w-full bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)] hover:opacity-90 text-white px-6 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest shadow-lg shadow-accent-start/20 transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? "Enviando..." : config.submitLabel || "Finalizar Pesquisa"}
                    </button>
                  ) : (
                    <div className="flex justify-end">
                        {showNextButton && (isInfoOnly || canProgress) && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                          >
                            <NavButton 
                              onClick={handleNext} 
                              label={currentStep.nextLabel} 
                            />
                          </motion.div>
                        )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
