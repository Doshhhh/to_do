"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { CATEGORY_NAME_MAP } from "@/lib/i18n";
import type { Todo, Category } from "@/lib/types";

type Period = "day" | "week" | "month";

interface StatsViewProps {
  todos: Todo[];
  categories: Category[];
}

function getPeriodRange(period: Period): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  let start: Date;

  switch (period) {
    case "day":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      break;
    case "week":
      start = new Date(end);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      break;
    case "month":
      start = new Date(end);
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      break;
  }

  return { start, end };
}

function getChartData(
  todos: Todo[],
  period: Period,
  range: { start: Date; end: Date }
) {
  const completedInRange = todos.filter((t) => {
    if (!t.completed_at) return false;
    const d = new Date(t.completed_at);
    return d >= range.start && d <= range.end;
  });

  if (period === "day") {
    const hours: { label: string; completed: number }[] = [];
    for (let h = 0; h < 24; h++) {
      const count = completedInRange.filter((t) => {
        const d = new Date(t.completed_at!);
        return d.getHours() === h;
      }).length;
      hours.push({ label: `${h}:00`, completed: count });
    }
    return hours;
  }

  const days = period === "week" ? 7 : 30;
  const data: { label: string; completed: number }[] = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(range.start);
    d.setDate(d.getDate() + i);
    const dayStr = d.toISOString().slice(0, 10);

    const count = completedInRange.filter((t) => {
      return t.completed_at!.slice(0, 10) === dayStr;
    }).length;

    const label = `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
    data.push({ label, completed: count });
  }

  return data;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" as const },
  }),
};

export function StatsView({ todos, categories }: StatsViewProps) {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [period, setPeriod] = useState<Period>("week");

  const range = useMemo(() => getPeriodRange(period), [period]);

  const completedInRange = useMemo(
    () =>
      todos.filter((t) => {
        if (!t.completed_at) return false;
        const d = new Date(t.completed_at);
        return d >= range.start && d <= range.end;
      }),
    [todos, range]
  );

  const createdInRange = useMemo(
    () =>
      todos.filter((t) => {
        const d = new Date(t.created_at);
        return d >= range.start && d <= range.end;
      }),
    [todos, range]
  );

  const completionRate = useMemo(() => {
    if (createdInRange.length === 0) return 0;
    const completedOfCreated = createdInRange.filter((t) => t.is_completed).length;
    return Math.round((completedOfCreated / createdInRange.length) * 100);
  }, [createdInRange]);

  const chartData = useMemo(
    () => getChartData(todos, period, range),
    [todos, period, range]
  );

  const categoryStats = useMemo(() => {
    const stats: {
      id: string;
      name: string;
      icon: string;
      color: string;
      completed: number;
      total: number;
    }[] = [];

    for (const cat of categories) {
      const catTodos = createdInRange.filter((t) => t.category_id === cat.id);
      const catCompleted = completedInRange.filter(
        (t) => t.category_id === cat.id
      );
      if (catTodos.length === 0 && catCompleted.length === 0) continue;

      stats.push({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: isDark ? cat.color_dark : cat.color_light,
        completed: catCompleted.length,
        total: catTodos.length,
      });
    }

    return stats.sort((a, b) => b.completed - a.completed);
  }, [categories, createdInRange, completedInRange, isDark]);

  const accentColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--accent")
    .trim();

  const periods: { key: Period; label: string }[] = [
    { key: "day", label: t("stats.period.day") },
    { key: "week", label: t("stats.period.week") },
    { key: "month", label: t("stats.period.month") },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Period switcher */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-1 p-1 rounded-xl w-fit"
          style={{ backgroundColor: "var(--bg-card)" }}
        >
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
              style={{
                backgroundColor:
                  period === p.key ? "var(--accent)" : "transparent",
                color:
                  period === p.key ? "#fff" : "var(--text-secondary)",
              }}
            >
              {p.label}
            </button>
          ))}
        </motion.div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: t("stats.completed"),
              value: completedInRange.length,
              suffix: "",
            },
            {
              label: t("stats.created"),
              value: createdInRange.length,
              suffix: "",
            },
            {
              label: t("stats.completionRate"),
              value: completionRate,
              suffix: "%",
            },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="rounded-2xl p-5 shadow-sm"
              style={{ backgroundColor: "var(--bg-card)" }}
            >
              <p
                className="text-sm mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                {card.label}
              </p>
              <p
                className="text-3xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {card.value}
                {card.suffix}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Line chart */}
        <motion.div
          custom={3}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="rounded-2xl p-5 shadow-sm"
          style={{ backgroundColor: "var(--bg-card)" }}
        >
          <p
            className="text-sm font-medium mb-4"
            style={{ color: "var(--text-secondary)" }}
          >
            {t("stats.completed")}
          </p>
          <div className="w-full h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? "#3A3735" : "#E5E0D8"}
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: isDark ? "#9C958B" : "#8C8579", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  interval={period === "month" ? 4 : period === "day" ? 3 : 0}
                />
                <YAxis
                  tick={{ fill: isDark ? "#9C958B" : "#8C8579", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#2D2B28" : "#fff",
                    border: `1px solid ${isDark ? "#3A3735" : "#E5E0D8"}`,
                    borderRadius: 12,
                    color: isDark ? "#E8E4DE" : "#2D2A26",
                    fontSize: 13,
                  }}
                  labelStyle={{ color: isDark ? "#9C958B" : "#8C8579" }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke={accentColor || "#D97706"}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: accentColor || "#D97706" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category breakdown */}
        {categoryStats.length > 0 && (
          <motion.div
            custom={4}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="rounded-2xl p-5 shadow-sm"
            style={{ backgroundColor: "var(--bg-card)" }}
          >
            <p
              className="text-sm font-medium mb-4"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("stats.byCategory")}
            </p>
            <div className="space-y-3">
              {categoryStats.map((cat) => {
                const pct =
                  cat.total > 0
                    ? Math.round((cat.completed / cat.total) * 100)
                    : 0;
                return (
                  <div key={cat.id} className="flex items-center gap-3">
                    <CategoryIcon
                      name={cat.icon}
                      size={18}
                      style={{ color: cat.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="text-sm truncate"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {CATEGORY_NAME_MAP[cat.name]
                            ? t(CATEGORY_NAME_MAP[cat.name])
                            : cat.name}
                        </span>
                        <span
                          className="text-xs ml-2 shrink-0"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {cat.completed} / {cat.total}
                        </span>
                      </div>
                      <div
                        className="h-2 rounded-full overflow-hidden"
                        style={{ backgroundColor: "var(--separator)" }}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
