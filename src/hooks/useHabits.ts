"use client";

import { useCallback, useEffect, useState } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import type { Habit, HabitCompletion, CategoryFilter } from "@/lib/types";

export function useHabits() {
  const supabase = useSupabase();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CategoryFilter>({
    categoryId: null,
    subcategoryId: null,
  });

  const fetchHabits = useCallback(async () => {
    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching habits:", error);
      // Table might not exist yet — don't block
    } else {
      setHabits(data || []);
    }
  }, [supabase]);

  const fetchCompletions = useCallback(async () => {
    // Fetch completions for last 90 days for streak/stats calculations
    const since = new Date();
    since.setDate(since.getDate() - 90);
    const sinceStr = since.toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from("habit_completions")
      .select("*")
      .gte("completed_date", sinceStr)
      .order("completed_date", { ascending: false });

    if (error) {
      console.error("Error fetching completions:", error);
    } else {
      setCompletions(data || []);
    }
  }, [supabase]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchHabits(), fetchCompletions()]);
      setLoading(false);
    };
    load();
  }, [fetchHabits, fetchCompletions]);

  const addHabit = async (habit: {
    name: string;
    category_id: string;
    subcategory_id: string | null;
    frequency_type: "daily" | "weekly";
    frequency_count: number;
  }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error("No user found");
      return null;
    }

    const { data, error } = await supabase
      .from("habits")
      .insert({
        name: habit.name,
        category_id: habit.category_id,
        subcategory_id: habit.subcategory_id,
        frequency_type: habit.frequency_type,
        frequency_count: habit.frequency_count,
        user_id: user.id,
        sort_order: habits.length,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding habit:", error);
      alert(`Error adding habit: ${error.message}`);
      return null;
    }

    setHabits((prev) => [...prev, data]);
    return data;
  };

  const deleteHabit = async (id: string) => {
    const { error } = await supabase.from("habits").delete().eq("id", id);

    if (error) {
      console.error("Error deleting habit:", error);
      return;
    }

    setHabits((prev) => prev.filter((h) => h.id !== id));
    setCompletions((prev) => prev.filter((c) => c.habit_id !== id));
  };

  const toggleCompletion = async (habitId: string, date?: string) => {
    const targetDate = date || new Date().toISOString().slice(0, 10);
    const existing = completions.find(
      (c) => c.habit_id === habitId && c.completed_date === targetDate
    );

    if (existing) {
      // Optimistic: remove immediately
      setCompletions((prev) => prev.filter((c) => c.id !== existing.id));

      const { error } = await supabase
        .from("habit_completions")
        .delete()
        .eq("id", existing.id);

      if (error) {
        console.error("Error removing completion:", error);
        // Rollback
        setCompletions((prev) => [existing, ...prev]);
      }
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Optimistic: add immediately with temp id
      const tempId = `temp-${Date.now()}`;
      const optimistic: HabitCompletion = {
        id: tempId,
        habit_id: habitId,
        user_id: user.id,
        completed_date: targetDate,
        created_at: new Date().toISOString(),
      };
      setCompletions((prev) => [optimistic, ...prev]);

      const { data, error } = await supabase
        .from("habit_completions")
        .insert({
          habit_id: habitId,
          user_id: user.id,
          completed_date: targetDate,
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding completion:", error);
        // Rollback
        setCompletions((prev) => prev.filter((c) => c.id !== tempId));
      } else {
        // Replace temp with real data
        setCompletions((prev) =>
          prev.map((c) => (c.id === tempId ? data : c))
        );
      }
    }
  };

  // Filter habits by category
  const filteredHabits = filter.subcategoryId
    ? habits.filter((h) => h.subcategory_id === filter.subcategoryId)
    : filter.categoryId
    ? habits.filter((h) => h.category_id === filter.categoryId)
    : habits;

  return {
    habits,
    filteredHabits,
    completions,
    loading,
    filter,
    setFilter,
    addHabit,
    deleteHabit,
    toggleCompletion,
    refetch: async () => {
      await Promise.all([fetchHabits(), fetchCompletions()]);
    },
  };
}

// Utility: calculate streak for a habit
export function calculateStreak(
  habitId: string,
  completions: HabitCompletion[],
  frequencyType: "daily" | "weekly"
): number {
  const habitCompletions = completions
    .filter((c) => c.habit_id === habitId)
    .map((c) => c.completed_date)
    .sort()
    .reverse(); // most recent first

  if (habitCompletions.length === 0) return 0;

  if (frequencyType === "daily") {
    let streak = 0;
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    // Streak must start from today or yesterday
    if (habitCompletions[0] !== today && habitCompletions[0] !== yesterday) {
      return 0;
    }

    let checkDate = new Date(habitCompletions[0]);
    const completionSet = new Set(habitCompletions);

    while (completionSet.has(checkDate.toISOString().slice(0, 10))) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return streak;
  }

  // For weekly, count consecutive weeks with at least one completion
  let streak = 0;
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() - mondayOffset);
  currentMonday.setHours(0, 0, 0, 0);

  const completionSet = new Set(habitCompletions);
  let weekStart = new Date(currentMonday);

  for (let w = 0; w < 52; w++) {
    let hasCompletion = false;
    for (let d = 0; d < 7; d++) {
      const checkDate = new Date(weekStart);
      checkDate.setDate(weekStart.getDate() + d);
      if (completionSet.has(checkDate.toISOString().slice(0, 10))) {
        hasCompletion = true;
        break;
      }
    }
    if (hasCompletion) {
      streak++;
    } else if (w > 0) {
      break;
    } else {
      // Current week has no completion yet, check previous
      break;
    }
    weekStart.setDate(weekStart.getDate() - 7);
  }

  return streak;
}

// Utility: count completions this week for a habit
export function weeklyProgress(
  habitId: string,
  completions: HabitCompletion[]
): number {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - mondayOffset);
  monday.setHours(0, 0, 0, 0);
  const mondayStr = monday.toISOString().slice(0, 10);

  return completions.filter(
    (c) => c.habit_id === habitId && c.completed_date >= mondayStr
  ).length;
}

// Utility: check if habit is completed on a given date
export function isCompletedOnDate(
  habitId: string,
  completions: HabitCompletion[],
  date?: string
): boolean {
  const targetDate = date || new Date().toISOString().slice(0, 10);
  return completions.some(
    (c) => c.habit_id === habitId && c.completed_date === targetDate
  );
}
