"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, X } from "lucide-react";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель",
  "Май", "Июнь", "Июль", "Август",
  "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

const MONTHS_SHORT = [
  "Янв", "Фев", "Мар", "Апр",
  "Май", "Июн", "Июл", "Авг",
  "Сен", "Окт", "Ноя", "Дек",
];

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday-based
}

export function DatePicker({ value, onChange }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"months" | "days">("months");
  const [viewYear, setViewYear] = useState(() => {
    if (value) return new Date(value).getFullYear();
    return new Date().getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    if (value) return new Date(value).getMonth();
    return new Date().getMonth();
  });

  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
    dropUp: boolean;
  }>({ top: 0, left: 0, dropUp: false });

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Compute position when open
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;

    const mobile = window.innerWidth < 640;
    setIsMobile(mobile);

    if (mobile) return; // Modal mode, no positioning needed

    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownWidth = Math.min(280, window.innerWidth - 32);
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropUp = spaceBelow < 360;

    let left = rect.left + rect.width / 2 - dropdownWidth / 2;
    // Clamp to viewport with 16px padding
    left = Math.max(16, Math.min(left, window.innerWidth - dropdownWidth - 16));

    const top = dropUp
      ? rect.top + window.scrollY - 6
      : rect.bottom + window.scrollY + 6;

    setDropdownPos({ top, left, dropUp });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  const open = useCallback(() => {
    if (value) {
      const d = new Date(value);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
      setView("days");
    } else {
      setViewYear(new Date().getFullYear());
      setView("months");
    }
    setIsOpen(true);
  }, [value]);

  const selectDay = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    onChange(`${viewYear}-${m}-${d}`);
    setIsOpen(false);
  };

  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  const displayValue = value
    ? new Date(value).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  // Build day grid
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const prevMonthDays = getDaysInMonth(viewYear, viewMonth - 1);

  const dayGrid: { day: number; current: boolean; dateStr: string }[] = [];

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const pm = viewMonth === 0 ? 11 : viewMonth - 1;
    const py = viewMonth === 0 ? viewYear - 1 : viewYear;
    dayGrid.push({
      day: d,
      current: false,
      dateStr: `${py}-${String(pm + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    dayGrid.push({
      day: d,
      current: true,
      dateStr: `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    });
  }

  // Next month leading days
  const remaining = 42 - dayGrid.length;
  for (let d = 1; d <= remaining; d++) {
    const nm = viewMonth === 11 ? 0 : viewMonth + 1;
    const ny = viewMonth === 11 ? viewYear + 1 : viewYear;
    dayGrid.push({
      day: d,
      current: false,
      dateStr: `${ny}-${String(nm + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    });
  }

  // Trim last row if entirely next month
  const totalRows = dayGrid.length / 7;
  const lastRowStart = (totalRows - 1) * 7;
  const lastRowAllNext = dayGrid.slice(lastRowStart).every((d) => !d.current);
  const finalGrid = lastRowAllNext ? dayGrid.slice(0, lastRowStart) : dayGrid;

  // Calendar content (shared between desktop dropdown and mobile modal)
  const calendarContent = (
    <AnimatePresence mode="wait">
      {view === "months" ? (
        <motion.div
          key="months"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.15 }}
          className="p-3"
        >
          {/* Year header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setViewYear((y) => y - 1)}
              className="p-1.5 rounded-lg transition-colors hover:bg-[var(--separator)]"
            >
              <ChevronLeft size={16} style={{ color: "var(--text-secondary)" }} />
            </button>
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {viewYear}
            </span>
            <button
              type="button"
              onClick={() => setViewYear((y) => y + 1)}
              className="p-1.5 rounded-lg transition-colors hover:bg-[var(--separator)]"
            >
              <ChevronRight size={16} style={{ color: "var(--text-secondary)" }} />
            </button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-3 gap-1.5">
            {MONTHS_SHORT.map((m, i) => {
              const isCurrentMonth = viewYear === today.getFullYear() && i === today.getMonth();
              const isSelected = value && viewYear === new Date(value).getFullYear() && i === new Date(value).getMonth();
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setViewMonth(i);
                    setView("days");
                  }}
                  className="py-2 px-1 rounded-lg text-sm transition-colors"
                  style={{
                    backgroundColor: isSelected
                      ? "var(--accent)"
                      : "transparent",
                    color: isSelected
                      ? "#fff"
                      : isCurrentMonth
                        ? "var(--accent)"
                        : "var(--text-primary)",
                    fontWeight: isCurrentMonth || isSelected ? 600 : 400,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = "var(--separator)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="days"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.15 }}
          className="p-3"
        >
          {/* Month/Year header */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => {
                if (viewMonth === 0) {
                  setViewMonth(11);
                  setViewYear((y) => y - 1);
                } else {
                  setViewMonth((m) => m - 1);
                }
              }}
              className="p-1.5 rounded-lg transition-colors hover:bg-[var(--separator)]"
            >
              <ChevronLeft size={16} style={{ color: "var(--text-secondary)" }} />
            </button>
            <button
              type="button"
              onClick={() => setView("months")}
              className="text-sm font-semibold px-2 py-1 rounded-lg transition-colors hover:bg-[var(--separator)]"
              style={{ color: "var(--text-primary)" }}
            >
              {MONTHS[viewMonth]} {viewYear}
            </button>
            <button
              type="button"
              onClick={() => {
                if (viewMonth === 11) {
                  setViewMonth(0);
                  setViewYear((y) => y + 1);
                } else {
                  setViewMonth((m) => m + 1);
                }
              }}
              className="p-1.5 rounded-lg transition-colors hover:bg-[var(--separator)]"
            >
              <ChevronRight size={16} style={{ color: "var(--text-secondary)" }} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((wd) => (
              <div
                key={wd}
                className="text-center text-xs py-1"
                style={{ color: "var(--text-secondary)" }}
              >
                {wd}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7">
            {finalGrid.map((cell, i) => {
              const isToday = cell.dateStr === todayStr;
              const isSelected = cell.dateStr === value;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    if (cell.current) {
                      selectDay(cell.day);
                    } else {
                      const [y, m, d] = cell.dateStr.split("-").map(Number);
                      setViewYear(y);
                      setViewMonth(m - 1);
                      onChange(cell.dateStr);
                      setIsOpen(false);
                    }
                  }}
                  className="aspect-square flex items-center justify-center text-sm rounded-lg transition-colors"
                  style={{
                    backgroundColor: isSelected
                      ? "var(--accent)"
                      : "transparent",
                    color: isSelected
                      ? "#fff"
                      : !cell.current
                        ? "var(--text-secondary)"
                        : isToday
                          ? "var(--accent)"
                          : "var(--text-primary)",
                    fontWeight: isToday || isSelected ? 600 : 400,
                    opacity: !cell.current ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = "var(--separator)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Today shortcut */}
          <div className="mt-2 pt-2 border-t" style={{ borderColor: "var(--separator)" }}>
            <button
              type="button"
              onClick={() => {
                onChange(todayStr);
                setIsOpen(false);
              }}
              className="w-full text-sm py-1.5 rounded-lg transition-colors"
              style={{ color: "var(--accent)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--separator)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Сегодня
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Portal dropdown rendered into document.body
  const portalDropdown = isOpen
    ? createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Mobile overlay */}
              {isMobile && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setIsOpen(false)}
                  style={{
                    position: "fixed",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.4)",
                    zIndex: 9998,
                  }}
                />
              )}

              <motion.div
                ref={dropdownRef}
                initial={
                  isMobile
                    ? { opacity: 0, scale: 0.95 }
                    : { opacity: 0, scale: 0.95, y: dropdownPos.dropUp ? 8 : -8 }
                }
                animate={
                  isMobile
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 1, scale: 1, y: 0 }
                }
                exit={
                  isMobile
                    ? { opacity: 0, scale: 0.95 }
                    : { opacity: 0, scale: 0.95, y: dropdownPos.dropUp ? 8 : -8 }
                }
                transition={{ duration: 0.15 }}
                className="rounded-xl border overflow-hidden"
                style={
                  isMobile
                    ? {
                        position: "fixed",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 9999,
                        width: `${Math.min(280, window.innerWidth - 32)}px`,
                        maxWidth: "calc(100vw - 32px)",
                        backgroundColor: "var(--bg-card)",
                        borderColor: "var(--separator)",
                        boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
                      }
                    : {
                        position: "absolute",
                        top: dropdownPos.dropUp ? undefined : `${dropdownPos.top}px`,
                        bottom: dropdownPos.dropUp
                          ? `${document.documentElement.scrollHeight - dropdownPos.top}px`
                          : undefined,
                        left: `${dropdownPos.left}px`,
                        zIndex: 9999,
                        width: `${Math.min(280, window.innerWidth - 32)}px`,
                        maxWidth: "calc(100vw - 32px)",
                        backgroundColor: "var(--bg-card)",
                        borderColor: "var(--separator)",
                        boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
                      }
                }
              >
                {calendarContent}
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )
    : null;

  return (
    <div ref={triggerRef}>
      {/* Trigger field */}
      <div
        onClick={open}
        className="w-full px-3 py-2 rounded-lg border text-sm cursor-pointer flex items-center gap-2 transition-colors"
        style={{
          backgroundColor: "var(--bg-primary)",
          borderColor: "var(--separator)",
          color: value ? "var(--text-primary)" : "var(--text-secondary)",
        }}
      >
        <Calendar size={16} style={{ color: "var(--text-secondary)", flexShrink: 0 }} />
        <span className="flex-1 truncate">
          {displayValue || "Выберите дату"}
        </span>
        {value && (
          <button
            type="button"
            onClick={clearDate}
            className="p-0.5 rounded-md transition-colors hover:bg-[var(--separator)]"
          >
            <X size={14} style={{ color: "var(--text-secondary)" }} />
          </button>
        )}
      </div>

      {portalDropdown}
    </div>
  );
}
