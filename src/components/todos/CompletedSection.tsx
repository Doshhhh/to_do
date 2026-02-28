"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CheckCircle2 } from "lucide-react";
import { TodoItem } from "./TodoItem";
import { useLanguage } from "@/components/providers/LanguageProvider";
import type { Todo, Category } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CompletedSectionProps {
  todos: Todo[];
  categories: Category[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
}

export function CompletedSection({
  todos,
  categories,
  onToggle,
  onDelete,
  onEdit,
}: CompletedSectionProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  if (todos.length === 0) return null;

  return (
    <div className="mt-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium cursor-pointer"
        style={{ color: "var(--text-secondary)" }}
      >
        <CheckCircle2 size={16} style={{ color: "var(--success)" }} />
        <span>{t("completed.title")} ({todos.length})</span>
        <ChevronDown
          size={14}
          className={cn(
            "transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 mt-2 opacity-70">
              {todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  categories={categories}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
