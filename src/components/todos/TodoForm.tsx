"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";
import type { Category, Todo } from "@/lib/types";

interface TodoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string | null;
    category_id: string | null;
    subcategory_id: string | null;
    priority: "high" | "medium" | "low";
    deadline: string | null;
  }) => void;
  categories: Category[];
  initialData?: Partial<Todo>;
  defaultCategoryId?: string | null;
  defaultSubcategoryId?: string | null;
}

export function TodoForm({
  isOpen,
  onClose,
  onSubmit,
  categories,
  initialData,
  defaultCategoryId,
  defaultSubcategoryId,
}: TodoFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [categoryId, setCategoryId] = useState(
    initialData?.category_id || defaultCategoryId || ""
  );
  const [subcategoryId, setSubcategoryId] = useState(
    initialData?.subcategory_id || defaultSubcategoryId || ""
  );
  const [priority, setPriority] = useState<"high" | "medium" | "low">(
    initialData?.priority || "medium"
  );
  const [deadline, setDeadline] = useState(initialData?.deadline || "");

  // Sync form fields when form opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || "");
        setDescription(initialData.description || "");
        setCategoryId(initialData.category_id || defaultCategoryId || "");
        setSubcategoryId(initialData.subcategory_id || defaultSubcategoryId || "");
        setPriority(initialData.priority || "medium");
        setDeadline(initialData.deadline || "");
      } else {
        setCategoryId(defaultCategoryId || "");
        setSubcategoryId(defaultSubcategoryId || "");
        setDeadline("");
      }
    }
  }, [isOpen, initialData, defaultCategoryId, defaultSubcategoryId]);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const subcategories = selectedCategory?.subcategories || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      category_id: categoryId || null,
      subcategory_id: subcategoryId || null,
      priority,
      deadline: deadline || null,
    });

    setTitle("");
    setDescription("");
    setCategoryId(defaultCategoryId || "");
    setSubcategoryId(defaultSubcategoryId || "");
    setPriority("medium");
    setDeadline("");
    onClose();
  };

  const inputStyle = {
    backgroundColor: "var(--bg-primary)",
    borderColor: "var(--separator)",
    color: "var(--text-primary)",
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Редактировать задачу" : "Новая задача"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            className="block text-sm mb-1"
            style={{ color: "var(--text-secondary)" }}
          >
            Название *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
            style={inputStyle}
            placeholder="Что нужно сделать?"
            autoFocus
          />
        </div>

        <div>
          <label
            className="block text-sm mb-1"
            style={{ color: "var(--text-secondary)" }}
          >
            Описание
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none focus:ring-2 focus:ring-[var(--accent)]/30"
            style={inputStyle}
            rows={3}
            placeholder="Подробности..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              className="block text-sm mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Категория *
            </label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setSubcategoryId("");
              }}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none cursor-pointer"
              style={inputStyle}
            >
              <option value="">Выберите...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="block text-sm mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Подкатегория
            </label>
            <select
              value={subcategoryId}
              onChange={(e) => setSubcategoryId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none cursor-pointer"
              style={inputStyle}
              disabled={subcategories.length === 0}
            >
              <option value="">—</option>
              {subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              className="block text-sm mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Приоритет
            </label>
            <select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as "high" | "medium" | "low")
              }
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none cursor-pointer"
              style={inputStyle}
            >
              <option value="high">Высокий</option>
              <option value="medium">Средний</option>
              <option value="low">Низкий</option>
            </select>
          </div>

          <div>
            <label
              className="block text-sm mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Дедлайн
            </label>
            <DatePicker value={deadline} onChange={setDeadline} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" disabled={!title.trim() || !categoryId}>
            {initialData ? "Сохранить" : "Создать"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
