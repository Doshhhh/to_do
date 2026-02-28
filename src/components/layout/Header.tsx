"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu, CheckSquare } from "lucide-react";
import { UserDropdown } from "./UserDropdown";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useRouter } from "next/navigation";

interface HeaderProps {
  avatarUrl: string | null;
  displayName: string | null;
  email: string | null;
  onMenuToggle: () => void;
}

export function Header({ avatarUrl, displayName, email, onMenuToggle }: HeaderProps) {
  const supabase = useSupabase();
  const router = useRouter();
  const { t } = useLanguage();
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
            {t("app.title")}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
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

          <UserDropdown
            isOpen={showMenu}
            onClose={() => setShowMenu(false)}
            avatarUrl={avatarUrl}
            displayName={displayName}
            email={email}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </header>
  );
}
