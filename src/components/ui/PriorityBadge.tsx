"use client";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n";

interface PriorityBadgeProps {
  priority: "high" | "medium" | "low";
  size?: "sm" | "md";
}

const config: Record<string, { labelKey: TranslationKey; color: string }> = {
  high: { labelKey: "priority.high", color: "bg-red-500" },
  medium: { labelKey: "priority.medium", color: "bg-yellow-500" },
  low: { labelKey: "priority.low", color: "bg-gray-400" },
};

export function PriorityBadge({ priority, size = "md" }: PriorityBadgeProps) {
  const { t } = useLanguage();
  const { labelKey, color } = config[priority];

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "rounded-full",
          color,
          size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5"
        )}
      />
      <span
        className={cn(
          size === "sm" ? "text-xs" : "text-sm"
        )}
        style={{ color: "var(--text-secondary)" }}
      >
        {t(labelKey)}
      </span>
    </span>
  );
}
