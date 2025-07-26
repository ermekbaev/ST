// src/components/Catalog/MobileFilters.tsx - ИСПРАВЛЕНО
'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PriceFilter from './Filters/PriceFilter';
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

interface MobileFiltersProps {
  filters: FilterState;
  filterOptions: {
    brands: string[];
    genders: string[];
    categories: string[];
    sizes: string[];
  };
  // ✅ ИСПРАВЛЕНО: Правильная типизация для onFilterChange
  onFilterChange: (filterType: keyof FilterState, value: string | string[] | { min: string; max: string }) => void;
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
  
  // Загружаем фильтры из Strapi
  const { brands: strapiBrands, categories: strapiCategories, sizes: strapiSizes, loading, error } = useCatalogFilters();

  // Стандартные варианты пола (статичные данные)
  const genders = [
    { name: 'Мужской' },
    { name: 'Женский' },
    { name: 'Унисекс' },
    { name: 'Детский' }
  ];

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

  // ✅ ИСПРАВЛЕНО: Правильная обработка фильтров
  const handleFilterChange = (filterType: keyof FilterState, value: string | { min: string; max: string }) => {
    if (filterType === 'priceRange') {
      onFilterChange(filterType, value);
    } else {
      const currentValues = filters[filterType] as string[];
      const newValues = currentValues.includes(value as string)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value as string];
      // ✅ ИСПРАВЛЕНО: Передаем массив правильно
      onFilterChange(filterType, newValues);
    }
  };

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

  if (!mounted || !isOpen) {
    return null;
  }

  const FilterDivider = () => (
    <div className="w-full h-0.5 bg-black my-6"></div>
  );

  const LoadingSkeleton = ({ count = 5 }: { count?: number }) => (
    <div className="animate-pulse space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded w-2/3"></div>
      ))}
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* Заголовок */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-5 z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-black text-[18px] leading-[25px] font-product font-black">
            ФИЛЬТРЫ И СОРТИРОВКА
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="black" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Контент */}
      <div className="p-5">
        {/* СОРТИРОВКА */}
        <div className="mb-6">
          <h3 className="text-black text-[15px] leading-[20px] font-product mb-4">
            СОРТИРОВКА
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

        {/* Бренды */}
        {(brandsToShow.length > 0 || loading) && (
          <>
            <div className="mb-6">
              <h4 className="text-black text-[15px] leading-[22px] font-product font-black italic mb-4">
                Бренды
              </h4>
              {loading ? (
                <LoadingSkeleton />
              ) : (
                <div className="space-y-3">
                  {brandsToShow.map((brand, index) => (
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
              )}
            </div>
            <FilterDivider />
          </>
        )}

        {/* Пол */}
        <div className="mb-6">
          <h4 className="text-black text-[15px] leading-[22px] font-product font-black italic mb-4">
            Пол
          </h4>
          <div className="space-y-3">
            {gendersToShow.map((gender, index) => (
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
        {(categoriesToShow.length > 0 || loading) && (
          <>
            <div className="mb-6">
              <h4 className="text-black text-[15px] leading-[22px] font-product font-black italic mb-4">
                Категория
              </h4>
              {loading ? (
                <LoadingSkeleton count={4} />
              ) : (
                <div className="space-y-3">
                  {categoriesToShow.map((category, index) => (
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
              )}
            </div>
            <FilterDivider />
          </>
        )}

        {/* Размер */}
        {(sizesToShow.length > 0 || loading) && (
          <div className="mb-6">
            <h4 className="text-black text-[15px] leading-[22px] font-product font-black italic mb-4">
              Размер
            </h4>
            
            {loading ? (
              <div className="animate-pulse grid grid-cols-6 gap-1">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-6 gap-1">
                {sizesToShow.map((size, index) => (
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
            )}
          </div>
        )}

        {/* Сообщения об ошибках */}
        {error && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
            <p className="text-sm text-yellow-800">
              ⚠️ Ошибка загрузки фильтров из Strapi
            </p>
            <p className="text-xs text-yellow-600 mt-1">{error}</p>
          </div>
        )}

        {/* Информация если нет данных */}
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

        {/* Дополнительное пространство внизу */}
        <div className="h-24"></div>
      </div>

      {/* Футер с кнопками - ФИКСИРОВАННЫЙ */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-5">
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