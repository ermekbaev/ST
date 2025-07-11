// src/components/Catalog/MobileFilters.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

interface MobileFiltersProps {
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
  isOpen: boolean;
  onClose: () => void;
  sortBy?: string;
  onSortChange?: (sort: string) => void;
}

// Исправить src/components/Catalog/MobileFilters.tsx

const MobileFilters: React.FC<MobileFiltersProps> = ({
  filters,
  filterOptions,
  onFilterChange,
  onClearFilters,
  totalResults,
  isOpen,
  onClose,
  sortBy = 'по популярности',
  onSortChange
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Блокировка скролла при открытых фильтрах
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
    <div className="w-full h-0.5 bg-black my-4"></div>
  );

  if (!mounted || !isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Заголовок - ФИКСИРОВАННЫЙ */}
      <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-white">
        <h2 className="text-black text-[20px] leading-[27px] font-product">
          Найдено: {totalResults}
        </h2>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center"
          aria-label="Закрыть фильтры"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M15 5L5 15M5 5L15 15" 
              stroke="black" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Контент фильтров - СКРОЛЛИТСЯ */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-5">
          
          {/* Сортировка */}
          <div className="mb-6">
            <h3 className="text-black text-[15px] leading-[20px] font-product mb-4">
              СОРТИРОВАТЬ ПО:
            </h3>
            
            <div className="space-y-3">
              {[
                { value: 'popularity', label: 'по популярности' },
                { value: 'newest', label: 'по новизне' }, 
                { value: 'price-asc', label: 'по цене: сначала дешевле' },
                { value: 'price-desc', label: 'по цене: сначала дороже' }
              ].map((option, index) => (
                <label key={index} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="sort"
                    checked={sortBy === option.value}
                    onChange={() => onSortChange && onSortChange(option.value)}
                    className="w-[15px] h-[15px] border border-black mr-4"
                  />
                  <span className="text-black text-[15px] leading-[20px] font-product">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <FilterDivider />

          {/* ФИЛЬТРЫ */}
          <h3 className="text-black text-[15px] leading-[20px] font-product mb-4">
            ФИЛЬТРЫ
          </h3>

          {/* Цена */}
          <div className="mb-6">
            <h4 className="text-black text-[15px] leading-[22px] font-product font-black italic mb-4">
              Цена
            </h4>
            <PriceFilter
              priceRange={filters.priceRange}
              onChange={(priceRange) => onFilterChange('priceRange', priceRange)}
            />
          </div>

          <FilterDivider />

          {/* Бренды - УБИРАЕМ ограничения высоты */}
          <div className="mb-6">
            <h4 className="text-black text-[15px] leading-[22px] font-product font-black italic mb-4">
              Бренды
            </h4>
            <div className="space-y-3">
              {filterOptions.brands.map((brand, index) => (
                <label key={index} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.brands.includes(brand)}
                    onChange={() => handleFilterChange('brands', brand)}
                    className="w-[15px] h-[15px] border border-black mr-4"
                  />
                  <span className="text-black text-[15px] leading-[20px] font-product">
                    {brand}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <FilterDivider />

          {/* Пол */}
          <div className="mb-6">
            <h4 className="text-black text-[15px] leading-[22px] font-product font-black italic mb-4">
              Пол
            </h4>
            <div className="space-y-3">
              {filterOptions.genders.map((gender, index) => (
                <label key={index} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.genders.includes(gender)}
                    onChange={() => handleFilterChange('genders', gender)}
                    className="w-[15px] h-[15px] border border-black mr-4"
                  />
                  <span className="text-black text-[15px] leading-[20px] font-product">
                    {gender}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <FilterDivider />

          {/* Категория */}
          <div className="mb-6">
            <h4 className="text-black text-[15px] leading-[22px] font-product font-black italic mb-4">
              Категория
            </h4>
            <div className="space-y-3">
              {filterOptions.categories.map((category, index) => (
                <label key={index} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={() => handleFilterChange('categories', category)}
                    className="w-[15px] h-[15px] border border-black mr-4"
                  />
                  <span className="text-black text-[15px] leading-[20px] font-product">
                    {category}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <FilterDivider />

          {/* Размер */}
          <div className="mb-6">
            <h4 className="text-black text-[15px] leading-[22px] font-product font-black italic mb-4">
              Размер
            </h4>
            
            {/* Сетка размеров */}
            <div className="grid grid-cols-6 gap-1">
              {filterOptions.sizes.map((size, index) => (
                <button
                  key={index}
                  onClick={() => handleFilterChange('sizes', size)}
                  className={`h-[40px] border border-[#595047] flex items-center justify-center text-[16px] leading-[20px] font-product transition-colors ${
                    filters.sizes.includes(size)
                      ? 'bg-[#595047] text-white'
                      : 'bg-white text-[#595047] hover:bg-gray-50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Дополнительное пространство внизу */}
          <div className="h-24"></div>
        </div>
      </div>

      {/* Футер с кнопками - ФИКСИРОВАННЫЙ */}
      <div className="bg-white border-t border-gray-200 p-5">
        <div className="flex gap-3">
          <button
            onClick={onClearFilters}
            className="flex-1 h-[48px] bg-white border border-black text-black text-[14px] font-product hover:bg-gray-50 transition-colors"
          >
            СБРОСИТЬ
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-[48px] bg-black text-white text-[14px] font-product hover:bg-gray-800 transition-colors"
          >
            ПОКАЗАТЬ ({totalResults})
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MobileFilters;