// src/components/Catalog/Filters/SizeFilter.tsx - ИСПРАВЛЕНО
'use client';

import React from 'react';

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
  // Если showAll = true, показываем все размеры
  const displaySizes = showAll ? options : options.slice(0, maxItems);
  
  return (
    <div className="filter-section">
      <h3 className="text-black text-[20px] lg:text-[25px] leading-[25px] lg:leading-[37px] font-product font-black italic mb-4">
        {title}
      </h3>
      
      {/* Сетка размеров */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-1 lg:gap-2">
        {displaySizes.map((size, index) => (
          <button
            key={index}
            onClick={() => onChange(size)}
            className={`h-[40px] lg:h-[50px] border border-[#595047] flex items-center justify-center text-[16px] lg:text-[20px] leading-[20px] lg:leading-[27px] font-product transition-colors ${
              selectedValues.includes(size)
                ? 'bg-[#595047] text-white'
                : 'bg-white text-[#595047] hover:bg-gray-50'
            }`}
          >
            {size}
          </button>
        ))}
      </div>
      
      {/* Показываем количество размеров если не все отображены */}
      {!showAll && options.length > maxItems && (
        <p className="text-[12px] lg:text-[14px] text-gray-500 mt-2 font-product">
          Показано {maxItems} из {options.length} размеров
        </p>
      )}
    </div>
  );
};

export default SizeFilter;