// src/components/Catalog/DesktopFilters.tsx - ФИНАЛЬНАЯ ВЕРСИЯ
'use client';

import React from 'react';
import CatalogSearch from './CatalogSearch';
import PriceFilter from './Filters/PriceFilter';
import CheckboxFilter from './Filters/CheckboxFilter';
import SizeFilter from './Filters/SizeFilter';
import { useCatalogFilters } from '@/hooks/useCatalogFilters';

interface FilterState {
  brands: string[];
  genders: string[];
  categories: string[];
  sizes: string[];
  priceRange: {
    min: string;
    max: string;
  };
}

interface DesktopFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filters: FilterState;
  filterOptions: {
    brands: string[];
    genders: string[];
    categories: string[];
    sizes: string[];
  };
  onFilterChange: (filterType: keyof FilterState, value: string | string[] | { min: string; max: string }) => void;
  onClearFilters: () => void;
  totalResults: number;
}

const DesktopFilters: React.FC<DesktopFiltersProps> = ({
  searchQuery,
  onSearchChange,
  filters,
  filterOptions,
  onFilterChange,
  onClearFilters,
  totalResults
}) => {
  // Загружаем фильтры из Strapi
  const { brands: strapiBrands, categories: strapiCategories, sizes: strapiSizes, loading, error } = useCatalogFilters();

  // Стандартные варианты пола (статичные данные)
  const genders = [
    { name: 'Мужской' },
    { name: 'Женский' },
    { name: 'Унисекс' },
    { name: 'Детский' }
  ];

  const handleFilterChange = (filterType: keyof FilterState, value: string | { min: string; max: string }) => {
    if (filterType === 'priceRange') {
      onFilterChange(filterType, value);
    } else {
      const currentValues = filters[filterType] as string[];
      const newValues = currentValues.includes(value as string)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value as string];
      onFilterChange(filterType, newValues);
    }
  };

  const FilterDivider = () => (
    <div className="w-full h-0.5 bg-black my-6"></div>
  );

  // Подготавливаем данные для компонентов (используем Strapi данные если есть, иначе fallback)
  const brandsToShow = strapiBrands.length > 0 
    ? strapiBrands.map(b => b.name) 
    : filterOptions.brands;
    
  const categoriesToShow = strapiCategories.length > 0 
    ? strapiCategories.map(c => c.name) 
    : filterOptions.categories;
    
  const sizesToShow = strapiSizes.length > 0 
    ? strapiSizes.map(s => s.name) 
    : filterOptions.sizes;

  const gendersToShow = genders.map(g => g.name);

  return (
    <div className="hidden lg:block w-[475px] bg-white border-r border-gray-200">
      <div className="p-5">
        {/* Результаты поиска */}
        <div className="text-[#8C8072] text-[25px] leading-[34px] mb-4 font-product">
          Найдено: {totalResults}
        </div>
        
        {/* Поиск */}
        <CatalogSearch
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="введите название товара"
        />

        <FilterDivider />

        {/* Цена */}
        <PriceFilter
          priceRange={filters.priceRange}
          onChange={(priceRange) => onFilterChange('priceRange', priceRange)}
        />

        <FilterDivider />

        {/* Бренды */}
        {(brandsToShow.length > 0 || loading) && (
          <>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded w-2/3"></div>
                  ))}
                </div>
              </div>
            ) : (
              <CheckboxFilter
                title="Бренды"
                options={brandsToShow}
                selectedValues={filters.brands}
                onChange={(value) => handleFilterChange('brands', value)}
              />
            )}
            <FilterDivider />
          </>
        )}

        {/* Пол */}
        <CheckboxFilter
          title="Пол"
          options={gendersToShow}
          selectedValues={filters.genders}
          onChange={(value) => handleFilterChange('genders', value)}
        />

        <FilterDivider />

        {/* Категория */}
        {(categoriesToShow.length > 0 || loading) && (
          <>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded w-2/3"></div>
                  ))}
                </div>
              </div>
            ) : (
              <CheckboxFilter
                title="Категория"
                options={categoriesToShow}
                selectedValues={filters.categories}
                onChange={(value) => handleFilterChange('categories', value)}
              />
            )}
            <FilterDivider />
          </>
        )}

        {/* Размер */}
        {(sizesToShow.length > 0 || loading) && (
          <>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="grid grid-cols-6 gap-2">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="h-10 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ) : (
              <SizeFilter
                title="Размер"
                options={sizesToShow}
                selectedValues={filters.sizes}
                onChange={(value) => handleFilterChange('sizes', value)}
                showAll={true}
              />
            )}
            <FilterDivider />
          </>
        )}

        {/* Кнопка очистки фильтров */}
        <button
          onClick={onClearFilters}
          className="w-full h-[50px] bg-black text-white text-[16px] font-product hover:bg-gray-800 transition-colors"
        >
          Сбросить фильтры
        </button>

        {/* Показываем ошибку если есть */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded">
            Ошибка загрузки фильтров: {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default DesktopFilters;