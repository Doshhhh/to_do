"use client";

import { CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const { t } = useLanguage();
  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 shadow-lg border text-center"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--separator)",
        }}
      >
        <div className="flex justify-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <CheckSquare size={32} color="white" />
          </div>
        </div>

        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          {t("app.title")}
        </h1>
        <p
          className="text-sm mb-8"
          style={{ color: "var(--text-secondary)" }}
        >
          {t("app.subtitle")}
        </p>

        <Button onClick={handleGoogleLogin} className="w-full gap-2" size="lg">
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path
              fill="#fff"
              d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18Z"
            />
            <path
              fill="#fff"
              d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17Z"
            />
            <path
              fill="#fff"
              d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07Z"
            />
            <path
              fill="#fff"
              d="M8.98 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59A8 8 0 0 0 1.83 5.4l2.67 2.07A4.77 4.77 0 0 1 8.98 3.58Z"
            />
          </svg>
          {t("auth.loginWithGoogle")}
        </Button>
      </div>
    </div>
  );
}
