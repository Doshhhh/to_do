"use client";

import { ArrowUpDown } from "lucide-react";
import type { SortOption } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TodoSortControlsProps {
  sortBy: SortOption;
  onChange: (sort: SortOption) => void;
}

const options: { value: SortOption; label: string }[] = [
  { value: "created_at", label: "По дате" },
  { value: "priority", label: "По приоритету" },
  { value: "deadline", label: "По дедлайну" },
];

export function TodoSortControls({ sortBy, onChange }: TodoSortControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown
        size={14}
        style={{ color: "var(--text-secondary)" }}
      />
      <div className="flex gap-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer",
              sortBy === opt.value
                ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                : "hover:bg-[var(--separator)]"
            )}
            style={{
              color:
                sortBy === opt.value
                  ? "var(--accent)"
                  : "var(--text-secondary)",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
