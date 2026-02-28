import { type Todo } from "./types";

export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function isOverdue(todo: Todo): boolean {
  if (!todo.deadline || todo.is_completed) return false;
  return new Date(todo.deadline) < new Date(new Date().toDateString());
}

export function formatDate(date: string, locale: string = "ru-RU"): string {
  return new Date(date).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
  });
}

export function sortTodos(
  todos: Todo[],
  sortBy: "deadline" | "priority" | "created_at"
): Todo[] {
  const priorityOrder = { high: 0, medium: 1, low: 2 };

  return [...todos].sort((a, b) => {
    if (sortBy === "priority") {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    if (sortBy === "deadline") {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    return (
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  });
}
