"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ListTodo, ChevronDown, Calendar, BarChart3 } from "lucide-react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import type { Category, CategoryFilter } from "@/lib/types";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { CATEGORY_NAME_MAP } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface SidebarProps {
  categories: Category[];
  filter: CategoryFilter;
  onFilterChange: (filter: CategoryFilter) => void;
  todoCounts: Record<string, number>;
  expanded?: Record<string, boolean>;
  onExpandChange?: (expanded: Record<string, boolean>) => void;
  calendarActive?: boolean;
  onCalendarToggle?: () => void;
  statsActive?: boolean;
  onStatsToggle?: () => void;
}

export function Sidebar({
  categories,
  filter,
  onFilterChange,
  todoCounts,
  expanded: externalExpanded,
  onExpandChange,
  calendarActive,
  onCalendarToggle,
  statsActive,
  onStatsToggle,
}: SidebarProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [internalExpanded, setInternalExpanded] = useState<Record<string, boolean>>({});

  const expanded = externalExpanded ?? internalExpanded;
  const setExpanded = onExpandChange ?? setInternalExpanded;

  const toggleExpand = (id: string) => {
    setExpanded({ ...expanded, [id]: !expanded[id] });
  };

  const isAllSelected = !filter.categoryId && !filter.subcategoryId;

  return (
    <aside
      className="w-[250px] lg:w-[250px] md:w-[200px] h-full border-r flex-shrink-0 flex flex-col overflow-hidden"
      style={{
        backgroundColor: "var(--bg-sidebar)",
        borderColor: "var(--separator)",
      }}
    >
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
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
          <span>{t("sidebar.allTasks")}</span>
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
              <div
                className={cn(
                  "flex items-center rounded-lg cursor-pointer",
                  isSelected
                    ? "bg-[var(--accent)]/10"
                    : "hover:bg-[var(--separator)]"
                )}
              >
                <button
                  onClick={() => {
                    onFilterChange({
                      categoryId: cat.id,
                      subcategoryId: null,
                    });
                  }}
                  className="flex-1 flex items-center gap-3 px-3 py-2.5 text-sm font-medium cursor-pointer"
                  style={{
                    color: isSelected ? color : "var(--text-primary)",
                  }}
                >
                  <CategoryIcon name={cat.icon} size={18} style={{ color }} />
                  <span>{CATEGORY_NAME_MAP[cat.name] ? t(CATEGORY_NAME_MAP[cat.name]) : cat.name}</span>
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
                </button>
                {hasSubs && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(cat.id);
                    }}
                    className="flex items-center justify-center px-2 py-2.5 cursor-pointer"
                  >
                    <ChevronDown
                      size={14}
                      className={cn(
                        "transition-transform",
                        isExpanded && "rotate-180"
                      )}
                      style={{ color: "var(--text-secondary)" }}
                    />
                  </button>
                )}
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
                            <span>{CATEGORY_NAME_MAP[sub.name] ? t(CATEGORY_NAME_MAP[sub.name]) : sub.name}</span>
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

      {/* Stats & Calendar buttons */}
      {(onStatsToggle || onCalendarToggle) && (
        <div
          className="p-3 border-t space-y-1"
          style={{ borderColor: "var(--separator)" }}
        >
          {onStatsToggle && (
            <button
              onClick={onStatsToggle}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer",
                statsActive
                  ? "bg-[var(--accent)]/10"
                  : "hover:bg-[var(--separator)]"
              )}
              style={{
                color: statsActive ? "var(--accent)" : "var(--text-primary)",
              }}
            >
              <BarChart3 size={18} />
              <span>{t("sidebar.stats")}</span>
            </button>
          )}
          {onCalendarToggle && (
            <button
              onClick={onCalendarToggle}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer",
                calendarActive
                  ? "bg-[var(--accent)]/10"
                  : "hover:bg-[var(--separator)]"
              )}
              style={{
                color: calendarActive ? "var(--accent)" : "var(--text-primary)",
              }}
            >
              <Calendar size={18} />
              <span>{t("sidebar.calendar")}</span>
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
