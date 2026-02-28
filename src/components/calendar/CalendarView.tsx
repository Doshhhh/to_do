"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TodoForm } from "@/components/todos/TodoForm";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { MONTH_KEYS, WEEKDAY_KEYS } from "@/lib/i18n";
import type { Todo, Category } from "@/lib/types";

interface CalendarViewProps {
  todos: Todo[];
  categories: Category[];
  onAdd: (data: {
    title: string;
    description: string | null;
    category_id: string | null;
    subcategory_id: string | null;
    priority: "high" | "medium" | "low";
    deadline: string | null;
  }) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const MAX_VISIBLE_TASKS = 2;

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function CalendarView({
  todos,
  categories,
  onAdd,
  onUpdate,
  onToggle,
  onDelete,
}: CalendarViewProps) {
  const { isDark } = useTheme();
  const { t, language } = useLanguage();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [direction, setDirection] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [defaultDeadline, setDefaultDeadline] = useState<string | null>(null);
  const [mobileDayPopup, setMobileDayPopup] = useState<string | null>(null);

  // Group todos by deadline date
  const todosByDate = useMemo(() => {
    const map: Record<string, Todo[]> = {};
    for (const todo of todos) {
      if (todo.deadline) {
        const key = todo.deadline.split("T")[0];
        if (!map[key]) map[key] = [];
        map[key].push(todo);
      }
    }
    return map;
  }, [todos]);

  // Category color lookup
  const categoryColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const cat of categories) {
      map[cat.id] = isDark ? cat.color_dark : cat.color_light;
    }
    return map;
  }, [categories, isDark]);

  const navigateMonth = useCallback((delta: number) => {
    setDirection(delta);
    setCurrentMonth((prev) => {
      let newMonth = prev + delta;
      let newYear = currentYear;
      if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      }
      setCurrentYear(newYear);
      return newMonth;
    });
  }, [currentYear]);

  const goToToday = useCallback(() => {
    const t2 = new Date();
    setDirection(0);
    setCurrentYear(t2.getFullYear());
    setCurrentMonth(t2.getMonth());
  }, []);

  const handleDayClick = useCallback((dateKey: string) => {
    setDefaultDeadline(dateKey);
    setShowForm(true);
  }, []);

  const handleMobileDayClick = useCallback((dateKey: string) => {
    setMobileDayPopup((prev) => (prev === dateKey ? null : dateKey));
  }, []);

  const handleTaskClick = useCallback((todo: Todo, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTodo(todo);
  }, []);

  const handleEditSubmit = useCallback(
    (data: {
      title: string;
      description: string | null;
      category_id: string | null;
      subcategory_id: string | null;
      priority: "high" | "medium" | "low";
      deadline: string | null;
    }) => {
      if (editingTodo) {
        onUpdate(editingTodo.id, data);
        setEditingTodo(null);
      }
    },
    [editingTodo, onUpdate]
  );

  const handleAddSubmit = useCallback(
    (data: {
      title: string;
      description: string | null;
      category_id: string | null;
      subcategory_id: string | null;
      priority: "high" | "medium" | "low";
      deadline: string | null;
    }) => {
      onAdd(data);
      setShowForm(false);
      setDefaultDeadline(null);
    },
    [onAdd]
  );

  // Build calendar grid
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfWeek(currentYear, currentMonth);
  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  // Previous month fill
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  const cells: { day: number; dateKey: string; isCurrentMonth: boolean }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    cells.push({
      day: d,
      dateKey: formatDateKey(prevYear, prevMonth, d),
      isCurrentMonth: false,
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      dateKey: formatDateKey(currentYear, currentMonth, d),
      isCurrentMonth: true,
    });
  }

  // Next month fill
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      cells.push({
        day: d,
        dateKey: formatDateKey(nextYear, nextMonth, d),
        isCurrentMonth: false,
      });
    }
  }

  const weeks: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 rounded-lg hover:bg-[var(--separator)] cursor-pointer"
            style={{ color: "var(--text-primary)" }}
          >
            <ChevronLeft size={20} />
          </button>
          <h1
            className="text-lg font-semibold min-w-[200px] text-center"
            style={{ color: "var(--text-primary)" }}
          >
            {t(MONTH_KEYS[currentMonth])} {currentYear}
          </h1>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 rounded-lg hover:bg-[var(--separator)] cursor-pointer"
            style={{ color: "var(--text-primary)" }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <Button variant="secondary" onClick={goToToday}>
          {t("calendar.today")}
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAY_KEYS.map((key) => (
          <div
            key={key}
            className="text-center text-xs font-medium py-2"
            style={{ color: "var(--text-secondary)" }}
          >
            {t(key)}
          </div>
        ))}
      </div>

      {/* Calendar grid with animation */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`${currentYear}-${currentMonth}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div
              className="border rounded-xl overflow-hidden"
              style={{ borderColor: "var(--separator)" }}
            >
              {weeks.map((week, wi) => (
                <div
                  key={wi}
                  className="grid grid-cols-7"
                  style={{
                    borderTop: wi > 0 ? `1px solid var(--separator)` : undefined,
                  }}
                >
                  {week.map((cell) => {
                    const isToday = cell.dateKey === todayKey;
                    const dayTodos = todosByDate[cell.dateKey] || [];

                    return (
                      <div
                        key={cell.dateKey}
                        onClick={() => {
                          if (window.innerWidth < 768 && dayTodos.length > 0) {
                            handleMobileDayClick(cell.dateKey);
                          } else {
                            handleDayClick(cell.dateKey);
                          }
                        }}
                        className="min-h-[100px] md:min-h-[120px] p-1.5 cursor-pointer hover:bg-[var(--separator)]/30 relative group"
                        style={{
                          borderLeft: `1px solid var(--separator)`,
                          backgroundColor: isToday
                            ? "var(--accent)" + "0D"
                            : undefined,
                          opacity: cell.isCurrentMonth ? 1 : 0.4,
                        }}
                      >
                        {/* Day number */}
                        <div
                          className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                            isToday ? "text-white" : ""
                          }`}
                          style={{
                            backgroundColor: isToday
                              ? "var(--accent)"
                              : undefined,
                            color: isToday
                              ? "#fff"
                              : cell.isCurrentMonth
                              ? "var(--text-primary)"
                              : "var(--text-secondary)",
                          }}
                        >
                          {cell.day}
                        </div>

                        {/* Desktop: task chips */}
                        <div className="hidden md:block space-y-0.5">
                          {dayTodos.slice(0, MAX_VISIBLE_TASKS).map((todo) => {
                            const color =
                              (todo.category_id && categoryColorMap[todo.category_id]) ||
                              "var(--accent)";
                            return (
                              <div
                                key={todo.id}
                                onClick={(e) => handleTaskClick(todo, e)}
                                className="text-[10px] leading-tight px-1.5 py-0.5 rounded truncate cursor-pointer hover:brightness-110"
                                style={{
                                  backgroundColor: color + "20",
                                  color: todo.is_completed
                                    ? "var(--text-secondary)"
                                    : color,
                                  textDecoration: todo.is_completed
                                    ? "line-through"
                                    : undefined,
                                  opacity: todo.is_completed ? 0.6 : 1,
                                }}
                                title={todo.title}
                              >
                                {todo.title}
                              </div>
                            );
                          })}
                          {dayTodos.length > MAX_VISIBLE_TASKS && (
                            <div
                              className="text-[10px] px-1.5 py-0.5 rounded cursor-pointer"
                              style={{
                                color: "var(--text-secondary)",
                                backgroundColor: "var(--separator)",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMobileDayClick(cell.dateKey);
                              }}
                            >
                              +{dayTodos.length - MAX_VISIBLE_TASKS} {t("calendar.more")}
                            </div>
                          )}
                        </div>

                        {/* Mobile: colored dots */}
                        <div className="flex flex-wrap gap-0.5 md:hidden">
                          {dayTodos.slice(0, 5).map((todo) => {
                            const color =
                              (todo.category_id && categoryColorMap[todo.category_id]) ||
                              "var(--accent)";
                            return (
                              <div
                                key={todo.id}
                                className="w-1.5 h-1.5 rounded-full"
                                style={{
                                  backgroundColor: color,
                                  opacity: todo.is_completed ? 0.4 : 1,
                                }}
                              />
                            );
                          })}
                          {dayTodos.length > 5 && (
                            <span
                              className="text-[8px]"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              +{dayTodos.length - 5}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile day popup */}
      <AnimatePresence>
        {mobileDayPopup && (todosByDate[mobileDayPopup] || []).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-3 rounded-xl border p-3"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--separator)",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {new Date(mobileDayPopup + "T00:00:00").toLocaleDateString(language === "en" ? "en-US" : "ru-RU", {
                  day: "numeric",
                  month: "long",
                })}
              </span>
              <button
                onClick={() => {
                  setMobileDayPopup(null);
                  handleDayClick(mobileDayPopup);
                }}
                className="text-xs px-2 py-1 rounded-lg"
                style={{
                  color: "var(--accent)",
                  backgroundColor: "var(--accent)" + "15",
                }}
              >
                {t("calendar.addTask")}
              </button>
            </div>
            <div className="space-y-1.5">
              {(todosByDate[mobileDayPopup] || []).map((todo) => {
                const color =
                  (todo.category_id && categoryColorMap[todo.category_id]) ||
                  "var(--accent)";
                return (
                  <div
                    key={todo.id}
                    onClick={() => setEditingTodo(todo)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-[var(--separator)]/50"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span
                      className="text-sm truncate"
                      style={{
                        color: todo.is_completed
                          ? "var(--text-secondary)"
                          : "var(--text-primary)",
                        textDecoration: todo.is_completed
                          ? "line-through"
                          : undefined,
                        opacity: todo.is_completed ? 0.6 : 1,
                      }}
                    >
                      {todo.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create form */}
      <TodoForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setDefaultDeadline(null);
        }}
        onSubmit={handleAddSubmit}
        categories={categories}
        initialData={defaultDeadline ? { deadline: defaultDeadline } : undefined}
      />

      {/* Edit form */}
      {editingTodo && (
        <TodoForm
          isOpen={!!editingTodo}
          onClose={() => setEditingTodo(null)}
          onSubmit={handleEditSubmit}
          categories={categories}
          initialData={editingTodo}
        />
      )}
    </div>
  );
}
