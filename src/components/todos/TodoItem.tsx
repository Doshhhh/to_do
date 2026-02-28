"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, GripVertical, Calendar } from "lucide-react";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Todo, Category } from "@/lib/types";
import { cn, isOverdue, formatDate } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface TodoItemProps {
  todo: Todo;
  categories: Category[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
}

export function TodoItem({
  todo,
  categories,
  onToggle,
  onDelete,
  onEdit,
}: TodoItemProps) {
  const { isDark } = useTheme();
  const { t, language } = useLanguage();
  const [showDelete, setShowDelete] = useState(false);
  const overdue = isOverdue(todo);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const category = categories.find((c) => c.id === todo.category_id);
  const categoryColor = category
    ? isDark
      ? category.color_dark
      : category.color_light
    : undefined;

  return (
    <>
      <motion.div
        ref={setNodeRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0 }}
        transition={{ duration: 0.2 }}
        whileHover={{ scale: 1.005 }}
        className={cn(
          "group rounded-xl p-4 border cursor-pointer",
          isDragging && "opacity-50 shadow-lg z-10",
          overdue && "ring-1 ring-red-400/50"
        )}
        style={{
          ...style,
          backgroundColor: "var(--bg-card)",
          borderColor: overdue ? "rgba(239,68,68,0.3)" : "var(--separator)",
        }}
      >
        <div className="flex items-start gap-3">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none"
            style={{ color: "var(--text-secondary)" }}
          >
            <GripVertical size={16} />
          </button>

          {/* Checkbox */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(todo.id);
            }}
            className="mt-0.5 cursor-pointer"
          >
            <motion.div
              whileTap={{ scale: 1.3 }}
              className={cn(
                "w-5 h-5 rounded-md border-2 flex items-center justify-center",
                todo.is_completed && "border-[var(--success)] bg-[var(--success)]"
              )}
              style={{
                borderColor: todo.is_completed
                  ? "var(--success)"
                  : "var(--separator)",
              }}
            >
              {todo.is_completed && (
                <motion.svg
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <motion.path
                    d="M2 6L5 9L10 3"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              )}
            </motion.div>
          </button>

          {/* Content */}
          <div
            className="flex-1 min-w-0"
            onClick={() => onEdit(todo)}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "text-sm font-medium",
                  todo.is_completed && "line-through opacity-60"
                )}
                style={{ color: "var(--text-primary)" }}
              >
                {todo.title}
              </span>
              {categoryColor && (
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: categoryColor }}
                />
              )}
            </div>

            {todo.description && (
              <p
                className="text-xs mt-1 line-clamp-1"
                style={{ color: "var(--text-secondary)" }}
              >
                {todo.description}
              </p>
            )}

            <div className="flex items-center gap-3 mt-2">
              {!todo.is_completed && (
                <PriorityBadge priority={todo.priority} size="sm" />
              )}
              {todo.deadline && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-xs",
                    overdue && "text-red-500"
                  )}
                  style={{
                    color: overdue ? undefined : "var(--text-secondary)",
                  }}
                >
                  <Calendar size={12} />
                  {formatDate(todo.deadline, language === "en" ? "en-US" : "ru-RU")}
                </span>
              )}
            </div>
          </div>

          {/* Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDelete(true);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer"
            style={{ color: "var(--text-secondary)" }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </motion.div>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => onDelete(todo.id)}
        title={t("confirm.deleteTask")}
        message={`"${todo.title}" ${t("confirm.deleteMessage")}`}
      />
    </>
  );
}
