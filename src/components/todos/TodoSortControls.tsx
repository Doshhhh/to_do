"use client";

import { ArrowUpDown } from "lucide-react";
import type { SortOption } from "@/lib/types";
import { useLanguage } from "@/components/providers/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface TodoSortControlsProps {
  sortBy: SortOption;
  onChange: (sort: SortOption) => void;
}

const options: { value: SortOption; labelKey: TranslationKey }[] = [
  { value: "created_at", labelKey: "sort.byDate" },
  { value: "priority", labelKey: "sort.byPriority" },
  { value: "deadline", labelKey: "sort.byDeadline" },
];

export function TodoSortControls({ sortBy, onChange }: TodoSortControlsProps) {
  const { t } = useLanguage();
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
            {t(opt.labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}
