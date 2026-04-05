"use client";

import React from "react";
import { CheckboxItem } from "@/components/ui/CheckboxItem";

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (updated: string[]) => void;
  minSelections?: number;
  maxSelections?: number;
}

export function MultiSelect({ options, selected, onChange, minSelections, maxSelections }: MultiSelectProps) {
  const toggleOption = (opt: string) => {
    const current = [...selected];
    const index = current.indexOf(opt);
    
    if (index > -1) {
      current.splice(index, 1);
    } else {
      if (maxSelections && current.length >= maxSelections) return;
      current.push(opt);
    }
    
    onChange(current);
  };

  return (
    <div className="space-y-3">
      {minSelections || maxSelections ? (
        <p className="text-xs text-[var(--text-muted)] mb-3 italic">
          Selecione {minSelections && `no mínimo ${minSelections}`}
          {minSelections && maxSelections && " e "}
          {maxSelections && `no máximo ${maxSelections}`}
        </p>
      ) : null}
      
      <div className="grid grid-cols-1 gap-2">
        {options.map((opt) => (
          <CheckboxItem
            key={opt}
            label={opt}
            checked={selected.includes(opt)}
            onChange={() => toggleOption(opt)}
          />
        ))}
      </div>
    </div>
  );
}
