"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import type { Category, Subcategory } from "@/lib/types";
import { DEFAULT_CATEGORIES } from "@/lib/types";

export function useCategories() {
  const supabase = useSupabase();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const seedingRef = useRef(false);

  const fetchCategories = useCallback(async () => {
    const { data: cats, error } = await supabase
      .from("categories")
      .select("*, subcategories(*)")
      .order("sort_order");

    if (error) {
      console.error("Error fetching categories:", error);
      setLoading(false);
      return;
    }

    if (cats && cats.length > 0) {
      const sorted = cats.map((cat: Category & { subcategories: Subcategory[] }) => ({
        ...cat,
        subcategories: (cat.subcategories || []).sort(
          (a: Subcategory, b: Subcategory) => a.sort_order - b.sort_order
        ),
      }));
      setCategories(sorted);
      setLoading(false);
    } else {
      if (seedingRef.current) return;
      seedingRef.current = true;

      try {
        await seedDefaultCategories();
      } finally {
        seedingRef.current = false;
      }
    }
  }, [supabase]);

  const seedDefaultCategories = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Double-check: categories may have been created by a concurrent call
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .limit(1);

    if (existing && existing.length > 0) {
      await fetchCategories();
      return;
    }

    for (const cat of DEFAULT_CATEGORIES) {
      const { data: newCat } = await supabase
        .from("categories")
        .insert({
          user_id: user.id,
          name: cat.name,
          icon: cat.icon,
          color_light: cat.color_light,
          color_dark: cat.color_dark,
          sort_order: cat.sort_order,
        })
        .select()
        .single();

      if (newCat && cat.subcategories.length > 0) {
        await supabase.from("subcategories").insert(
          cat.subcategories.map((sub) => ({
            category_id: newCat.id,
            user_id: user.id,
            name: sub.name,
            icon: sub.icon,
            sort_order: sub.sort_order,
          }))
        );
      }
    }

    await fetchCategories();
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, refetch: fetchCategories };
}
