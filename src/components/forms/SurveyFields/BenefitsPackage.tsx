"use client";

import React, { useState } from "react";
import { CheckboxItem } from "@/components/ui/CheckboxItem";
import { InputGlass } from "@/components/ui/InputGlass";

interface BenefitData {
  enabled: boolean;
  value?: string;
  currency?: string;
  type?: string;
  company?: string;
  hasCopay?: boolean;
}

interface BenefitsPackageProps {
  value: Record<string, BenefitData>;
  onChange: (updated: Record<string, BenefitData>) => void;
  options: string[];
}

export function BenefitsPackage({ value = {}, onChange, options }: BenefitsPackageProps) {
  const updateBenefit = (id: string, updates: Partial<BenefitData>) => {
    const current = value[id] || { enabled: false };
    const updatedValue = { ...value, [id]: { ...current, ...updates } };
    onChange(updatedValue);
  };

  const toggleBenefit = (id: string) => {
    const current = value[id] || { enabled: false };
    updateBenefit(id, { enabled: !current.enabled });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((opt) => {
          const isEnabled = value[opt]?.enabled;
          const isSalaryOrBonus = opt.toLowerCase().includes("salário") || opt.toLowerCase().includes("bônus");
          const isInsurance = opt.toLowerCase().includes("seguro");

          return (
            <div key={opt} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4">
              <CheckboxItem
                label={opt}
                checked={isEnabled}
                onChange={() => toggleBenefit(opt)}
              />

              {isEnabled && (
                <div className="space-y-3 pl-8 animate-fade-in-down">
                  {isSalaryOrBonus && (
                    <div className="flex gap-2">
                       <InputGlass
                        placeholder="Valor"
                        type="number"
                        value={value[opt]?.value || ""}
                        onChange={(e) => updateBenefit(opt, { value: e.target.value })}
                      />
                    </div>
                  )}

                  {isInsurance && (
                     <InputGlass
                      placeholder="Seguradora/Tipo"
                      value={value[opt]?.company || ""}
                      onChange={(e) => updateBenefit(opt, { company: e.target.value })}
                    />
                  )}

                  {!isSalaryOrBonus && !isInsurance && (
                    <p className="text-[10px] text-[var(--accent-start)] font-bold uppercase tracking-widest">
                      Ativado ✅
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Campo para Outros Benefícios */}
      <div className="pt-4">
        <InputGlass
          placeholder="Algum outro benefício não listado? (Descreva aqui)"
          value={value["outros"]?.value || ""}
          onChange={(e) => updateBenefit("outros", { enabled: true, value: e.target.value })}
        />
      </div>
    </div>
  );
}
