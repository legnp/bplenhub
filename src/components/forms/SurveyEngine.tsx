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
import { submitSurvey } from "@/actions/submit-survey";

interface SurveyEngineProps {
  config: SurveyConfig;
  userUid: string;
  onComplete?: (matricula: string) => void;
}

/**
 * SurveyEngine (Motor de Pesquisas V2.0 📊)
 * Focado em UX narrativa, progressão guiada e animação textual.
 * Aderente à Survey_Global.
 */
export function SurveyEngine({ config, userUid, onComplete }: SurveyEngineProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, SurveyValue>>({});
  const [typedComplete, setTypedComplete] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStep = config.steps[currentStepIndex];
  const isLastStep = currentStepIndex === config.steps.length - 1;

  // Lógica de Interpolação de Texto Reativa (ex: {{nickname}} ou {{firstName}})
  const interpolate = (text: string) => {
    // Mesclar dados estáticos do template com as respostas atuais para interpolação em tempo real
    const combinedData = {
      ...(config.templateData || {}),
      ...responses
    };

    let interpolated = text;
    Object.entries(combinedData).forEach(([key, value]) => {
      if (typeof value === "string" || typeof value === "number") {
        interpolated = interpolated.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
      }
    });

    return interpolated;
  };

  const currentQuestion = interpolate(currentStep.question);

  // Lógica de Reset de Passo
  useEffect(() => {
    setTypedComplete(false);
    setShowNextButton(false);
  }, [currentStepIndex]);

  const handleInteraction = () => {
    if (!showNextButton) setShowNextButton(true);
  };

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await submitSurvey(config, responses, userUid);
      if (onComplete) onComplete(res.matricula);
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

  const toggleMultipleResponse = (fieldId: string, option: string) => {
    const current = (responses[fieldId] as string[]) || [];
    const updated = current.includes(option)
      ? current.filter(item => item !== option)
      : [...current, option];
    setResponses(prev => ({ ...prev, [fieldId]: updated }));
    handleInteraction();
  };

  // Renderizador de Átomos Narrativos
  const renderField = (field: SurveyFieldConfig) => {
    const rawValue = responses[field.id];

    switch (field.type) {
      case "choice":
        if (field.isMultiple) {
          return (
            <div className="flex flex-col gap-2">
              {field.options?.map((opt) => (
                <CheckboxItem
                  key={opt}
                  label={opt}
                  checked={((rawValue as string[]) || []).includes(opt)}
                  onChange={() => toggleMultipleResponse(field.id, opt)}
                />
              ))}
            </div>
          );
        }
        return (
          <div className="flex flex-col gap-3">
            {field.options?.map((opt) => (
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

      case "text":
        const textValue = (typeof rawValue === "string" || typeof rawValue === "number") ? rawValue : "";
        return (
          <div className="pt-2">
            <InputGlass
              autoFocus={field.autoFocus}
              placeholder={field.placeholder || "Escreva aqui..."}
              value={textValue}
              onChange={(e) => updateResponse(field.id, e.target.value)}
            />
          </div>
        );

      case "textarea":
        const areaValue = typeof rawValue === "string" ? rawValue : "";
        return (
          <div className="pt-2">
            <TextareaGlass
              autoFocus={field.autoFocus}
              placeholder={field.placeholder || "Descreva aqui..."}
              value={areaValue}
              onChange={(e) => updateResponse(field.id, e.target.value)}
              rows={4}
            />
          </div>
        );

      case "scale":
        const scaleOptions = field.options || ["1", "2", "3", "4", "5"];
        return (
          <div className="flex justify-between items-center gap-2 pt-4 px-2">
            {scaleOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => updateResponse(field.id, opt)}
                className={`
                  w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center font-bold text-sm
                  ${rawValue === opt 
                    ? "bg-accent-start border-accent-start text-white shadow-lg shadow-accent-start/30 scale-110" 
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
        return null;
    }
  };

  // Verifica se o passo atual pode avançar
  const canProgress = currentStep.fields.every(f => {
    if (!f.required) return true;
    const val = responses[f.id];
    if (Array.isArray(val)) return val.length > 0;
    return val !== undefined && val !== null && String(val).trim().length > 0;
  });

  return (
    <div className="w-full max-w-[750px] mx-auto p-10 relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="min-h-[550px] flex flex-col justify-start relative pt-4 space-y-10"
        >
          {/* Enunciado Narrativo */}
          <div className="space-y-4">
            <div className="text-[var(--text-primary)] text-[22px] md:text-[24px] font-medium leading-tight tracking-tight whitespace-pre-line">
              <TypedText
                text={currentQuestion}
                onComplete={() => setTypedComplete(true)}
              />
            </div>
            
            {typedComplete && currentStep.description && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-[var(--text-muted)] leading-relaxed max-w-[90%]"
              >
                {currentStep.description}
              </motion.p>
            )}
          </div>

          {/* Campos do Passo */}
          <AnimatePresence>
            {typedComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {currentStep.fields.map(field => (
                  <div key={field.id} className="animate-fade-in">
                    {renderField(field)}
                  </div>
                ))}

                {/* Bloco de Ação Final */}
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
                      <AnimatePresence>
                        {showNextButton && canProgress && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                          >
                            <NavButton onClick={handleNext} />
                          </motion.div>
                        )}
                      </AnimatePresence>
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
