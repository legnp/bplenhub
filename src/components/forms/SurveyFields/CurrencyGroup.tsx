"use client";

import React from "react";
import { InputGlass } from "@/components/ui/InputGlass";

interface CurrencyValue {
  value: string;
  currency: string;
  declined?: boolean;
}

interface CurrencyGroupProps {
  value: Record<string, CurrencyValue>;
  onChange: (updated: Record<string, CurrencyValue>) => void;
  labels: string[]; // ex: ["Atual", "Expectativa"]
}

const COMMON_CURRENCIES = ["BRL", "USD", "EUR", "GBP", "CAD", "JPY"];

export function CurrencyGroup({ value = {}, onChange, labels }: CurrencyGroupProps) {
  const updateCurrencyField = (label: string, updates: Partial<CurrencyValue>) => {
    const current = value[label] || { value: "", currency: "BRL" };
    const updatedValue = { ...value, [label]: { ...current, ...updates } };
    onChange(updatedValue);
  };

  const declineResponse = () => {
    onChange({ declined: { value: "declined", currency: "N/A", declined: true } });
  };

  if (value?.declined) {
    return (
      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
        <p className="text-sm text-[var(--text-muted)] italic">Resposta omitida.</p>
        <button 
          onClick={() => onChange({})} 
          className="text-xs text-[var(--accent-start)] font-bold mt-2"
        >
          Desfazer ↩️
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {labels.map((label) => (
          <div key={label} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
              Rendimento {label}
            </label>
            <div className="flex gap-2">
              <select
                className="bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none"
                value={value[label]?.currency || "BRL"}
                onChange={(e) => updateCurrencyField(label, { currency: e.target.value })}
              >
                {COMMON_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <InputGlass
                placeholder="Valor"
                type="number"
                value={value[label]?.value || ""}
                onChange={(e) => updateCurrencyField(label, { value: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-2">
        <button 
          onClick={declineResponse}
          className="text-xs text-[var(--text-muted)] hover:text-white transition-colors underline underline-offset-4"
        >
          Prefiro não responder
        </button>
      </div>
    </div>
  );
}
