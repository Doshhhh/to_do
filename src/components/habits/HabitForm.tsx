"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { CATEGORY_NAME_MAP } from "@/lib/i18n";
import type { Category } from "@/lib/types";

interface HabitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    category_id: string;
    subcategory_id: string | null;
    frequency_type: "daily" | "weekly";
    frequency_count: number;
  }) => void;
  categories: Category[];
  defaultCategoryId?: string | null;
  defaultSubcategoryId?: string | null;
}

export function HabitForm({
  isOpen,
  onClose,
  onSubmit,
  categories,
  defaultCategoryId,
  defaultSubcategoryId,
}: HabitFormProps) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [frequencyType, setFrequencyType] = useState<"daily" | "weekly">("daily");
  const [frequencyCount, setFrequencyCount] = useState(3);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setCategoryId(defaultCategoryId || "");
      setSubcategoryId(defaultSubcategoryId || "");
      setFrequencyType("daily");
      setFrequencyCount(3);
    }
  }, [isOpen, defaultCategoryId, defaultSubcategoryId]);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const subcategories = selectedCategory?.subcategories || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) return;

    onSubmit({
      name: name.trim(),
      category_id: categoryId,
      subcategory_id: subcategoryId || null,
      frequency_type: frequencyType,
      frequency_count: frequencyType === "daily" ? 1 : frequencyCount,
    });

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
      title={t("habits.newHabit")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            className="block text-sm mb-1"
            style={{ color: "var(--text-secondary)" }}
          >
            {t("habits.name")}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
            style={inputStyle}
            placeholder={t("habits.namePlaceholder")}
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              className="block text-sm mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("form.category")}
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
              <option value="">{t("form.categoryPlaceholder")}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {CATEGORY_NAME_MAP[cat.name]
                    ? t(CATEGORY_NAME_MAP[cat.name])
                    : cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="block text-sm mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("form.subcategory")}
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
                  {CATEGORY_NAME_MAP[sub.name]
                    ? t(CATEGORY_NAME_MAP[sub.name])
                    : sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            className="block text-sm mb-1"
            style={{ color: "var(--text-secondary)" }}
          >
            {t("habits.frequency")}
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFrequencyType("daily")}
              className="flex-1 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
              style={{
                backgroundColor:
                  frequencyType === "daily"
                    ? "var(--accent)"
                    : "var(--bg-primary)",
                color:
                  frequencyType === "daily" ? "#fff" : "var(--text-secondary)",
                border: `1px solid ${frequencyType === "daily" ? "var(--accent)" : "var(--separator)"}`,
              }}
            >
              {t("habits.daily")}
            </button>
            <button
              type="button"
              onClick={() => setFrequencyType("weekly")}
              className="flex-1 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
              style={{
                backgroundColor:
                  frequencyType === "weekly"
                    ? "var(--accent)"
                    : "var(--bg-primary)",
                color:
                  frequencyType === "weekly" ? "#fff" : "var(--text-secondary)",
                border: `1px solid ${frequencyType === "weekly" ? "var(--accent)" : "var(--separator)"}`,
              }}
            >
              {t("habits.timesPerWeek")}
            </button>
          </div>
        </div>

        {frequencyType === "weekly" && (
          <div>
            <label
              className="block text-sm mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("habits.timesPerWeek")}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setFrequencyCount(n)}
                  className="w-10 h-10 rounded-lg text-sm font-medium cursor-pointer transition-colors"
                  style={{
                    backgroundColor:
                      frequencyCount === n
                        ? "var(--accent)"
                        : "var(--bg-primary)",
                    color:
                      frequencyCount === n ? "#fff" : "var(--text-secondary)",
                    border: `1px solid ${frequencyCount === n ? "var(--accent)" : "var(--separator)"}`,
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t("form.cancel")}
          </Button>
          <Button type="submit" disabled={!name.trim() || !categoryId}>
            {t("form.create")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
