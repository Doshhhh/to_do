"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import type { Category, CategoryFilter } from "@/lib/types";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  filter: CategoryFilter;
  onFilterChange: (filter: CategoryFilter) => void;
  todoCounts: Record<string, number>;
}

export function MobileSidebar({
  isOpen,
  onClose,
  categories,
  filter,
  onFilterChange,
  todoCounts,
}: MobileSidebarProps) {
  const handleFilterChange = (f: CategoryFilter) => {
    onFilterChange(f);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-[280px] md:hidden"
            style={{ backgroundColor: "var(--bg-sidebar)" }}
          >
            <div className="flex items-center justify-between p-3 border-b"
              style={{ borderColor: "var(--separator)" }}
            >
              <span
                className="font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Категории
              </span>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-[var(--separator)] cursor-pointer"
                style={{ color: "var(--text-secondary)" }}
              >
                <X size={20} />
              </button>
            </div>
            <Sidebar
              categories={categories}
              filter={filter}
              onFilterChange={handleFilterChange}
              todoCounts={todoCounts}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
