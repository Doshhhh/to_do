"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { TodoList } from "@/components/todos/TodoList";
import { CalendarView } from "@/components/calendar/CalendarView";
import { useCategories } from "@/hooks/useCategories";
import { useTodos } from "@/hooks/useTodos";
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

  const { categories, loading: catsLoading } = useCategories();
  const {
    activeTodos,
    completedTodos,
    loading: todosLoading,
    filter,
    setFilter,
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

  if (catsLoading || todosLoading) {
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
            }}
            todoCounts={todoCounts}
            calendarActive={calendarView}
            onCalendarToggle={() => setCalendarView((v) => !v)}
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
          }}
          todoCounts={todoCounts}
          calendarActive={calendarView}
          onCalendarToggle={() => setCalendarView((v) => !v)}
        />

        {/* Main content */}
        {calendarView ? (
          <CalendarView
            todos={allTodos}
            categories={categories}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />
        ) : (
          <TodoList
            activeTodos={activeTodos}
            completedTodos={completedTodos}
            categories={categories}
            filter={filter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onAdd={handleAdd}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onUpdate={handleUpdate}
            onReorder={reorderTodos}
          />
        )}
      </div>
    </div>
  );
}
