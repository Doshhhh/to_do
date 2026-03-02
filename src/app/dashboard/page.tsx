"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { TodoList } from "@/components/todos/TodoList";
import { CalendarView } from "@/components/calendar/CalendarView";
import { StatsView } from "@/components/stats/StatsView";
import { HabitsView } from "@/components/habits/HabitsView";
import { HabitStats } from "@/components/habits/HabitStats";
import { useCategories } from "@/hooks/useCategories";
import { useTodos } from "@/hooks/useTodos";
import { useHabits } from "@/hooks/useHabits";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import type { Todo } from "@/lib/types";

export default function DashboardPage() {
  const supabase = useSupabase();
  const [user, setUser] = useState<{
    avatar_url: string | null;
    display_name: string | null;
    email: string | null;
  }>({ avatar_url: null, display_name: null, email: null });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [calendarView, setCalendarView] = useState(false);
  const [statsView, setStatsView] = useState(false);
  const [habitsMode, setHabitsMode] = useState(false);

  const { categories, loading: catsLoading } = useCategories();
  const {
    activeTodos,
    completedTodos,
    loading: todosLoading,
    filter: todoFilter,
    setFilter: setTodoFilter,
    sortBy,
    setSortBy,
    addTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    reorderTodos,
    todos,
    allTodos,
  } = useTodos();

  const {
    filteredHabits,
    habits: allHabits,
    completions,
    loading: habitsLoading,
    filter: habitFilter,
    setFilter: setHabitFilter,
    addHabit,
    deleteHabit,
    toggleCompletion,
  } = useHabits();

  // Unified filter — when in habits mode use habitFilter, otherwise todoFilter
  const filter = habitsMode ? habitFilter : todoFilter;
  const setFilter = habitsMode ? setHabitFilter : setTodoFilter;

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser) {
        setUser({
          avatar_url: authUser.user_metadata.avatar_url || null,
          display_name:
            authUser.user_metadata.full_name ||
            authUser.user_metadata.name ||
            null,
          email: authUser.email || null,
        });
      }
    };
    getUser();
  }, [supabase]);

  // Count active todos per category/subcategory
  const todoCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    const activeTodosList = todos.filter((t: Todo) => !t.is_completed);
    counts["all"] = activeTodosList.length;

    for (const todo of activeTodosList) {
      if (todo.category_id) {
        counts[todo.category_id] = (counts[todo.category_id] || 0) + 1;
      }
      if (todo.subcategory_id) {
        counts[todo.subcategory_id] =
          (counts[todo.subcategory_id] || 0) + 1;
      }
    }
    return counts;
  }, [todos]);

  // Count habits per category/subcategory
  const habitCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    counts["all"] = allHabits.length;

    for (const habit of allHabits) {
      if (habit.category_id) {
        counts[habit.category_id] = (counts[habit.category_id] || 0) + 1;
      }
      if (habit.subcategory_id) {
        counts[habit.subcategory_id] =
          (counts[habit.subcategory_id] || 0) + 1;
      }
    }
    return counts;
  }, [allHabits]);

  // Use the right counts based on mode
  const sidebarCounts = habitsMode ? habitCounts : todoCounts;

  const handleAdd = useCallback(
    async (data: {
      title: string;
      description: string | null;
      category_id: string | null;
      subcategory_id: string | null;
      priority: "high" | "medium" | "low";
      deadline: string | null;
    }) => {
      await addTodo(data);
    },
    [addTodo]
  );

  const handleUpdate = useCallback(
    async (id: string, updates: Partial<Todo>) => {
      await updateTodo(id, updates);
    },
    [updateTodo]
  );

  const handleHabitAdd = useCallback(
    async (data: {
      name: string;
      category_id: string;
      subcategory_id: string | null;
      frequency_type: "daily" | "weekly";
      frequency_count: number;
    }) => {
      await addHabit(data);
    },
    [addHabit]
  );

  const handleHabitsToggle = useCallback(() => {
    setHabitsMode((v) => !v);
    setCalendarView(false);
    setStatsView(false);
  }, []);

  if (catsLoading || todosLoading || habitsLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div
          className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{
            borderColor: "var(--separator)",
            borderTopColor: "var(--accent)",
          }}
        />
      </div>
    );
  }

  // Determine which main content to show
  const renderContent = () => {
    if (statsView) {
      if (habitsMode) {
        return (
          <motion.div
            key="habit-stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex"
          >
            <HabitStats
              habits={allHabits}
              completions={completions}
              categories={categories}
            />
          </motion.div>
        );
      }
      return (
        <motion.div
          key="todo-stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex"
        >
          <StatsView todos={allTodos} categories={categories} />
        </motion.div>
      );
    }

    if (calendarView && !habitsMode) {
      return (
        <motion.div
          key="calendar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex"
        >
          <CalendarView
            todos={allTodos}
            categories={categories}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />
        </motion.div>
      );
    }

    if (habitsMode) {
      return (
        <motion.div
          key="habits"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex"
        >
          <HabitsView
            habits={filteredHabits}
            completions={completions}
            categories={categories}
            filter={habitFilter}
            onToggle={toggleCompletion}
            onDelete={deleteHabit}
            onAdd={handleHabitAdd}
          />
        </motion.div>
      );
    }

    return (
      <motion.div
        key="todos"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex-1 flex"
      >
        <TodoList
          activeTodos={activeTodos}
          completedTodos={completedTodos}
          categories={categories}
          filter={todoFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onAdd={handleAdd}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          onUpdate={handleUpdate}
          onReorder={reorderTodos}
        />
      </motion.div>
    );
  };

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <Header
        avatarUrl={user.avatar_url}
        displayName={user.display_name}
        email={user.email}
        onMenuToggle={() => setSidebarOpen(true)}
      />

      <div className="flex flex-1 min-h-0">
        {/* Desktop sidebar */}
        <div className="hidden md:flex h-full">
          <Sidebar
            categories={categories}
            filter={filter}
            onFilterChange={(f) => {
              setFilter(f);
              setCalendarView(false);
              setStatsView(false);
            }}
            todoCounts={sidebarCounts}
            calendarActive={calendarView}
            onCalendarToggle={() => {
              setCalendarView((v) => !v);
              setStatsView(false);
            }}
            statsActive={statsView}
            onStatsToggle={() => {
              setStatsView((v) => !v);
              setCalendarView(false);
            }}
            habitsMode={habitsMode}
            onHabitsToggle={handleHabitsToggle}
          />
        </div>

        {/* Mobile sidebar */}
        <MobileSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          categories={categories}
          filter={filter}
          onFilterChange={(f) => {
            setFilter(f);
            setCalendarView(false);
            setStatsView(false);
          }}
          todoCounts={sidebarCounts}
          calendarActive={calendarView}
          onCalendarToggle={() => {
            setCalendarView((v) => !v);
            setStatsView(false);
          }}
          statsActive={statsView}
          onStatsToggle={() => {
            setStatsView((v) => !v);
            setCalendarView(false);
          }}
          habitsMode={habitsMode}
          onHabitsToggle={handleHabitsToggle}
        />

        {/* Main content with crossfade */}
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>
    </div>
  );
}
