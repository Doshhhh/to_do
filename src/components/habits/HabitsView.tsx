"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Sparkles, Target } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { HabitCard } from "./HabitCard";
import { HabitForm } from "./HabitForm";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { isCompletedOnDate } from "@/hooks/useHabits";
import type { Habit, HabitCompletion, Category, CategoryFilter } from "@/lib/types";

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
    frequency_type: "daily" | "weekly";
    frequency_count: number;
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
    { key: "rate", label: t("habits.weeklyRate"), value: `${completedRate}%`, icon: Sparkles },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[28px] p-5 md:p-7"
          style={{
            background: isDark
              ? "linear-gradient(135deg, rgba(232,148,58,0.16), rgba(127,168,134,0.14) 55%, rgba(255,255,255,0.04))"
              : "linear-gradient(135deg, rgba(217,119,6,0.12), rgba(107,143,113,0.12) 55%, rgba(255,255,255,0.92))",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.7)"}`,
            boxShadow: isDark
              ? "0 22px 50px rgba(0,0,0,0.24)"
              : "0 24px 50px rgba(187,146,83,0.14)",
          }}
        >
          <div
            className="absolute -top-16 right-0 h-40 w-40 rounded-full blur-3xl"
            style={{ background: isDark ? "rgba(232,148,58,0.18)" : "rgba(217,119,6,0.18)" }}
          />

          <div className="relative flex flex-col gap-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <div
                  className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.7)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <Sparkles size={14} />
                  {t("habits.title")}
                </div>

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
                className="flex gap-2 self-start rounded-2xl p-1.5"
                style={{
                  backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.65)",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.72)"}`,
                }}
              >
                <button
                  onClick={() => setTab("active")}
                  className="flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-all duration-150"
                  style={{
                    backgroundColor: tab === "active" ? "var(--bg-card)" : "transparent",
                    color: tab === "active" ? "var(--text-primary)" : "var(--text-secondary)",
                    boxShadow: tab === "active" ? "0 10px 24px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  {t("habits.tabActive")}
                  <span className="opacity-60">{activeHabits.length}</span>
                </button>

                <button
                  onClick={() => setTab("done")}
                  className="flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-all duration-150"
                  style={{
                    backgroundColor: tab === "done" ? "var(--bg-card)" : "transparent",
                    color: tab === "done" ? "var(--text-primary)" : "var(--text-secondary)",
                    boxShadow: tab === "done" ? "0 10px 24px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  {t("habits.tabDone")}
                  <span className="opacity-60">{doneHabits.length}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {summaryCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.key}
                    className="rounded-2xl p-4"
                    style={{
                      backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.68)",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.76)"}`,
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
                          backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.82)",
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
              <div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(217,119,6,0.08)",
                  color: "var(--accent)",
                }}
              >
                <Sparkles size={22} />
              </div>
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
