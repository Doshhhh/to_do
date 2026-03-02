"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { HabitCard } from "./HabitCard";
import { HabitForm } from "./HabitForm";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
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

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {habits.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-20"
            >
              <p
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("habits.noHabits")}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
            >
              {habits.map((habit, i) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  completions={completions}
                  categories={categories}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  index={i}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
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
