"use client";

import React from "react";
import { CheckboxItem } from "@/components/ui/CheckboxItem";

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (updated: string[]) => void;
  minSelections?: number;
  maxSelections?: number;
  cols?: 1 | 2 | 3 | 4;
}

export function MultiSelect({ options, selected, onChange, minSelections, maxSelections, cols }: MultiSelectProps) {
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

  const getGridCols = () => {
    if (cols === 1) return "grid-cols-1";
    if (cols === 2) return "grid-cols-1 md:grid-cols-2";
    if (cols === 3) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
    if (cols === 4) return "grid-cols-2 md:grid-cols-4";

    // Default dinâmico para multi_select (geralmente mais denso, mantemos 1 col se longo)
    if (options.length <= 6) return "grid-cols-1 md:grid-cols-2";
    return "grid-cols-1";
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
      
      <div className={`grid gap-2 ${getGridCols()}`}>
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
