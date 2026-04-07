"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FormConfig, FormResponse, FormFieldConfig, FormValue, FormSectionConfig } from "@/types/forms";
import { NavButton } from "@/components/ui/NavButton";
import { InputGlass } from "@/components/ui/InputGlass";
import { ChoiceButton } from "@/components/ui/ChoiceButton";
import { CheckboxItem } from "@/components/ui/CheckboxItem";
import { TextareaGlass } from "@/components/ui/TextareaGlass";
import { SelectGlass } from "@/components/ui/SelectGlass";
import { FileField } from "@/components/forms/SurveyFields/FileField";
import { submitGenericForm } from "@/actions/generic-form";
import { resolveUserIdentity } from "@/actions/survey-effects";
import { Loader2, FileCheck, AlertCircle } from "lucide-react";

interface FormsEngineProps {
  config: FormConfig;
  userUid: string;
  onComplete?: (matricula: string) => void;
  customSubmit?: (responses: FormResponse) => Promise<void>;
}

/**
 * FormsEngine (Motor de Formulários V2.1 🏗️)
 * Evoluído para suportar Seções Operacionais (Forms_Global).
 * Mantém retrocompatibilidade automática com o modelo de 'steps'.
 */
export function FormsEngine({ config, userUid, onComplete, customSubmit }: FormsEngineProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState<FormResponse>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matricula, setMatricula] = useState<string>("");

  React.useEffect(() => {
    async function loadMatricula() {
      if (userUid) {
        const mat = await resolveUserIdentity(config.id, {}, userUid);
        setMatricula(mat);
      }
    }
    loadMatricula();
  }, [userUid, config.id]);

  // Normalização: Prioriza 'sections', fallback para 'steps'
  const activeSections: FormSectionConfig[] = config.sections || config.steps || [];
  
  const currentSection = activeSections[currentSectionIndex];
  const isLastSection = currentSectionIndex === activeSections.length - 1;

  if (!currentSection) {
    return (
      <div className="p-10 text-center text-[var(--text-muted)] italic">
        Configuração de formulário inválida ou vazia.
      </div>
    );
  }

  const handleNext = () => {
    if (!isLastSection) {
      setCurrentSectionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (customSubmit) {
        await customSubmit(responses);
      } else {
        const res = await submitGenericForm(config, responses, userUid);
        if (onComplete) onComplete(res.matricula);
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Erro na submissão do FormsEngine:", error);
      alert(error.message || "Falha ao enviar formulário.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateResponse = (fieldId: string, value: FormValue) => {
    setResponses(prev => ({ ...prev, [fieldId]: value }));
  };

  // Renderizador de Átomos
  const renderField = (field: FormFieldConfig) => {
    const rawValue = responses[field.id];

    switch (field.type) {
      case "text":
        const textValue = (typeof rawValue === "string" || typeof rawValue === "number") ? rawValue : "";
        return (
          <div className="space-y-2">
            {field.label && <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">{field.label}</label>}
            <InputGlass
              autoFocus={field.autoFocus}
              placeholder={field.placeholder}
              onChange={(e) => updateResponse(field.id, e.target.value)}
              value={textValue}
            />
          </div>
        );
      case "choice":
        return (
          <div className="space-y-3">
             {field.label && <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">{field.label}</label>}
             <div className="flex flex-col gap-3">
                {field.options?.map((opt) => {
                  const label = typeof opt === "string" ? opt : opt.label;
                  const val = typeof opt === "string" ? opt : opt.value;
                  return (
                    <ChoiceButton
                      key={val}
                      active={rawValue === val}
                      onClick={() => updateResponse(field.id, val)}
                    >
                      {label}
                    </ChoiceButton>
                  );
                })}
             </div>
          </div>
        );
      case "checkbox":
        const currentVals = Array.isArray(rawValue) ? (rawValue as string[]) : [];
        return (
          <div className="space-y-3">
            {field.label && <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">{field.label}</label>}
            <div className="flex flex-col gap-2">
              {field.options?.map((opt) => {
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
          </div>
        );
      case "textarea":
        const areaValue = typeof rawValue === "string" ? rawValue : "";
        return (
           <div className="space-y-2">
            {field.label && <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">{field.label}</label>}
            <TextareaGlass
              value={areaValue}
              onChange={(e) => updateResponse(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
            />
          </div>
        );
      case "select":
        const selectValue = typeof rawValue === "string" ? rawValue : "";
        return (
          <div className="space-y-2">
            {field.label && <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">{field.label}</label>}
            <SelectGlass
              value={selectValue}
              onChange={(e) => updateResponse(field.id, e.target.value)}
            >
              <option value="" disabled>{field.placeholder || "Selecione uma opção"}</option>
              {field.options?.map((opt) => {
                const label = typeof opt === "string" ? opt : opt.label;
                const val = typeof opt === "string" ? opt : opt.value;
                return <option key={val} value={val}>{label}</option>;
              })}
            </SelectGlass>
          </div>
        );
      case "number":
        const numValue = typeof rawValue === "number" ? rawValue : "";
        return (
          <div className="space-y-2">
            {field.label && <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">{field.label}</label>}
            <InputGlass
              type="number"
              autoFocus={field.autoFocus}
              placeholder={field.placeholder}
              onChange={(e) => updateResponse(field.id, Number(e.target.value))}
              value={numValue}
            />
          </div>
        );
      case "file":
        return (
          <FileField
            id={field.id}
            label={field.label}
            type="Portfolio" // Genérico para forms operacionais
            matricula={matricula}
            value={(rawValue as any) || null}
            maxSizeMB={(field.metadata?.maxSizeMB as number) || 5}
            onChange={(val) => updateResponse(field.id, val)}
          />
        );
      case "info":
        return (
          <div className="p-4 bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-2xl">
            <p className="text-gray-600 text-sm leading-relaxed">{field.description}</p>
          </div>
        );
      default:
        return null;
    }
  };

  // Verifica se o passo atual pode avançar
  const canProgress = currentSection.fields.every(f => {
    if (!f.required) return true;
    const val = responses[f.id];
    if (f.type === "checkbox") return Array.isArray(val) && val.length > 0;
    return val !== undefined && val !== null && String(val).trim().length > 0;
  });

  return (
    <div className="w-full max-w-[750px] mx-auto p-10 relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSectionIndex}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
          className="min-h-[400px] flex flex-col justify-start relative pt-4 space-y-8"
        >
          {/* Cabeçalho da Seção (Evolução Semântica: Título Operacional) */}
          <div className="space-y-2 text-left">
            <h2 className="text-[var(--text-primary)] text-[22px] font-bold tracking-tight leading-tight">
              {currentSection.title || currentSection.question}
            </h2>
            {currentSection.description && (
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                {currentSection.description}
              </p>
            )}
          </div>

          {/* Campos do Passo — Visibilidade Imediata */}
          <div className="space-y-6">
            {currentSection.fields.map(field => (
              <div key={field.id}>
                {renderField(field)}
              </div>
            ))}

            {/* Botão de Finalizar/Próximo acoplado ao fluxo */}
            <div className="pt-6">
               {isLastSection ? (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !canProgress}
                    className="w-full bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)] hover:opacity-90 text-white px-6 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest shadow-lg shadow-[var(--accent-start)]/20 transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? "Enviando..." : config.submitLabel || "Concluir Registro"}
                  </button>
               ) : (
                  <div className="flex justify-end">
                    <NavButton 
                      onClick={handleNext} 
                      disabled={!canProgress}
                    />
                  </div>
               )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
