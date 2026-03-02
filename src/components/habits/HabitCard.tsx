"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
        className="rounded-xl overflow-hidden shadow-sm relative group"
        style={{
          backgroundColor: completed
            ? isDark
              ? "rgba(107,143,113,0.15)"
              : "rgba(107,143,113,0.08)"
            : "var(--bg-card)",
          border: `1px solid ${completed ? (isDark ? "rgba(107,143,113,0.3)" : "rgba(107,143,113,0.2)") : "var(--separator)"}`,
        }}
      >
        {/* Color stripe */}
        <div
          className="h-1.5 w-full"
          style={{ backgroundColor: categoryColor }}
        />

        <div className="p-4">
          {/* Delete button */}
          <button
            onClick={() => setConfirmOpen(true)}
            className="absolute top-4 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-[var(--separator)] cursor-pointer"
            style={{ color: "var(--text-secondary)" }}
          >
            <Trash2 size={14} />
          </button>

          {/* Habit name */}
          <h3
            className="text-sm font-semibold mb-3 pr-6"
            style={{ color: "var(--text-primary)" }}
          >
            {habit.name}
          </h3>

          {/* Check button */}
          <button
            onClick={() => onToggle(habit.id)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
            style={{
              backgroundColor: completed
                ? "var(--success)"
                : isDark
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.04)",
              color: completed ? "#fff" : "var(--text-secondary)",
            }}
          >
            <AnimatePresence mode="wait">
              {completed ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 15,
                  }}
                  className="flex items-center gap-1.5"
                >
                  <Check size={16} strokeWidth={3} />
                  {t("habits.completedToday")}
                </motion.span>
              ) : (
                <motion.span
                  key="mark"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  {t("habits.markDone")}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Stats row */}
          <div className="flex items-center justify-between mt-3">
            {/* Streak */}
            {streak > 0 && (
              <span
                className="text-xs font-medium"
                style={{ color: "var(--success)" }}
              >
                🔥 {streak} {t("habits.streak")}
              </span>
            )}
            {streak === 0 && <span />}

            {/* Frequency info */}
            <span
              className="text-xs"
              style={{ color: "var(--text-secondary)" }}
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
              style={{ backgroundColor: "var(--separator)" }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(100, (weekDone / habit.frequency_count) * 100)}%`,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: categoryColor }}
              />
            </div>
          )}
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
