"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu, LogOut, CheckSquare } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useRouter } from "next/navigation";

interface HeaderProps {
  avatarUrl: string | null;
  displayName: string | null;
  onMenuToggle: () => void;
}

export function Header({ avatarUrl, displayName, onMenuToggle }: HeaderProps) {
  const supabase = useSupabase();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header
      className="h-14 flex items-center justify-between px-4 border-b sticky top-0 z-30"
      style={{
        backgroundColor: "var(--bg-sidebar)",
        borderColor: "var(--separator)",
      }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg hover:bg-[var(--separator)] cursor-pointer"
          style={{ color: "var(--text-primary)" }}
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <CheckSquare size={24} style={{ color: "var(--accent)" }} />
          <span
            className="font-semibold text-lg hidden sm:inline"
            style={{ color: "var(--text-primary)" }}
          >
            Todo App
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--separator)] cursor-pointer"
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName || "User"}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "white",
                }}
              >
                {displayName?.[0] || "U"}
              </div>
            )}
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div
                className="absolute right-0 top-full mt-1 z-50 w-48 rounded-lg shadow-lg border py-1"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--separator)",
                }}
              >
                <div
                  className="px-3 py-2 text-sm border-b"
                  style={{
                    color: "var(--text-secondary)",
                    borderColor: "var(--separator)",
                  }}
                >
                  {displayName || "Пользователь"}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--separator)] cursor-pointer"
                  style={{ color: "var(--text-primary)" }}
                >
                  <LogOut size={16} />
                  Выйти
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
