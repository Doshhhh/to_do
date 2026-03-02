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
import { calculateStreak } from "@/hooks/useHabits";
import type { Habit, HabitCompletion, Category } from "@/lib/types";

type Period = "week" | "month";

interface HabitStatsProps {
  habits: Habit[];
  completions: HabitCompletion[];
  categories: Category[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" as const },
  }),
};

export function HabitStats({
  habits,
  completions,
  categories,
}: HabitStatsProps) {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [period, setPeriod] = useState<Period>("week");

  // Best current streak across all habits
  const bestStreak = useMemo(() => {
    if (habits.length === 0) return 0;
    return Math.max(
      ...habits.map((h) =>
        calculateStreak(h.id, completions, h.frequency_type)
      ),
      0
    );
  }, [habits, completions]);

  // Completion rate for the period
  const periodRange = useMemo(() => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = new Date(end);
    start.setDate(start.getDate() - (period === "week" ? 6 : 29));
    return { start, end };
  }, [period]);

  const periodRate = useMemo(() => {
    if (habits.length === 0) return 0;

    const days = period === "week" ? 7 : 30;
    let totalExpected = 0;
    let totalDone = 0;

    for (const habit of habits) {
      if (habit.frequency_type === "daily") {
        totalExpected += days;
      } else {
        totalExpected += Math.floor(days / 7) * habit.frequency_count;
      }

      const habitDone = completions.filter((c) => {
        if (c.habit_id !== habit.id) return false;
        const d = c.completed_date;
        const startStr = periodRange.start.toISOString().slice(0, 10);
        const endStr = periodRange.end.toISOString().slice(0, 10);
        return d >= startStr && d <= endStr;
      }).length;

      totalDone += habitDone;
    }

    if (totalExpected === 0) return 0;
    return Math.round((totalDone / totalExpected) * 100);
  }, [habits, completions, period, periodRange]);

  // Chart: completion percentage per day
  const chartData = useMemo(() => {
    const days = period === "week" ? 7 : 30;
    const data: { label: string; rate: number }[] = [];

    for (let i = 0; i < days; i++) {
      const d = new Date(periodRange.start);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);

      const dailyHabits = habits.filter((h) => h.frequency_type === "daily");
      const totalDaily = dailyHabits.length;
      const doneDaily = dailyHabits.filter((h) =>
        completions.some(
          (c) => c.habit_id === h.id && c.completed_date === dateStr
        )
      ).length;

      const rate =
        totalDaily > 0 ? Math.round((doneDaily / totalDaily) * 100) : 0;
      const label = `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
      data.push({ label, rate });
    }

    return data;
  }, [habits, completions, period, periodRange]);

  // Individual habit stats
  const habitStats = useMemo(() => {
    return habits.map((habit) => {
      const streak = calculateStreak(habit.id, completions, habit.frequency_type);
      const cat = categories.find((c) => c.id === habit.category_id);
      const color = cat
        ? isDark
          ? cat.color_dark
          : cat.color_light
        : "var(--accent)";

      const days = period === "week" ? 7 : 30;
      const expected =
        habit.frequency_type === "daily"
          ? days
          : Math.floor(days / 7) * habit.frequency_count;

      const done = completions.filter((c) => {
        if (c.habit_id !== habit.id) return false;
        const startStr = periodRange.start.toISOString().slice(0, 10);
        const endStr = periodRange.end.toISOString().slice(0, 10);
        return c.completed_date >= startStr && c.completed_date <= endStr;
      }).length;

      const pct = expected > 0 ? Math.round((done / expected) * 100) : 0;

      return { habit, streak, color, done, expected, pct, catIcon: cat?.icon || "Circle" };
    });
  }, [habits, completions, categories, isDark, period, periodRange]);

  const accentColor =
    typeof document !== "undefined"
      ? getComputedStyle(document.documentElement)
          .getPropertyValue("--accent")
          .trim()
      : "#D97706";

  const periods: { key: Period; label: string }[] = [
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
              label: t("habits.bestStreak"),
              value: bestStreak,
              suffix: ` ${t("habits.days")}`,
            },
            {
              label:
                period === "week"
                  ? t("habits.weeklyRate")
                  : t("habits.monthlyRate"),
              value: periodRate,
              suffix: "%",
            },
            {
              label: t("habits.title"),
              value: habits.length,
              suffix: "",
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

        {/* Line chart: daily completion rate */}
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
            {t("habits.completionByDay")}
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
                  tick={{
                    fill: isDark ? "#9C958B" : "#8C8579",
                    fontSize: 12,
                  }}
                  axisLine={false}
                  tickLine={false}
                  interval={period === "month" ? 4 : 0}
                />
                <YAxis
                  tick={{
                    fill: isDark ? "#9C958B" : "#8C8579",
                    fontSize: 12,
                  }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
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
                  formatter={(value) => [`${value}%`, ""]}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke={accentColor || "#D97706"}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: accentColor || "#D97706" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Individual habit stats */}
        {habitStats.length > 0 && (
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
              {t("habits.individualStats")}
            </p>
            <div className="space-y-3">
              {habitStats.map((hs) => (
                <div key={hs.habit.id} className="flex items-center gap-3">
                  <CategoryIcon
                    name={hs.catIcon}
                    size={18}
                    style={{ color: hs.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-sm truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {hs.habit.name}
                      </span>
                      <span
                        className="text-xs ml-2 shrink-0 flex items-center gap-2"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {hs.streak > 0 && (
                          <span style={{ color: "var(--success)" }}>
                            🔥{hs.streak}
                          </span>
                        )}
                        {hs.pct}%
                      </span>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: "var(--separator)" }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, hs.pct)}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: hs.color }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
