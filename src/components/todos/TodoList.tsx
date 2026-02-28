"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AnimatePresence, motion } from "framer-motion";
import { ClipboardList } from "lucide-react";
import { TodoItem } from "./TodoItem";
import { TodoForm } from "./TodoForm";
import { TodoSortControls } from "./TodoSortControls";
import { CompletedSection } from "./CompletedSection";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { CATEGORY_NAME_MAP } from "@/lib/i18n";
import type { Todo, Category, CategoryFilter, SortOption } from "@/lib/types";

interface TodoListProps {
  activeTodos: Todo[];
  completedTodos: Todo[];
  categories: Category[];
  filter: CategoryFilter;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onAdd: (data: {
    title: string;
    description: string | null;
    category_id: string | null;
    subcategory_id: string | null;
    priority: "high" | "medium" | "low";
    deadline: string | null;
  }) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onReorder: (activeId: string, overId: string) => void;
}

export function TodoList({
  activeTodos,
  completedTodos,
  categories,
  filter,
  sortBy,
  onSortChange,
  onAdd,
  onToggle,
  onDelete,
  onUpdate,
  onReorder,
}: TodoListProps) {
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(active.id as string, over.id as string);
    }
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
  };

  const handleEditSubmit = (data: {
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
  };

  // Get current category/subcategory title for breadcrumb
  const currentCategory = filter.categoryId
    ? categories.find((c) => c.id === filter.categoryId)
    : null;
  const currentSubcategory =
    filter.subcategoryId && currentCategory?.subcategories
      ? currentCategory.subcategories.find(
          (s) => s.id === filter.subcategoryId
        )
      : null;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1
          className="text-lg font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {currentCategory
            ? currentSubcategory
              ? `${CATEGORY_NAME_MAP[currentCategory.name] ? t(CATEGORY_NAME_MAP[currentCategory.name]) : currentCategory.name} > ${CATEGORY_NAME_MAP[currentSubcategory.name] ? t(CATEGORY_NAME_MAP[currentSubcategory.name]) : currentSubcategory.name}`
              : CATEGORY_NAME_MAP[currentCategory.name] ? t(CATEGORY_NAME_MAP[currentCategory.name]) : currentCategory.name
            : t("sidebar.allTasks")}
        </h1>
        <TodoSortControls sortBy={sortBy} onChange={onSortChange} />
      </div>

      {/* Active todos */}
      {activeTodos.length === 0 && completedTodos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <ClipboardList
              size={48}
              style={{ color: "var(--text-secondary)" }}
            />
          </motion.div>
          <p
            className="mt-4 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            {t("empty.noTasks")}
          </p>
        </motion.div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={activeTodos.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {activeTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    categories={categories}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onEdit={handleEdit}
                  />
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Completed section */}
      <CompletedSection
        todos={completedTodos}
        categories={categories}
        onToggle={onToggle}
        onDelete={onDelete}
        onEdit={handleEdit}
      />

      {/* FAB */}
      <FloatingActionButton onClick={() => setShowForm(true)} />

      {/* Create form */}
      <TodoForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={onAdd}
        categories={categories}
        defaultCategoryId={filter.categoryId}
        defaultSubcategoryId={filter.subcategoryId}
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
