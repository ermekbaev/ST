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

  const handleSortChange = (option: string) => {
    if (onSortChange) {
      onSortChange(option);
    }
  };

  const handleShowResults = () => {
    onClose();
  };

  const FilterDivider = () => (
    <div className="w-full h-0.5 bg-black my-4"></div>
  );

  if (!mounted || !isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 bg-white">
      {/* Заголовок */}
      <div className="flex items-center justify-between p-5 border-b border-gray-200">
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

      {/* Контент фильтров */}
      <div className="flex-1 overflow-y-auto p-5">
        
        {/* Сортировка */}
        <div className="mb-6">
          <h3 className="text-black text-[15px] leading-[20px] font-product mb-4">
            СОРТИРОВАТЬ ПО:
          </h3>
          
          <div className="space-y-3">
            {[
              'по популярности',
              'по новизне', 
              'по цене: сначала дешевле',
              'по цене: сначала дороже'
            ].map((option, index) => (
              <label key={index} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="sort"
                  checked={sortBy === option}
                  onChange={() => handleSortChange(option)}
                  className="w-[10px] h-[10px] border border-black mr-3 accent-black"
                />
                <span className="text-[#595047] text-[15px] leading-[20px] font-product">
                  {option}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-black text-[15px] leading-[20px] font-product">
            ФИЛЬТРЫ:
          </h3>
        </div>

        <FilterDivider />

        {/* Цена */}
        <div className="mb-6">
          <h3 className="text-black text-[15px] leading-[22px] font-product font-black italic mb-4">
            Цена
          </h3>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="number"
                placeholder="от"
                value={filters.priceRange.min}
                onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, min: e.target.value })}
                className="w-full h-[52px] px-3 bg-[#E5DDD4] text-[#8C8072] text-[20px] leading-[27px] text-center border-0 focus:outline-none font-product"
              />
            </div>
            <div className="flex-1">
              <input
                type="number"
                placeholder="до"
                value={filters.priceRange.max}
                onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, max: e.target.value })}
                className="w-full h-[52px] px-3 bg-[#E5DDD4] text-[#8C8072] text-[20px] leading-[27px] text-center border-0 focus:outline-none font-product"
              />
            </div>
          </div>
        </div>

        <FilterDivider />

        {/* Бренды */}
        <div className="mb-6">
          <h3 className="text-black text-[15px] leading-[22px] font-product font-black italic mb-4">
            Бренды
          </h3>
          <div className="max-h-[340px] overflow-y-auto filter-scroll">
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
          
          {/* Скроллбар для брендов */}
          <div className="w-[10px] h-[235px] bg-[#E5DDD4] rounded-full relative mt-4">
            <div className="w-[10px] h-[235px] bg-[#0B0B0D] rounded-full"></div>
          </div>
        </div>

        <FilterDivider />

        {/* Пол */}
        <div className="mb-6">
          <h3 className="text-black text-[15px] leading-[22px] font-product font-black italic mb-4">
            Пол
          </h3>
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
          <h3 className="text-black text-[15px] leading-[22px] font-product font-black italic mb-4">
            Категория
          </h3>
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
          <h3 className="text-black text-[15px] leading-[22px] font-product font-black italic mb-4">
            Размер
          </h3>
          
          {/* Сетка размеров в 6 колонок согласно макету */}
          <div className="grid grid-cols-6 gap-1">
            {filterOptions.sizes.slice(0, 18).map((size, index) => (
              <button
                key={index}
                onClick={() => handleFilterChange('sizes', size)}
                className={`size-button h-[50px] border border-[#595047] flex items-center justify-center text-[20px] leading-[27px] font-product transition-colors ${
                  filters.sizes.includes(size)
                    ? 'bg-[#595047] text-white'
                    : 'bg-white text-[#595047] hover:bg-gray-50'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          
          {/* Дополнительные ряды размеров */}
          <div className="grid grid-cols-6 gap-1 mt-1">
            {filterOptions.sizes.slice(18, 36).map((size, index) => (
              <button
                key={index + 18}
                onClick={() => handleFilterChange('sizes', size)}
                className={`size-button h-[50px] border border-[#595047] flex items-center justify-center text-[20px] leading-[27px] font-product transition-colors ${
                  filters.sizes.includes(size)
                    ? 'bg-[#595047] text-white'
                    : 'bg-white text-[#595047] hover:bg-gray-50'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-3 gap-1 mt-1">
            {filterOptions.sizes.slice(36, 39).map((size, index) => (
              <button
                key={index + 36}
                onClick={() => handleFilterChange('sizes', size)}
                className={`size-button h-[50px] border border-[#595047] flex items-center justify-center text-[20px] leading-[27px] font-product transition-colors ${
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
      </div>

      {/* Кнопка "ПОКАЗАТЬ" */}
      <div className="p-5 border-t border-gray-200">
        <button
          onClick={handleShowResults}
          className="w-full h-[57px] bg-[#0B0B0D] text-white flex items-center justify-center hover:bg-gray-800 transition-colors"
        >
          <span className="text-[25px] leading-[34px] font-product">
            ПОКАЗАТЬ
          </span>
        </button>
      </div>
    </div>,
    document.body
  );
};

export default MobileFilters;