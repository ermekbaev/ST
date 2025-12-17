// src/data/menuTypes.ts
export interface MegaMenuData {
  title: string;
  categories: string[];
  subcategories: string[];
  additional?: string[];
  links?: Record<string, string>;
}

export interface InfoMenuData {
  links: Array<{
    name: string;
    href: string;
  }>;
}

export type MenuKey =
  | "обувь"
  | "одежда"
  | "аксессуары"
  | "другое"
  | "бренды"
  | "информация";
