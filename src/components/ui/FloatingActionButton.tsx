"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed right-4 bottom-4 md:right-6 md:bottom-6 z-50 flex items-center justify-center rounded-full w-12 h-12 md:w-14 md:h-14 cursor-pointer border-0"
      style={{
        backgroundColor: "var(--accent)",
        color: "#fff",
        boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
      }}
      initial={false}
      animate={{
        boxShadow: [
          "0 4px 14px rgba(0,0,0,0.2)",
          "0 6px 20px rgba(0,0,0,0.3)",
          "0 4px 14px rgba(0,0,0,0.2)",
        ],
      }}
      transition={{
        boxShadow: {
          repeat: Infinity,
          duration: 2.5,
          ease: "easeInOut",
        },
      }}
      whileHover={{
        scale: 1.1,
        boxShadow: "0 8px 28px rgba(0,0,0,0.35)",
      }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.span
        className="flex items-center justify-center"
        whileHover={{ rotate: 90 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Plus size={24} strokeWidth={2.5} />
      </motion.span>
    </motion.button>
  );
}
