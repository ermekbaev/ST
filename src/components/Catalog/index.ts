// src/components/Catalog/index.ts

// Основные компоненты каталога
export { default as DesktopFilters } from './DesktopFilters';
// export { default as MobileFilters } from './MobileFilters';
export { default as CatalogSearch } from './CatalogSearch';
export { default as CatalogSort } from './CatalogSort';
export { default as ProductGrid } from './ProductGrid';
export { default as CatalogPagination } from './CatalogPagination';
// export { default as ActiveFilters } from './ActiveFilters';

// Компоненты фильтров
export { default as PriceFilter } from './Filters/PriceFilter';
export { default as CheckboxFilter } from './Filters/CheckboxFilter';
export { default as SizeFilter } from './Filters/SizeFilter';

// Типы
export interface FilterState {
  brands: string[];
  genders: string[];
  categories: string[];
  sizes: string[];
  priceRange: {
    min: string;
    max: string;
  };
}

export interface FilterOptions {
  brands: string[];
  genders: string[];
  categories: string[];
  sizes: string[];
}

export interface Product {
  id?: string;
  article: string;
  brand: string;
  name: string;
  size: string;
  category: string;
  gender: string;
  price: number;
  photo: string;
}