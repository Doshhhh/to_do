"use client";

import { useCallback, useEffect, useState } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import type { Todo, CategoryFilter, SortOption } from "@/lib/types";
import { sortTodos } from "@/lib/utils";

export function useTodos() {
  const supabase = useSupabase();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CategoryFilter>({
    categoryId: null,
    subcategoryId: null,
  });
  const [sortBy, setSortBy] = useState<SortOption>("created_at");

  const fetchTodos = useCallback(async () => {
    let query = supabase
      .from("todos")
      .select("*")
      .order("sort_order", { ascending: true });

    if (filter.subcategoryId) {
      query = query.eq("subcategory_id", filter.subcategoryId);
    } else if (filter.categoryId) {
      query = query.eq("category_id", filter.categoryId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching todos:", error);
    } else {
      setTodos(data || []);
    }
    setLoading(false);
  }, [supabase, filter]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const addTodo = async (
    todo: Omit<
      Todo,
      | "id"
      | "user_id"
      | "is_completed"
      | "completed_at"
      | "sort_order"
      | "created_at"
      | "updated_at"
    >
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("todos")
      .insert({
        ...todo,
        user_id: user.id,
        sort_order: todos.length,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding todo:", error);
      return null;
    }

    setTodos((prev) => [...prev, data]);
    return data;
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    const { error } = await supabase
      .from("todos")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Error updating todo:", error);
      return;
    }

    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const updates = {
      is_completed: !todo.is_completed,
      completed_at: !todo.is_completed ? new Date().toISOString() : null,
    };

    await updateTodo(id, updates);
  };

  const deleteTodo = async (id: string) => {
    const { error } = await supabase.from("todos").delete().eq("id", id);

    if (error) {
      console.error("Error deleting todo:", error);
      return;
    }

    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const reorderTodos = async (activeId: string, overId: string) => {
    const oldIndex = todos.findIndex((t) => t.id === activeId);
    const newIndex = todos.findIndex((t) => t.id === overId);

    if (oldIndex === -1 || newIndex === -1) return;

    const newTodos = [...todos];
    const [moved] = newTodos.splice(oldIndex, 1);
    newTodos.splice(newIndex, 0, moved);

    const updatedTodos = newTodos.map((t, i) => ({ ...t, sort_order: i }));
    setTodos(updatedTodos);

    // Update sort orders in DB
    for (const todo of updatedTodos) {
      await supabase
        .from("todos")
        .update({ sort_order: todo.sort_order })
        .eq("id", todo.id);
    }
  };

  const activeTodos = sortTodos(
    todos.filter((t) => !t.is_completed),
    sortBy
  );
  const completedTodos = todos.filter((t) => t.is_completed);

  return {
    todos,
    activeTodos,
    completedTodos,
    loading,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    addTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    reorderTodos,
    refetch: fetchTodos,
  };
}
