"use client";

import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: "high" | "medium" | "low";
  size?: "sm" | "md";
}

const config = {
  high: { label: "Высокий", color: "bg-red-500" },
  medium: { label: "Средний", color: "bg-yellow-500" },
  low: { label: "Низкий", color: "bg-gray-400" },
};

export function PriorityBadge({ priority, size = "md" }: PriorityBadgeProps) {
  const { label, color } = config[priority];

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
        {label}
      </span>
    </span>
  );
}
