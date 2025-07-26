// src/components/Catalog/DesktopFilters.tsx
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
  onFilterChange: (filterType: keyof FilterState, value: string | { min: string; max: string }) => void;
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
        {/* Поиск */}
        <CatalogSearch
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          totalResults={totalResults}
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
                maxHeight="max-h-[300px]"
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
                maxHeight="max-h-[200px]"
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
                sizes={sizesToShow}
                selectedSizes={filters.sizes}
                onChange={(value) => handleFilterChange('sizes', value)}
                maxItems={18}
                showAll={true}
              />
            )}
          </>
        )}

        {/* Сообщения об ошибках или отсутствии данных */}
        {error && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
            <p className="text-sm text-yellow-800">
              ⚠️ Ошибка загрузки фильтров из Strapi
            </p>
            <p className="text-xs text-yellow-600 mt-1">{error}</p>
          </div>
        )}

        {!loading && !error && brandsToShow.length === 0 && categoriesToShow.length === 0 && sizesToShow.length === 0 && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-md mb-4">
            <p className="text-sm text-gray-600">
              📦 Настройте модели в Strapi
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Создайте Brand, Category и Size
            </p>
          </div>
        )}

        {/* Кнопка очистить фильтры */}
        <div className="mt-8 pb-8">
          <button
            onClick={onClearFilters}
            className="w-full h-[80px] bg-[#0B0B0D] text-white text-[30px] leading-[41px] font-product uppercase hover:bg-gray-800 transition-colors"
          >
            ОЧИСТИТЬ ФИЛЬТРЫ
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesktopFilters;