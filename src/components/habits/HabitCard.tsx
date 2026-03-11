"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Flame, RotateCcw, Trash2 } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { WEEKDAY_KEYS } from "@/lib/i18n";
import { calculateStreak, periodProgress } from "@/hooks/useHabits";
import type { Habit, HabitCompletion, Category } from "@/lib/types";

interface HabitCardProps {
  habit: Habit;
  completions: HabitCompletion[];
  categories: Category[];
  onToggle: (habitId: string) => void;
  onDelete: (habitId: string) => void;
  index: number;
  done?: boolean;
}

export function HabitCard({
  habit,
  completions,
  categories,
  onToggle,
  onDelete,
  index,
  done,
}: HabitCardProps) {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const streak = calculateStreak(habit.id, completions, habit.frequency_type, habit);
  const progress = periodProgress(habit, completions);

  const category = categories.find((c) => c.id === habit.category_id);
  const categoryColor = category
    ? isDark
      ? category.color_dark
      : category.color_light
    : "var(--accent)";

  const progressPercent =
    progress.target > 0 ? Math.min(100, (progress.done / progress.target) * 100) : 0;

  const showProgressBar =
    habit.frequency_type === "specific_days" ||
    habit.frequency_type === "times_per_week" ||
    habit.frequency_type === "times_per_month";

  /** Human-readable frequency label */
  function frequencyLabel(): string {
    switch (habit.frequency_type) {
      case "daily":
        return t("habits.daily");
      case "specific_days": {
        const days = (habit.frequency_days || [])
          .map((d) => t(WEEKDAY_KEYS[d]))
          .join(", ");
        return days;
      }
      case "times_per_week":
        return `${progress.done}/${habit.frequency_count} ${t("habits.thisWeek")}`;
      case "times_per_month":
        return `${progress.done}/${habit.frequency_count} ${t("habits.thisMonth")}`;
      case "every_n_days":
        return `${t("habits.everyDays")} ${habit.frequency_count} ${t("habits.daysInterval")}`;
      default:
        return "";
    }
  }

  /** Progress bar label */
  function progressLabel(): string {
    switch (habit.frequency_type) {
      case "specific_days":
        return t("habits.thisWeek");
      case "times_per_week":
        return t("habits.timesPerWeek");
      case "times_per_month":
        return t("habits.timesPerMonth");
      default:
        return "";
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.16, delay: index * 0.015, ease: "easeOut" }}
        onClick={() => onToggle(habit.id)}
        className="group relative min-h-[190px] cursor-pointer select-none overflow-hidden rounded-[24px] transition-[transform,border-color,background-color] duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.99]"
        style={{
          backgroundColor: done
            ? isDark
              ? "rgba(127,168,134,0.18)"
              : "rgba(107,143,113,0.18)"
            : isDark
              ? "rgba(255,255,255,0.06)"
              : "rgba(255,255,255,0.42)",
          border: `1px solid ${
            done
              ? isDark
                ? "rgba(151,198,160,0.28)"
                : "rgba(107,143,113,0.24)"
              : isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(255,255,255,0.6)"
          }`,
          boxShadow: isDark
            ? "inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 24px rgba(0,0,0,0.16)"
            : "inset 0 1px 0 rgba(255,255,255,0.72), 0 10px 24px rgba(126,102,73,0.08)",
          backdropFilter: "blur(22px)",
          WebkitBackdropFilter: "blur(22px)",
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ backgroundColor: done ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.5)" }}
        />

        {!done && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setConfirmOpen(true);
            }}
            className="absolute top-3 right-3 z-10 rounded-xl p-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
            style={{
              color: "var(--text-secondary)",
              backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.38)",
            }}
          >
            <Trash2 size={14} />
          </button>
        )}

        <div className="relative flex h-full flex-col justify-between p-4">
          <div>
            <div className="flex items-start justify-between gap-3 pr-10">
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium"
                style={{
                  backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.34)",
                  color: done ? (isDark ? "#d8efe0" : "var(--success)") : categoryColor,
                }}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: done ? "currentColor" : categoryColor }} />
                {category?.name || t("habits.title")}
              </div>

              {done ? (
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.38)", color: done ? "var(--success)" : "var(--text-secondary)" }}
                >
                  <RotateCcw size={14} />
                </div>
              ) : null}
            </div>

            <h3 className="mt-4 text-base font-semibold leading-snug md:text-lg" style={{ color: "var(--text-primary)" }}>
              {habit.name}
            </h3>

            <div className="mt-3 flex flex-wrap gap-2">
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium"
                style={{
                  backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.34)",
                  color: "var(--text-secondary)",
                }}
              >
                {frequencyLabel()}
              </div>

              {streak > 0 ? (
                <div
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium"
                  style={{
                    backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.34)",
                    color: done ? "var(--success)" : "var(--text-primary)",
                  }}
                >
                  <Flame size={14} style={{ color: "var(--accent)" }} />
                  {streak} {t("habits.streak")}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-5">
            {showProgressBar ? (
              <>
                <div className="mb-2 flex items-center justify-between text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>
                  <span>{progressLabel()}</span>
                  <span>{progress.done}/{progress.target}</span>
                </div>
                <div
                  className="h-1.5 overflow-hidden rounded-full"
                  style={{ backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(62,43,24,0.08)" }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: categoryColor }}
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between text-sm font-medium" style={{ color: done ? "var(--success)" : "var(--text-secondary)" }}>
                <span>{done ? t("habits.completedToday") : t("habits.markDone")}</span>
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: done
                      ? isDark
                        ? "rgba(127,168,134,0.22)"
                        : "rgba(107,143,113,0.18)"
                      : isDark
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(255,255,255,0.32)",
                    color: done ? "var(--success)" : "var(--text-secondary)",
                  }}
                >
                  <Check size={14} />
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t("habits.deleteHabit")}
      >
        <p className="mb-4 text-sm" style={{ color: "var(--text-secondary)" }}>
          <strong style={{ color: "var(--text-primary)" }}>{habit.name}</strong>{" "}
          {t("habits.deleteMessage")}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
            {t("confirm.cancel")}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onDelete(habit.id);
              setConfirmOpen(false);
            }}
          >
            {t("confirm.delete")}
          </Button>
        </div>
      </Modal>
    </>
  );
}
