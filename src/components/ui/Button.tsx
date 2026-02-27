"use client";

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all cursor-pointer",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variant === "primary" &&
          "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]",
        variant === "secondary" &&
          "bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--separator)] hover:bg-[var(--separator)]",
        variant === "ghost" &&
          "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--separator)]",
        variant === "danger" &&
          "bg-red-500/10 text-red-500 hover:bg-red-500/20",
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2 text-sm",
        size === "lg" && "px-6 py-3 text-base",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
