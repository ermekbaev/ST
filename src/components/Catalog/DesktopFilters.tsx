// src/components/Catalog/DesktopFilters.tsx
'use client';

import React from 'react';
import CatalogSearch from './CatalogSearch';
import PriceFilter from './Filters/PriceFilter';
import CheckboxFilter from './Filters/CheckboxFilter';
import SizeFilter from './Filters/SizeFilter';

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
  const handleFilterChange = (filterType: keyof FilterState, value: string | { min: string; max: string }) => {
    if (filterType === 'priceRange') {
      onFilterChange(filterType, value);
    } else {
      const currentValues = filters[filterType] as string[];
      const newValues = currentValues.includes(value as string)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value as string];
      //@ts-ignore
      onFilterChange(filterType, newValues);
    }
  };

  const FilterDivider = () => (
    <div className="w-full h-0.5 bg-black my-6"></div>
  );

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
        <CheckboxFilter
          title="Бренды"
          options={filterOptions.brands}
          selectedValues={filters.brands}
          onChange={(value) => handleFilterChange('brands', value)}
          maxHeight="max-h-[300px]"
        />

        <FilterDivider />

        {/* Пол */}
        <CheckboxFilter
          title="Пол"
          options={filterOptions.genders}
          selectedValues={filters.genders}
          onChange={(value) => handleFilterChange('genders', value)}
        />

        <FilterDivider />

        {/* Категория */}
        <CheckboxFilter
          title="Категория"
          options={filterOptions.categories}
          selectedValues={filters.categories}
          onChange={(value) => handleFilterChange('categories', value)}
          maxHeight="max-h-[200px]"
        />

        <FilterDivider />

        {/* Размер */}
        <SizeFilter
          sizes={filterOptions.sizes}
          selectedSizes={filters.sizes}
          onChange={(value) => handleFilterChange('sizes', value)}
          maxItems={18}
        />

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