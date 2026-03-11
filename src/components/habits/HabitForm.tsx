"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { CATEGORY_NAME_MAP, WEEKDAY_KEYS } from "@/lib/i18n";
import type { Category, HabitFrequencyType } from "@/lib/types";

interface HabitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    category_id: string;
    subcategory_id: string | null;
    frequency_type: HabitFrequencyType;
    frequency_count: number;
    frequency_days: number[] | null;
  }) => void;
  categories: Category[];
  defaultCategoryId?: string | null;
  defaultSubcategoryId?: string | null;
}

const FREQUENCY_TYPES: { key: HabitFrequencyType; labelKey: string }[] = [
  { key: "daily", labelKey: "habits.daily" },
  { key: "specific_days", labelKey: "habits.specificDays" },
  { key: "times_per_week", labelKey: "habits.timesPerWeek" },
  { key: "times_per_month", labelKey: "habits.timesPerMonth" },
  { key: "every_n_days", labelKey: "habits.everyNDays" },
];

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
  const [frequencyType, setFrequencyType] = useState<HabitFrequencyType>("daily");
  const [frequencyCount, setFrequencyCount] = useState(3);
  const [frequencyDays, setFrequencyDays] = useState<number[]>([0, 2, 4]); // Mon, Wed, Fri

  useEffect(() => {
    if (isOpen) {
      setName("");
      setCategoryId(defaultCategoryId || "");
      setSubcategoryId(defaultSubcategoryId || "");
      setFrequencyType("daily");
      setFrequencyCount(3);
      setFrequencyDays([0, 2, 4]);
    }
  }, [isOpen, defaultCategoryId, defaultSubcategoryId]);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const subcategories = selectedCategory?.subcategories || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) return;

    let count = 1;
    let days: number[] | null = null;

    switch (frequencyType) {
      case "daily":
        count = 1;
        break;
      case "specific_days":
        days = [...frequencyDays].sort();
        count = days.length;
        break;
      case "times_per_week":
        count = frequencyCount;
        break;
      case "times_per_month":
        count = frequencyCount;
        break;
      case "every_n_days":
        count = frequencyCount;
        break;
    }

    onSubmit({
      name: name.trim(),
      category_id: categoryId,
      subcategory_id: subcategoryId || null,
      frequency_type: frequencyType,
      frequency_count: count,
      frequency_days: days,
    });

    onClose();
  };

  const toggleDay = (day: number) => {
    setFrequencyDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const inputStyle = {
    backgroundColor: "var(--bg-primary)",
    borderColor: "var(--separator)",
    color: "var(--text-primary)",
  };

  const pillStyle = (active: boolean) => ({
    backgroundColor: active ? "var(--accent)" : "var(--bg-primary)",
    color: active ? "#fff" : "var(--text-secondary)",
    border: `1px solid ${active ? "var(--accent)" : "var(--separator)"}`,
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("habits.newHabit")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
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

        {/* Category / Subcategory */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
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
                  {CATEGORY_NAME_MAP[cat.name] ? t(CATEGORY_NAME_MAP[cat.name]) : cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
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
                  {CATEGORY_NAME_MAP[sub.name] ? t(CATEGORY_NAME_MAP[sub.name]) : sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Frequency type selector */}
        <div>
          <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
            {t("habits.frequency")}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {FREQUENCY_TYPES.map((ft) => (
              <button
                key={ft.key}
                type="button"
                onClick={() => {
                  setFrequencyType(ft.key);
                  if (ft.key === "times_per_week") setFrequencyCount(3);
                  if (ft.key === "times_per_month") setFrequencyCount(10);
                  if (ft.key === "every_n_days") setFrequencyCount(2);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                style={pillStyle(frequencyType === ft.key)}
              >
                {t(ft.labelKey as Parameters<typeof t>[0])}
              </button>
            ))}
          </div>
        </div>

        {/* Specific days picker */}
        {frequencyType === "specific_days" && (
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
              {t("habits.selectDays")}
            </label>
            <div className="flex gap-1.5">
              {WEEKDAY_KEYS.map((key, i) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className="w-10 h-10 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                  style={pillStyle(frequencyDays.includes(i))}
                >
                  {t(key)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Times per week picker */}
        {frequencyType === "times_per_week" && (
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
              {t("habits.timesPerWeek")}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setFrequencyCount(n)}
                  className="w-10 h-10 rounded-lg text-sm font-medium cursor-pointer transition-colors"
                  style={pillStyle(frequencyCount === n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Times per month picker */}
        {frequencyType === "times_per_month" && (
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
              {t("habits.timesPerMonth")}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={30}
                value={frequencyCount}
                onChange={(e) => setFrequencyCount(Number(e.target.value))}
                className="flex-1 accent-[var(--accent)]"
              />
              <span
                className="w-10 text-center text-sm font-semibold rounded-lg px-2 py-1"
                style={{ backgroundColor: "var(--accent)", color: "#fff" }}
              >
                {frequencyCount}
              </span>
            </div>
          </div>
        )}

        {/* Every N days picker */}
        {frequencyType === "every_n_days" && (
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
              {t("habits.everyDays")}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={2}
                max={30}
                value={frequencyCount}
                onChange={(e) => setFrequencyCount(Number(e.target.value))}
                className="flex-1 accent-[var(--accent)]"
              />
              <span
                className="min-w-[40px] text-center text-sm font-semibold rounded-lg px-2 py-1"
                style={{ backgroundColor: "var(--accent)", color: "#fff" }}
              >
                {frequencyCount}
              </span>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {t("habits.daysInterval")}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t("form.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={
              !name.trim() ||
              !categoryId ||
              (frequencyType === "specific_days" && frequencyDays.length === 0)
            }
          >
            {t("form.create")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
