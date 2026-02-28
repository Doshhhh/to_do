"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Sun, Moon, Globe, LogOut } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface UserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  avatarUrl: string | null;
  displayName: string | null;
  email: string | null;
  onLogout: () => void;
}

export function UserDropdown({
  isOpen,
  onClose,
  avatarUrl,
  displayName,
  email,
  onLogout,
}: UserDropdownProps) {
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  const toggleLanguage = () => {
    setLanguage(language === "ru" ? "en" : "ru");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full mt-1 z-50 w-64 rounded-xl shadow-lg border overflow-hidden"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--separator)",
              transformOrigin: "top right",
            }}
          >
            {/* User info */}
            <div
              className="px-4 py-3 border-b"
              style={{ borderColor: "var(--separator)" }}
            >
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayName || "User"}
                    width={36}
                    height={36}
                    className="rounded-full"
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium"
                    style={{
                      backgroundColor: "var(--accent)",
                      color: "white",
                    }}
                  >
                    {displayName?.[0] || "U"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div
                    className="text-sm font-medium truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {displayName || t("auth.user")}
                  </div>
                  {email && (
                    <div
                      className="text-xs truncate"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {email}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1">
              {/* Settings */}
              <button
                onClick={() => {
                  onClose();
                  // Settings stub — for now just close
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--separator)] cursor-pointer"
                style={{ color: "var(--text-primary)" }}
              >
                <Settings size={16} style={{ color: "var(--text-secondary)" }} />
                {t("menu.settings")}
              </button>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--separator)] cursor-pointer"
                style={{ color: "var(--text-primary)" }}
              >
                {isDark ? (
                  <Sun size={16} style={{ color: "var(--text-secondary)" }} />
                ) : (
                  <Moon size={16} style={{ color: "var(--text-secondary)" }} />
                )}
                {isDark ? t("menu.lightTheme") : t("menu.darkTheme")}
              </button>

              {/* Language toggle */}
              <button
                onClick={toggleLanguage}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--separator)] cursor-pointer"
                style={{ color: "var(--text-primary)" }}
              >
                <Globe size={16} style={{ color: "var(--text-secondary)" }} />
                <span className="flex-1 text-left">{t("menu.language")}</span>
                <span
                  className="text-xs px-2 py-0.5 rounded-md"
                  style={{
                    backgroundColor: "var(--separator)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {language === "ru" ? "RU" : "EN"}
                </span>
              </button>
            </div>

            {/* Separator + Logout */}
            <div
              className="border-t py-1"
              style={{ borderColor: "var(--separator)" }}
            >
              <button
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--separator)] cursor-pointer"
                style={{ color: "var(--text-primary)" }}
              >
                <LogOut size={16} style={{ color: "var(--text-secondary)" }} />
                {t("auth.logout")}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
