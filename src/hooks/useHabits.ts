"use client";

import { useCallback, useEffect, useState } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import type { Habit, HabitCompletion, HabitFrequencyType, CategoryFilter } from "@/lib/types";

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
    } else {
      setHabits(data || []);
    }
  }, [supabase]);

  const fetchCompletions = useCallback(async () => {
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
    frequency_type: HabitFrequencyType;
    frequency_count: number;
    frequency_days: number[] | null;
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
        frequency_days: habit.frequency_days,
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
      setCompletions((prev) => prev.filter((c) => c.id !== existing.id));

      const { error } = await supabase
        .from("habit_completions")
        .delete()
        .eq("id", existing.id);

      if (error) {
        console.error("Error removing completion:", error);
        setCompletions((prev) => [existing, ...prev]);
      }
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

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
        setCompletions((prev) => prev.filter((c) => c.id !== tempId));
      } else {
        setCompletions((prev) =>
          prev.map((c) => (c.id === tempId ? data : c))
        );
      }
    }
  };

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

// ─── Helpers ────────────────────────────────────────────────

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const offset = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - offset);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getFirstOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Check if a habit is "due" (expected) on a given date */
export function isHabitDueOnDate(habit: Habit, date?: string): boolean {
  const target = date ? new Date(date + "T00:00:00") : new Date();

  switch (habit.frequency_type) {
    case "daily":
      return true;

    case "specific_days": {
      // 0=Mon .. 6=Sun in our system; JS getDay(): 0=Sun,1=Mon..6=Sat
      const jsDay = target.getDay();
      const ourDay = jsDay === 0 ? 6 : jsDay - 1;
      return (habit.frequency_days || []).includes(ourDay);
    }

    case "times_per_week":
      // Always due — user picks any days
      return true;

    case "times_per_month":
      // Always due — user picks any days
      return true;

    case "every_n_days": {
      const created = new Date(habit.created_at.slice(0, 10) + "T00:00:00");
      const diff = Math.floor(
        (target.getTime() - created.getTime()) / 86400000
      );
      return diff >= 0 && diff % habit.frequency_count === 0;
    }

    default:
      return true;
  }
}

/** Progress within the current period for a habit */
export function periodProgress(
  habit: Habit,
  completions: HabitCompletion[]
): { done: number; target: number } {
  const today = new Date();

  switch (habit.frequency_type) {
    case "daily":
      return {
        done: completions.some(
          (c) => c.habit_id === habit.id && c.completed_date === dateStr(today)
        )
          ? 1
          : 0,
        target: 1,
      };

    case "specific_days": {
      const monday = getMondayOfWeek(today);
      const mondayStr = dateStr(monday);
      const done = completions.filter(
        (c) => c.habit_id === habit.id && c.completed_date >= mondayStr
      ).length;
      return { done, target: (habit.frequency_days || []).length };
    }

    case "times_per_week": {
      const monday = getMondayOfWeek(today);
      const mondayStr = dateStr(monday);
      const done = completions.filter(
        (c) => c.habit_id === habit.id && c.completed_date >= mondayStr
      ).length;
      return { done, target: habit.frequency_count };
    }

    case "times_per_month": {
      const first = getFirstOfMonth(today);
      const firstStr = dateStr(first);
      const done = completions.filter(
        (c) => c.habit_id === habit.id && c.completed_date >= firstStr
      ).length;
      return { done, target: habit.frequency_count };
    }

    case "every_n_days": {
      // For every_n_days, progress is binary: done today or not
      return {
        done: completions.some(
          (c) => c.habit_id === habit.id && c.completed_date === dateStr(today)
        )
          ? 1
          : 0,
        target: 1,
      };
    }

    default:
      return { done: 0, target: 1 };
  }
}

/** Legacy helper kept for backward compat */
export function weeklyProgress(
  habitId: string,
  completions: HabitCompletion[]
): number {
  const today = new Date();
  const monday = getMondayOfWeek(today);
  const mondayStr = dateStr(monday);

  return completions.filter(
    (c) => c.habit_id === habitId && c.completed_date >= mondayStr
  ).length;
}

/** Calculate streak for a habit */
export function calculateStreak(
  habitId: string,
  completions: HabitCompletion[],
  frequencyType: HabitFrequencyType,
  habit?: Habit
): number {
  const habitCompletions = completions
    .filter((c) => c.habit_id === habitId)
    .map((c) => c.completed_date)
    .sort()
    .reverse();

  if (habitCompletions.length === 0) return 0;

  const completionSet = new Set(habitCompletions);

  if (frequencyType === "daily") {
    let streak = 0;
    const today = dateStr(new Date());
    const yesterday = dateStr(new Date(Date.now() - 86400000));

    if (habitCompletions[0] !== today && habitCompletions[0] !== yesterday) {
      return 0;
    }

    let checkDate = new Date(habitCompletions[0]);
    while (completionSet.has(dateStr(checkDate))) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
  }

  if (frequencyType === "specific_days" && habit) {
    // Streak = consecutive "due" days completed
    let streak = 0;
    const today = new Date();
    let checkDate = new Date(today);

    // Start from today or yesterday
    if (!completionSet.has(dateStr(checkDate))) {
      checkDate.setDate(checkDate.getDate() - 1);
      if (!isHabitDueOnDate(habit, dateStr(checkDate)) || !completionSet.has(dateStr(checkDate))) {
        return 0;
      }
    }

    for (let i = 0; i < 365; i++) {
      const ds = dateStr(checkDate);
      if (isHabitDueOnDate(habit, ds)) {
        if (completionSet.has(ds)) {
          streak++;
        } else {
          break;
        }
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
  }

  if (frequencyType === "every_n_days" && habit) {
    let streak = 0;
    const today = new Date();
    let checkDate = new Date(today);

    if (!completionSet.has(dateStr(checkDate))) {
      checkDate.setDate(checkDate.getDate() - 1);
      if (!isHabitDueOnDate(habit, dateStr(checkDate)) || !completionSet.has(dateStr(checkDate))) {
        return 0;
      }
    }

    for (let i = 0; i < 365; i++) {
      const ds = dateStr(checkDate);
      if (isHabitDueOnDate(habit, ds)) {
        if (completionSet.has(ds)) {
          streak++;
        } else {
          break;
        }
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
  }

  // times_per_week or times_per_month — count consecutive periods with enough completions
  if (frequencyType === "times_per_week") {
    let streak = 0;
    const today = new Date();
    let weekStart = getMondayOfWeek(today);

    for (let w = 0; w < 52; w++) {
      let count = 0;
      for (let d = 0; d < 7; d++) {
        const check = new Date(weekStart);
        check.setDate(weekStart.getDate() + d);
        if (completionSet.has(dateStr(check))) count++;
      }
      const target = habit ? habit.frequency_count : 1;
      if (count >= target) {
        streak++;
      } else if (w > 0) {
        break;
      } else {
        break;
      }
      weekStart.setDate(weekStart.getDate() - 7);
    }
    return streak;
  }

  if (frequencyType === "times_per_month") {
    let streak = 0;
    const today = new Date();
    let monthStart = getFirstOfMonth(today);

    for (let m = 0; m < 12; m++) {
      const nextMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
      let count = 0;
      const d = new Date(monthStart);
      while (d < nextMonth) {
        if (completionSet.has(dateStr(d))) count++;
        d.setDate(d.getDate() + 1);
      }
      const target = habit ? habit.frequency_count : 1;
      if (count >= target) {
        streak++;
      } else if (m > 0) {
        break;
      } else {
        break;
      }
      monthStart = new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1);
    }
    return streak;
  }

  return 0;
}

/** Check if habit is completed on a given date */
export function isCompletedOnDate(
  habitId: string,
  completions: HabitCompletion[],
  date?: string
): boolean {
  const targetDate = date || dateStr(new Date());
  return completions.some(
    (c) => c.habit_id === habitId && c.completed_date === targetDate
  );
}
