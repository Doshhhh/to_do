"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Undo2 } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  calculateStreak,
  weeklyProgress,
} from "@/hooks/useHabits";
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

  const streak = calculateStreak(habit.id, completions, habit.frequency_type);
  const weekDone = weeklyProgress(habit.id, completions);

  const category = categories.find((c) => c.id === habit.category_id);
  const categoryColor = category
    ? isDark
      ? category.color_dark
      : category.color_light
    : "var(--accent)";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        onClick={() => onToggle(habit.id)}
        className="rounded-xl overflow-hidden relative group cursor-pointer aspect-square select-none
          transition-[transform,box-shadow] duration-150 ease-out
          hover:scale-[1.03] active:scale-[0.97]"
        style={{
          backgroundColor: done
            ? "rgba(107,143,113,0.85)"
            : isDark
            ? "rgba(255,255,255,0.06)"
            : "rgba(255,255,255,0.6)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: `1px solid ${
            done
              ? "rgba(127,168,134,0.4)"
              : isDark
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.06)"
          }`,
          boxShadow: done
            ? "inset 0 1px 0 rgba(255,255,255,0.15), 0 2px 8px rgba(107,143,113,0.2)"
            : isDark
            ? "inset 0 1px 0 rgba(255,255,255,0.06), 0 1px 4px rgba(0,0,0,0.2)"
            : "inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        {/* Category gradient accent */}
        <div
          className="h-1 w-full"
          style={{ backgroundColor: done ? "rgba(255,255,255,0.2)" : categoryColor }}
        />
        <div
          className="h-4 w-full"
          style={{
            background: done
              ? "linear-gradient(to bottom, rgba(255,255,255,0.08), transparent)"
              : `linear-gradient(to bottom, ${categoryColor}18, transparent)`,
          }}
        />

        {/* Shimmer overlay for done state */}
        {done && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)",
            }}
          />
        )}

        {/* Delete button (only on active cards) */}
        {!done && (
          <button
            onClick={(e) => { e.stopPropagation(); setConfirmOpen(true); }}
            className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100
              transition-opacity duration-150 p-1.5 rounded-lg cursor-pointer z-10"
            style={{
              color: "var(--text-secondary)",
              backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
            }}
          >
            <Trash2 size={13} />
          </button>
        )}

        {/* Undo icon on done cards */}
        {done && (
          <div className="absolute top-2.5 right-2.5 opacity-30 group-hover:opacity-100
            transition-opacity duration-150 p-1.5">
            <Undo2 size={14} style={{ color: "#fff" }} />
          </div>
        )}

        <div className="px-3 pb-3 flex flex-col justify-between h-[calc(100%-20px)]">
          {/* Habit name */}
          <h3
            className="text-sm font-semibold pr-5 line-clamp-2 leading-snug"
            style={{ color: done ? "#fff" : "var(--text-primary)" }}
          >
            {habit.name}
          </h3>

          {/* Stats */}
          <div>
            <div className="flex items-center justify-between gap-1">
              {streak > 0 ? (
                <span
                  className="text-[11px] font-medium truncate"
                  style={{ color: done ? "rgba(255,255,255,0.9)" : "var(--success)" }}
                >
                  🔥 {streak} {t("habits.streak")}
                </span>
              ) : <span />}

              <span
                className="text-[11px] shrink-0"
                style={{ color: done ? "rgba(255,255,255,0.65)" : "var(--text-secondary)" }}
              >
                {habit.frequency_type === "daily" ? (
                  t("habits.daily")
                ) : (
                  <span>
                    {weekDone}/{habit.frequency_count} {t("habits.thisWeek")}
                  </span>
                )}
              </span>
            </div>

            {/* Weekly progress bar */}
            {habit.frequency_type === "weekly" && (
              <div
                className="mt-1.5 h-1 rounded-full overflow-hidden"
                style={{
                  backgroundColor: done ? "rgba(255,255,255,0.15)" : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(100, (weekDone / habit.frequency_count) * 100)}%`,
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: done ? "rgba(255,255,255,0.5)" : categoryColor }}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Delete confirm */}
      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t("habits.deleteHabit")}
      >
        <p
          className="text-sm mb-4"
          style={{ color: "var(--text-secondary)" }}
        >
          <strong style={{ color: "var(--text-primary)" }}>{habit.name}</strong>{" "}
          {t("habits.deleteMessage")}
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => setConfirmOpen(false)}
          >
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
