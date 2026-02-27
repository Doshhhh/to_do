import type { Metadata } from "next";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Todo App",
  description: "Управляйте задачами эффективно",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <SupabaseProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
