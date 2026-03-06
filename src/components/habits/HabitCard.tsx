"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Trash2 } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  calculateStreak,
  weeklyProgress,
  isCompletedOnDate,
} from "@/hooks/useHabits";
import type { Habit, HabitCompletion, Category } from "@/lib/types";

interface HabitCardProps {
  habit: Habit;
  completions: HabitCompletion[];
  categories: Category[];
  onToggle: (habitId: string) => void;
  onDelete: (habitId: string) => void;
  index: number;
}

export function HabitCard({
  habit,
  completions,
  categories,
  onToggle,
  onDelete,
  index,
}: HabitCardProps) {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const completed = isCompletedOnDate(habit.id, completions);
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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05, duration: 0.3, ease: "easeOut" }}
        onClick={() => onToggle(habit.id)}
        className="rounded-xl overflow-hidden shadow-sm relative group aspect-square cursor-pointer"
        style={{
          backgroundColor: completed
            ? "var(--success)"
            : "var(--bg-card)",
          border: `1px solid ${completed ? "var(--success)" : "var(--separator)"}`,
          transition: "background-color 0.15s ease, border-color 0.15s ease",
        }}
      >
        {/* Color stripe */}
        <div
          className="h-1.5 w-full"
          style={{ backgroundColor: completed ? "rgba(255,255,255,0.2)" : categoryColor }}
        />

        {/* Delete button */}
        <button
          onClick={(e) => { e.stopPropagation(); setConfirmOpen(true); }}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg cursor-pointer z-10"
          style={{
            color: completed ? "rgba(255,255,255,0.7)" : "var(--text-secondary)",
            backgroundColor: completed ? "rgba(255,255,255,0.1)" : "var(--separator)",
          }}
        >
          <Trash2 size={14} />
        </button>

        <div className="p-4 flex flex-col justify-between h-[calc(100%-6px)]">
          {/* Habit name */}
          <h3
            className="text-sm font-semibold pr-6"
            style={{ color: completed ? "#fff" : "var(--text-primary)" }}
          >
            {habit.name}
          </h3>

          <div>
            {/* Check icon */}
            <div className="flex items-center justify-center mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: completed
                    ? "rgba(255,255,255,0.2)"
                    : isDark
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.04)",
                  transition: "background-color 0.15s ease",
                }}
              >
                <Check
                  size={20}
                  strokeWidth={3}
                  style={{
                    color: completed ? "#fff" : "var(--text-secondary)",
                    opacity: completed ? 1 : 0.4,
                    transition: "color 0.15s ease, opacity 0.15s ease",
                  }}
                />
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-between">
              {/* Streak */}
              {streak > 0 ? (
                <span
                  className="text-xs font-medium"
                  style={{ color: completed ? "rgba(255,255,255,0.85)" : "var(--success)" }}
                >
                  🔥 {streak} {t("habits.streak")}
                </span>
              ) : <span />}

              {/* Frequency info */}
              <span
                className="text-xs"
                style={{ color: completed ? "rgba(255,255,255,0.7)" : "var(--text-secondary)" }}
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

            {/* Weekly progress bar for weekly habits */}
            {habit.frequency_type === "weekly" && (
              <div
                className="mt-2 h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: completed ? "rgba(255,255,255,0.2)" : "var(--separator)" }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(100, (weekDone / habit.frequency_count) * 100)}%`,
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: completed ? "rgba(255,255,255,0.5)" : categoryColor }}
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
