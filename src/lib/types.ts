export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color_light: string;
  color_dark: string;
  sort_order: number;
  created_at: string;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: string;
  category_id: string;
  user_id: string;
  name: string;
  icon: string;
  sort_order: number;
  created_at: string;
}

export interface Todo {
  id: string;
  user_id: string;
  category_id: string | null;
  subcategory_id: string | null;
  title: string;
  description: string | null;
  priority: "high" | "medium" | "low";
  is_completed: boolean;
  completed_at: string | null;
  deadline: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type SortOption = "deadline" | "priority" | "created_at";

export interface CategoryFilter {
  categoryId: string | null;
  subcategoryId: string | null;
}

export const DEFAULT_CATEGORIES = [
  {
    name: "Работа",
    icon: "Briefcase",
    color_light: "#D97706",
    color_dark: "#E8943A",
    sort_order: 0,
    subcategories: [
      { name: "Программирование", icon: "Code", sort_order: 0 },
      { name: "YouTube", icon: "Youtube", sort_order: 1 },
      { name: "Другое", icon: "MoreHorizontal", sort_order: 2 },
    ],
  },
  {
    name: "Учёба",
    icon: "GraduationCap",
    color_light: "#7C6E8A",
    color_dark: "#9688A4",
    sort_order: 1,
    subcategories: [
      { name: "Программирование", icon: "Code", sort_order: 0 },
      { name: "Французский", icon: "Languages", sort_order: 1 },
      { name: "Английский", icon: "Languages", sort_order: 2 },
    ],
  },
  {
    name: "Хобби",
    icon: "Palette",
    color_light: "#9B7653",
    color_dark: "#B08D6A",
    sort_order: 2,
    subcategories: [
      { name: "Программирование", icon: "Code", sort_order: 0 },
      { name: "Музыка", icon: "Music", sort_order: 1 },
      { name: "Другое", icon: "MoreHorizontal", sort_order: 2 },
    ],
  },
  {
    name: "Личное",
    icon: "User",
    color_light: "#8B6F5C",
    color_dark: "#A68B78",
    sort_order: 3,
    subcategories: [],
  },
  {
    name: "Покупки",
    icon: "ShoppingCart",
    color_light: "#B07D4B",
    color_dark: "#C9945E",
    sort_order: 4,
    subcategories: [],
  },
  {
    name: "Здоровье",
    icon: "Heart",
    color_light: "#6B8F71",
    color_dark: "#7FA886",
    sort_order: 5,
    subcategories: [],
  },
] as const;
