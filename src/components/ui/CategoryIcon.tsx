"use client";

import {
  Briefcase,
  GraduationCap,
  User,
  ShoppingCart,
  Heart,
  Code,
  Youtube,
  MoreHorizontal,
  Languages,
  Palette,
  Music,
  type LucideProps,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  Briefcase,
  GraduationCap,
  User,
  ShoppingCart,
  Heart,
  Code,
  Youtube,
  MoreHorizontal,
  Languages,
  Palette,
  Music,
};

interface CategoryIconProps extends LucideProps {
  name: string;
}

export function CategoryIcon({ name, ...props }: CategoryIconProps) {
  const Icon = iconMap[name] || MoreHorizontal;
  return <Icon {...props} />;
}
