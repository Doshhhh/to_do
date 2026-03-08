"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Flame, RotateCcw, Trash2 } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { calculateStreak, weeklyProgress } from "@/hooks/useHabits";
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

  const progress =
    habit.frequency_type === "weekly"
      ? Math.min(100, (weekDone / habit.frequency_count) * 100)
      : done
        ? 100
        : 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.18, delay: index * 0.02, ease: "easeOut" }}
        onClick={() => onToggle(habit.id)}
        className="group relative min-h-[228px] cursor-pointer select-none overflow-hidden rounded-[26px] transition-[transform,box-shadow,border-color] duration-200 ease-out hover:scale-[1.03] active:scale-[0.97]"
        style={{
          background: done
            ? "linear-gradient(165deg, rgba(107,143,113,0.95), rgba(84,116,90,0.92))"
            : isDark
              ? "linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))"
              : "linear-gradient(160deg, rgba(255,255,255,0.96), rgba(248,243,235,0.88))",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: `1px solid ${
            done
              ? "rgba(197,229,201,0.28)"
              : isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(214,199,181,0.6)"
          }`,
          boxShadow: done
            ? "inset 0 1px 0 rgba(255,255,255,0.15), 0 18px 40px rgba(78,110,84,0.24)"
            : isDark
              ? "inset 0 1px 0 rgba(255,255,255,0.06), 0 16px 36px rgba(0,0,0,0.24)"
              : "inset 0 1px 0 rgba(255,255,255,0.85), 0 18px 36px rgba(137,112,73,0.1)",
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-24"
          style={{
            background: done
              ? "linear-gradient(180deg, rgba(255,255,255,0.1), transparent)"
              : `radial-gradient(circle at top left, ${categoryColor}40, transparent 55%)`,
          }}
        />

        {done && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 45%, rgba(255,255,255,0.05) 100%)",
            }}
          />
        )}

        {!done && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setConfirmOpen(true);
            }}
            className="absolute top-4 right-4 z-10 rounded-xl p-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
            style={{
              color: "var(--text-secondary)",
              backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.82)",
            }}
          >
            <Trash2 size={14} />
          </button>
        )}

        {done && (
          <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-white/12 px-3 py-1.5 text-xs font-medium text-white">
            <RotateCcw size={14} />
          </div>
        )}

        <div className="relative flex h-full flex-col justify-between p-4">
          <div>
            <div className="flex items-start justify-between gap-3 pr-8">
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium"
                style={{
                  backgroundColor: done ? "rgba(255,255,255,0.14)" : `${categoryColor}16`,
                  color: done ? "rgba(255,255,255,0.92)" : categoryColor,
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: done ? "#fff" : categoryColor }}
                />
                {category?.name || t("habits.title")}
              </div>

              {done && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/14 text-white">
                  <CheckCircle2 size={18} />
                </div>
              )}
            </div>

            <h3
              className="mt-4 text-lg font-semibold leading-snug"
              style={{ color: done ? "#fff" : "var(--text-primary)" }}
            >
              {habit.name}
            </h3>

            <p
              className="mt-2 text-sm leading-6"
              style={{ color: done ? "rgba(255,255,255,0.78)" : "var(--text-secondary)" }}
            >
              {habit.frequency_type === "daily"
                ? t("habits.daily")
                : `${weekDone}/${habit.frequency_count} ${t("habits.thisWeek")}`}
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div
                className="rounded-2xl p-3"
                style={{
                  backgroundColor: done ? "rgba(255,255,255,0.1)" : isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.66)",
                }}
              >
                <p
                  className="text-[11px] uppercase tracking-[0.16em]"
                  style={{ color: done ? "rgba(255,255,255,0.65)" : "var(--text-secondary)" }}
                >
                  {t("habits.streak")}
                </p>
                <div
                  className="mt-2 flex items-center gap-2 text-sm font-medium"
                  style={{ color: done ? "#fff" : "var(--text-primary)" }}
                >
                  <Flame size={15} style={{ color: done ? "#fff" : "var(--accent)" }} />
                  {streak > 0 ? streak : 0}
                </div>
              </div>

              <div
                className="rounded-2xl p-3"
                style={{
                  backgroundColor: done ? "rgba(255,255,255,0.1)" : isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.66)",
                }}
              >
                <p
                  className="text-[11px] uppercase tracking-[0.16em]"
                  style={{ color: done ? "rgba(255,255,255,0.65)" : "var(--text-secondary)" }}
                >
                  {habit.frequency_type === "daily" ? t("habits.completedToday") : t("habits.thisWeek")}
                </p>
                <div
                  className="mt-2 text-sm font-medium"
                  style={{ color: done ? "#fff" : "var(--text-primary)" }}
                >
                  {habit.frequency_type === "daily" ? (done ? "1/1" : "0/1") : `${weekDone}/${habit.frequency_count}`}
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-[11px] font-medium">
                <span style={{ color: done ? "rgba(255,255,255,0.72)" : "var(--text-secondary)" }}>
                  {habit.frequency_type === "daily" ? t("habits.markDone") : t("habits.timesPerWeek")}
                </span>
                <span style={{ color: done ? "#fff" : "var(--text-primary)" }}>
                  {Math.round(progress)}%
                </span>
              </div>
              <div
                className="h-2.5 overflow-hidden rounded-full"
                style={{
                  backgroundColor: done ? "rgba(255,255,255,0.16)" : isDark ? "rgba(255,255,255,0.08)" : "rgba(74,52,27,0.08)",
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{
                    background: done
                      ? "linear-gradient(90deg, rgba(255,255,255,0.55), rgba(255,255,255,0.9))"
                      : `linear-gradient(90deg, ${categoryColor}, ${categoryColor}bb)`,
                  }}
                />
              </div>
            </div>
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
