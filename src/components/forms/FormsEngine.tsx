"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FormConfig, FormResponse, FormFieldConfig } from "@/types/forms";
import { TypedText } from "@/components/ui/TypedText";
import { NavButton } from "@/components/ui/NavButton";
import { InputGlass } from "@/components/ui/InputGlass";
import { ChoiceButton } from "@/components/ui/ChoiceButton";
import { CheckboxItem } from "@/components/ui/CheckboxItem";
import { TextareaGlass } from "@/components/ui/TextareaGlass";
import { SelectGlass } from "@/components/ui/SelectGlass";
import { submitGenericForm } from "@/actions/generic-form";

interface FormsEngineProps {
  config: FormConfig;
  userUid: string;
  onComplete?: (matricula: string) => void;
}

/**
 * FormsEngine (Motor de Formulários V1.0 🏗️)
 * Renderiza qualquer formulário baseado em configuração JSON + Átomos UI.
 */
export function FormsEngine({ config, userUid, onComplete }: FormsEngineProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [responses, setResponses] = useState<FormResponse>({});
  const [typedComplete, setTypedComplete] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStep = config.steps[currentStepIndex];
  const isLastStep = currentStepIndex === config.steps.length - 1;

  // Reset por passo
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
      const res = await submitGenericForm(config, responses, userUid);
      if (onComplete) onComplete(res.matricula);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Erro na submissão do FormsEngine:", error);
      alert(error.message || "Falha ao enviar formulário.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateResponse = (fieldId: string, value: string | string[] | boolean | number | null | undefined) => {
    setResponses(prev => ({ ...prev, [fieldId]: value }));
    handleInteraction();
  };

  // Renderizador de Átomos
  const renderField = (field: FormFieldConfig) => {
    const value = responses[field.id] || "";

    switch (field.type) {
      case "text":
        return (
          <InputGlass
            autoFocus={field.autoFocus}
            placeholder={field.placeholder}
            onChange={(e) => updateResponse(field.id, e.target.value)}
            value={value as any}
          />
        );
      case "choice":
        return (
          <div className="flex flex-col gap-3">
            {field.options?.map((opt: string | { label: string, value: string }) => {
              const label = typeof opt === "string" ? opt : opt.label;
              const val = typeof opt === "string" ? opt : opt.value;
              return (
                <ChoiceButton
                  key={val}
                  active={value === val}
                  onClick={() => updateResponse(field.id, val)}
                >
                  {label}
                </ChoiceButton>
              );
            })}
          </div>
        );
      case "checkbox":
        const currentVals = Array.isArray(value) ? value : [];
        return (
          <div className="flex flex-col gap-2">
            {field.options?.map((opt: string | { label: string, value: string }) => {
              const label = typeof opt === "string" ? opt : opt.label;
              const val = typeof opt === "string" ? opt : opt.value;
              const isChecked = currentVals.includes(val);
              return (
                <CheckboxItem
                  key={val}
                  label={label}
                  checked={isChecked}
                  onChange={() => {
                    const newVals = isChecked 
                      ? currentVals.filter((v: string) => v !== val)
                      : [...currentVals, val];
                    updateResponse(field.id, newVals);
                  }}
                />
              );
            })}
          </div>
        );
      case "textarea":
        return (
          <TextareaGlass
            value={value as any}
            onChange={(e) => updateResponse(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
          />
        );
      case "select":
        return (
          <SelectGlass
            value={value as any}
            onChange={(e) => updateResponse(field.id, e.target.value)}
          >
            <option value="" disabled>{field.placeholder || "Selecione uma opção"}</option>
            {field.options?.map((opt: string | { label: string, value: string }) => {
              const label = typeof opt === "string" ? opt : opt.label;
              const val = typeof opt === "string" ? opt : opt.value;
              return <option key={val} value={val}>{label}</option>;
            })}
          </SelectGlass>
        );
      case "info":
        return <p className="text-gray-600 text-sm leading-relaxed">{field.description}</p>;
      default:
        return null;
    }
  };

  // Verifica se o passo atual pode avançar
  const canProgress = currentStep.fields.every(f => {
    if (!f.required) return true;
    const val = responses[f.id];
    if (f.type === "checkbox") return Array.isArray(val) && val.length > 0;
    return val && String(val).trim().length > 0;
  });

  return (
    <div className="w-full max-w-[750px] mx-auto p-10 relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="h-[600px] flex flex-col justify-start relative pt-4"
        >
          {/* Enunciado Dinâmico */}
          <div className="mb-6 text-[var(--text-primary)] text-[20px] font-medium leading-relaxed">
            <TypedText
              text={currentStep.question}
              onComplete={() => setTypedComplete(true)}
            />
          </div>

          {/* Campos do Passo */}
          <AnimatePresence>
            {typedComplete && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                {currentStep.fields.map(field => (
                  <div key={field.id}>
                    {renderField(field)}
                  </div>
                ))}

                {/* Botão de Finalizar no último passo informativo ou de campos */}
                {isLastStep && (
                   <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !canProgress}
                    className="w-full mt-6 bg-accent-start hover:opacity-90 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? "Enviando..." : config.submitLabel || "Concluir"}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navegação Próximo */}
          <div className="mt-8">
            <AnimatePresence>
              {showNextButton && !isLastStep && canProgress && (
                <NavButton onClick={handleNext} />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
