"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, CheckCircle2, Target } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { HabitCard } from "./HabitCard";
import { HabitForm } from "./HabitForm";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { isCompletedOnDate } from "@/hooks/useHabits";
import type { Habit, HabitCompletion, HabitFrequencyType, Category, CategoryFilter } from "@/lib/types";

interface HabitsViewProps {
  habits: Habit[];
  completions: HabitCompletion[];
  categories: Category[];
  filter: CategoryFilter;
  onToggle: (habitId: string) => void;
  onDelete: (habitId: string) => void;
  onAdd: (data: {
    name: string;
    category_id: string;
    subcategory_id: string | null;
    frequency_type: HabitFrequencyType;
    frequency_count: number;
    frequency_days: number[] | null;
  }) => void;
}

export function HabitsView({
  habits,
  completions,
  categories,
  filter,
  onToggle,
  onDelete,
  onAdd,
}: HabitsViewProps) {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [formOpen, setFormOpen] = useState(false);
  const [tab, setTab] = useState<"active" | "done">("active");

  const activeHabits = habits.filter((h) => !isCompletedOnDate(h.id, completions));
  const doneHabits = habits.filter((h) => isCompletedOnDate(h.id, completions));
  const current = tab === "active" ? activeHabits : doneHabits;

  const completedRate = useMemo(() => {
    if (habits.length === 0) return 0;
    return Math.round((doneHabits.length / habits.length) * 100);
  }, [doneHabits.length, habits.length]);

  const summaryCards = [
    { key: "active", label: t("habits.tabActive"), value: activeHabits.length, icon: Target },
    { key: "done", label: t("habits.completedToday"), value: doneHabits.length, icon: CheckCircle2 },
    { key: "rate", label: t("habits.weeklyRate"), value: `${completedRate}%`, icon: Activity },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[28px] p-5 md:p-7"
          style={{
            background: isDark
              ? "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))"
              : "linear-gradient(135deg, rgba(255,255,255,0.78), rgba(255,255,255,0.56))",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.72)"}`,
            boxShadow: isDark
              ? "0 22px 50px rgba(0,0,0,0.24)"
              : "0 18px 40px rgba(143,117,82,0.12)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <div className="relative flex flex-col gap-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                  {tab === "active" ? t("habits.tabActive") : t("habits.tabDone")}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 md:text-base" style={{ color: "var(--text-secondary)" }}>
                  {habits.length === 0
                    ? t("habits.noHabits")
                    : tab === "active"
                      ? t("habits.markDone")
                      : t("habits.allDone")}
                </p>
              </div>

              <div
                className="flex gap-1.5 self-start rounded-[20px] p-1.5"
                style={{
                  backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.48)",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.64)"}`,
                }}
              >
                <button
                  onClick={() => setTab("active")}
                  className="flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-all duration-150"
                  style={{
                    backgroundColor: tab === "active"
                      ? isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.88)"
                      : "transparent",
                    color: tab === "active" ? "var(--text-primary)" : "var(--text-secondary)",
                    boxShadow: tab === "active"
                      ? isDark ? "0 8px 20px rgba(0,0,0,0.2)" : "0 8px 20px rgba(0,0,0,0.08)"
                      : "none",
                  }}
                >
                  {t("habits.tabActive")}
                  <span className="opacity-60">{activeHabits.length}</span>
                </button>

                <button
                  onClick={() => setTab("done")}
                  className="flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-all duration-150"
                  style={{
                    backgroundColor: tab === "done"
                      ? isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.88)"
                      : "transparent",
                    color: tab === "done" ? "var(--text-primary)" : "var(--text-secondary)",
                    boxShadow: tab === "done"
                      ? isDark ? "0 8px 20px rgba(0,0,0,0.2)" : "0 8px 20px rgba(0,0,0,0.08)"
                      : "none",
                  }}
                >
                  {t("habits.tabDone")}
                  <span className="opacity-60">{doneHabits.length}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {summaryCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.key}
                    className="rounded-[22px] p-4"
                    style={{
                      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.42)",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.58)"}`,
                      backdropFilter: "blur(18px)",
                      WebkitBackdropFilter: "blur(18px)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em]" style={{ color: "var(--text-secondary)" }}>
                          {card.label}
                        </p>
                        <p className="mt-2 text-2xl font-semibold">{card.value}</p>
                      </div>

                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-2xl"
                        style={{
                          backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.56)",
                          color: "var(--accent)",
                        }}
                      >
                        <Icon size={20} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.section>

        {current.length === 0 ? (
          <div
            className="flex min-h-[320px] items-center justify-center rounded-[28px] border border-dashed p-8 text-center"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--separator)",
            }}
          >
            <div className="max-w-sm">
              <p className="text-lg font-semibold">
                {tab === "active"
                  ? habits.length === 0
                    ? t("habits.noHabits")
                    : t("habits.allDone")
                  : t("habits.noneDone")}
              </p>
              <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                {t("habits.completedToday")}: {doneHabits.length}
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {current.map((habit, i) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  completions={completions}
                  categories={categories}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  index={i}
                  done={tab === "done"}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      <FloatingActionButton onClick={() => setFormOpen(true)} />

      <HabitForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={onAdd}
        categories={categories}
        defaultCategoryId={filter.categoryId}
        defaultSubcategoryId={filter.subcategoryId}
      />
    </div>
  );
}

