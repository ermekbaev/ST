// src/components/Catalog/ActiveFilters.tsx - ИСПРАВЛЕНО
'use client';

import React from 'react';

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

interface ActiveFiltersProps {
  filters: FilterState;
  onRemoveFilter: (filterType: keyof FilterState, value?: string) => void;
  onClearAll: () => void;  // ✅ ИСПРАВЛЕНО: изменено с onClearFilters на onClearAll
  className?: string;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  filters,
  onRemoveFilter,
  onClearAll,  // ✅ ИСПРАВЛЕНО: изменено с onClearFilters на onClearAll
  className = ''
}) => {
  // Собираем все активные фильтры
  const activeFilters: Array<{ type: keyof FilterState; value: string; label: string }> = [];

  // Добавляем фильтры по брендам
  filters.brands.forEach(brand => {
    activeFilters.push({
      type: 'brands',
      value: brand,
      label: `Бренд: ${brand}`
    });
  });

  // Добавляем фильтры по полу
  filters.genders.forEach(gender => {
    activeFilters.push({
      type: 'genders',
      value: gender,
      label: `Пол: ${gender}`
    });
  });

  // Добавляем фильтры по категориям
  filters.categories.forEach(category => {
    activeFilters.push({
      type: 'categories',
      value: category,
      label: `Категория: ${category}`
    });
  });

  // Добавляем фильтры по размерам
  filters.sizes.forEach(size => {
    activeFilters.push({
      type: 'sizes',
      value: size,
      label: `Размер: ${size}`
    });
  });

  // Добавляем фильтр по цене
  if (filters.priceRange.min || filters.priceRange.max) {
    const min = filters.priceRange.min || '0';
    const max = filters.priceRange.max || '∞';
    activeFilters.push({
      type: 'priceRange',
      value: '',
      label: `Цена: ${min} - ${max} ₽`
    });
  }

  // Если нет активных фильтров, не показываем компонент
  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className={`mb-6 ${className}`}>
      {/* Desktop версия */}
      <div className="hidden lg:block">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-[#8C8072] text-[20px] leading-[27px] font-product">
            Активные фильтры:
          </span>
          <button
            onClick={onClearAll}
            className="text-[#8C8072] text-[16px] leading-[22px] font-product hover:text-black transition-colors underline"
          >
            Очистить все
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <div
              key={`${filter.type}-${filter.value}-${index}`}
              className="bg-[#E5DDD4] px-4 py-2 flex items-center gap-2 group hover:bg-[#D9CDBF] transition-colors"
            >
              <span className="text-black text-[16px] leading-[22px] font-product">
                {filter.label}
              </span>
              <button
                onClick={() => onRemoveFilter(filter.type, filter.value || undefined)}
                className="text-black hover:text-red-600 transition-colors flex items-center justify-center w-4 h-4"
                aria-label={`Удалить фильтр ${filter.label}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile версия */}
      <div className="block lg:hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[#8C8072] text-[18px] leading-[25px] font-product">
            Активные фильтры:
          </span>
          <button
            onClick={onClearAll}
            className="text-[#8C8072] text-[14px] leading-[20px] font-product hover:text-black transition-colors underline"
          >
            Очистить все
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <div
              key={`${filter.type}-${filter.value}-${index}`}
              className="bg-[#E5DDD4] px-3 py-1 flex items-center gap-2 text-sm"
            >
              <span className="text-black text-[14px] leading-[20px] font-product">
                {filter.label}
              </span>
              <button
                onClick={() => onRemoveFilter(filter.type, filter.value || undefined)}
                className="text-black hover:text-red-600 transition-colors flex items-center justify-center w-3 h-3"
                aria-label={`Удалить фильтр ${filter.label}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActiveFilters;