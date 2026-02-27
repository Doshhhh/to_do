"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ListTodo, ChevronDown } from "lucide-react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import type { Category, CategoryFilter } from "@/lib/types";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

interface SidebarProps {
  categories: Category[];
  filter: CategoryFilter;
  onFilterChange: (filter: CategoryFilter) => void;
  todoCounts: Record<string, number>;
}

export function Sidebar({
  categories,
  filter,
  onFilterChange,
  todoCounts,
}: SidebarProps) {
  const { isDark } = useTheme();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isAllSelected = !filter.categoryId && !filter.subcategoryId;

  return (
    <aside
      className="w-[250px] lg:w-[250px] md:w-[200px] h-full border-r overflow-y-auto flex-shrink-0"
      style={{
        backgroundColor: "var(--bg-sidebar)",
        borderColor: "var(--separator)",
      }}
    >
      <nav className="p-3 space-y-1">
        {/* All tasks */}
        <button
          onClick={() =>
            onFilterChange({ categoryId: null, subcategoryId: null })
          }
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer",
            isAllSelected
              ? "bg-[var(--accent)]/10"
              : "hover:bg-[var(--separator)]"
          )}
          style={{
            color: isAllSelected ? "var(--accent)" : "var(--text-primary)",
          }}
        >
          <ListTodo size={18} />
          <span>Все задачи</span>
          {todoCounts["all"] > 0 && (
            <span
              className="ml-auto text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: "var(--separator)",
                color: "var(--text-secondary)",
              }}
            >
              {todoCounts["all"]}
            </span>
          )}
        </button>

        <div
          className="my-2 border-t"
          style={{ borderColor: "var(--separator)" }}
        />

        {/* Categories */}
        {categories.map((cat) => {
          const isSelected =
            filter.categoryId === cat.id && !filter.subcategoryId;
          const hasSubs =
            cat.subcategories && cat.subcategories.length > 0;
          const isExpanded = expanded[cat.id];
          const color = isDark ? cat.color_dark : cat.color_light;

          return (
            <div key={cat.id}>
              <div className="flex items-center">
                <button
                  onClick={() => {
                    onFilterChange({
                      categoryId: cat.id,
                      subcategoryId: null,
                    });
                    if (hasSubs) toggleExpand(cat.id);
                  }}
                  className={cn(
                    "flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer",
                    isSelected
                      ? "bg-[var(--accent)]/10"
                      : "hover:bg-[var(--separator)]"
                  )}
                  style={{
                    color: isSelected ? color : "var(--text-primary)",
                  }}
                >
                  <CategoryIcon name={cat.icon} size={18} style={{ color }} />
                  <span>{cat.name}</span>
                  {todoCounts[cat.id] > 0 && (
                    <span
                      className="ml-auto text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "var(--separator)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {todoCounts[cat.id]}
                    </span>
                  )}
                  {hasSubs && (
                    <ChevronDown
                      size={14}
                      className={cn(
                        "transition-transform ml-auto",
                        isExpanded && "rotate-180"
                      )}
                      style={{ color: "var(--text-secondary)" }}
                    />
                  )}
                </button>
              </div>

              {/* Subcategories */}
              <AnimatePresence>
                {hasSubs && isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-4 pl-3 border-l space-y-0.5 mt-0.5"
                      style={{ borderColor: "var(--separator)" }}
                    >
                      {cat.subcategories!.map((sub) => {
                        const isSubSelected =
                          filter.subcategoryId === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() =>
                              onFilterChange({
                                categoryId: cat.id,
                                subcategoryId: sub.id,
                              })
                            }
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer",
                              isSubSelected
                                ? "bg-[var(--accent)]/10"
                                : "hover:bg-[var(--separator)]"
                            )}
                            style={{
                              color: isSubSelected
                                ? color
                                : "var(--text-secondary)",
                            }}
                          >
                            <CategoryIcon name={sub.icon} size={14} />
                            <span>{sub.name}</span>
                            {todoCounts[sub.id] > 0 && (
                              <span
                                className="ml-auto text-xs px-1.5 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: "var(--separator)",
                                  color: "var(--text-secondary)",
                                }}
                              >
                                {todoCounts[sub.id]}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
