// src/components/Catalog/Filters/SizeFilter.tsx - ОБНОВЛЕННЫЙ с функцией сворачивания
'use client';

import React, { useState } from 'react';

interface SizeFilterProps {
  title: string;
  options: string[];
  selectedValues: string[];
  onChange: (value: string) => void;
  maxItems?: number;
  showAll?: boolean;
}

const SizeFilter: React.FC<SizeFilterProps> = ({
  title,
  options,
  selectedValues,
  onChange,
  maxItems = 18,
  showAll = false
}) => {
  // Состояние для управления сворачиванием/разворачиванием
  const [isExpanded, setIsExpanded] = useState(showAll);
  
  // Определяем какие размеры показывать
  const displaySizes = isExpanded ? options : options.slice(0, maxItems);
  const hasMore = options.length > maxItems;
  const hiddenCount = options.length - maxItems;
  
  return (
    <div className="filter-section">
      {/* Заголовок с счетчиком выбранных */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-black text-[20px] lg:text-[25px] leading-[25px] lg:leading-[37px] font-product font-black italic">
          {title}
        </h3>
        {selectedValues.length > 0 && (
          <span className="bg-black text-white text-[12px] lg:text-[14px] px-2 py-1 rounded font-product">
            {selectedValues.length}
          </span>
        )}
      </div>
      
      {/* Сетка размеров */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-1 lg:gap-2 mb-3">
        {displaySizes.map((size, index) => (
          <button
            key={index}
            onClick={() => onChange(size)}
            className={`h-[40px] lg:h-[50px] border border-[#595047] flex items-center justify-center text-[16px] lg:text-[20px] leading-[20px] lg:leading-[27px] font-product transition-all duration-200 ${
              selectedValues.includes(size)
                ? 'bg-[#595047] text-white shadow-sm'
                : 'bg-white text-[#595047] hover:bg-gray-50 hover:shadow-sm'
            }`}
          >
            {size}
          </button>
        ))}
      </div>
      
      {/* Кнопка "Показать еще" / "Скрыть" */}
      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-2 lg:py-3 text-[14px] lg:text-[16px] text-[#595047] hover:text-black transition-colors font-product border border-[#595047] hover:border-black flex items-center justify-center space-x-2"
        >
          <span>
            {isExpanded 
              ? 'Скрыть' 
              : `Показать еще ${hiddenCount} размеров`
            }
          </span>
          <svg 
            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      {/* Кнопка "Сбросить" если есть выбранные */}
      {selectedValues.length > 0 && (
        <button
          onClick={() => selectedValues.forEach(size => onChange(size))}
          className="mt-3 text-[12px] lg:text-[14px] text-gray-500 hover:text-red-600 transition-colors font-product underline"
        >
          Сбросить размеры
        </button>
      )}
    </div>
  );
};

export default SizeFilter;