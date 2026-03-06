"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useLanguage } from "@/components/providers/LanguageProvider";
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
  const [formOpen, setFormOpen] = useState(false);
  const [tab, setTab] = useState<"active" | "done">("active");

  const activeHabits = habits.filter((h) => !isCompletedOnDate(h.id, completions));
  const doneHabits = habits.filter((h) => isCompletedOnDate(h.id, completions));
  const current = tab === "active" ? activeHabits : doneHabits;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Tabs */}
        <div
          className="flex gap-1 p-1 rounded-lg mb-4 w-fit"
          style={{ backgroundColor: "var(--separator)" }}
        >
          <button
            onClick={() => setTab("active")}
            className="px-4 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer"
            style={{
              backgroundColor: tab === "active" ? "var(--bg-card)" : "transparent",
              color: tab === "active" ? "var(--text-primary)" : "var(--text-secondary)",
            }}
          >
            {t("habits.tabActive")} {activeHabits.length > 0 && <span className="opacity-50">{activeHabits.length}</span>}
          </button>
          <button
            onClick={() => setTab("done")}
            className="px-4 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer"
            style={{
              backgroundColor: tab === "done" ? "var(--bg-card)" : "transparent",
              color: tab === "done" ? "var(--text-primary)" : "var(--text-secondary)",
            }}
          >
            {t("habits.tabDone")} {doneHabits.length > 0 && <span className="opacity-50">{doneHabits.length}</span>}
          </button>
        </div>

        {current.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              {tab === "active"
                ? (habits.length === 0 ? t("habits.noHabits") : t("habits.allDone"))
                : t("habits.noneDone")}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5">
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
