"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

interface SupabaseContextType {
  supabase: SupabaseClient;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(
  undefined
);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient());

  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context)
    throw new Error("useSupabase must be used within SupabaseProvider");
  return context.supabase;
}
