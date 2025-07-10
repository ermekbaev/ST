// src/components/Catalog/Filters/SizeFilter.tsx
'use client';

import React from 'react';

interface SizeFilterProps {
  sizes: string[];
  selectedSizes: string[];
  onChange: (size: string) => void;
  maxItems?: number;
}

const SizeFilter: React.FC<SizeFilterProps> = ({
  sizes,
  selectedSizes,
  onChange,
  maxItems = 18
}) => {
  const displaySizes = sizes.slice(0, maxItems);

  return (
    <div className="filter-section">
      <h3 className="text-black text-[20px] lg:text-[25px] leading-[25px] lg:leading-[37px] font-product font-black italic mb-4">
        Размер
      </h3>
      <div className="grid grid-cols-4 lg:grid-cols-6 gap-1 lg:gap-2">
        {displaySizes.map((size, index) => (
          <button
            key={index}
            onClick={() => onChange(size)}
            className={`size-button h-[40px] lg:w-[68px] lg:h-[68px] border border-[#595047] flex items-center justify-center text-[16px] lg:text-[25px] leading-[20px] lg:leading-[34px] font-product transition-colors ${
              selectedSizes.includes(size)
                ? 'size-button--selected'
                : 'bg-white text-[#595047] hover:bg-gray-50'
            }`}
          >
            {size}
          </button>
        ))}
      </div>
      
      {sizes.length > maxItems && (
        <div className="mt-2 text-[#8C8072] text-[12px] lg:text-[14px] font-product">
          Показано {maxItems} из {sizes.length} размеров
        </div>
      )}
    </div>
  );
};

export default SizeFilter;