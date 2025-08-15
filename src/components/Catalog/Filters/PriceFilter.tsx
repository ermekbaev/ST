'use client';

import React from 'react';

interface PriceFilterProps {
  priceRange: {
    min: string;
    max: string;
  };
  onChange: (priceRange: { min: string; max: string }) => void;
}

const PriceFilter: React.FC<PriceFilterProps> = ({ priceRange, onChange }) => {
  return (
    <div className="filter-section">
      <h3 className="text-black text-[20px] lg:text-[25px] leading-[25px] lg:leading-[37px] font-product font-black italic mb-4">
        Цена
      </h3>
      <div className="flex gap-2 lg:gap-4">
        <div className="flex-1">
          <input
            type="number"
            placeholder="от"
            value={priceRange.min}
            onChange={(e) => onChange({ ...priceRange, min: e.target.value })}
            className="w-full h-[50px] lg:h-[70px] px-3 lg:px-4 bg-[#E5DDD4] text-[#8C8072] text-[16px] lg:text-[20px] leading-[27px] text-center border-0 focus:outline-none font-product"
          />
        </div>
        <div className="flex-1">
          <input
            type="number"
            placeholder="до"
            value={priceRange.max}
            onChange={(e) => onChange({ ...priceRange, max: e.target.value })}
            className="w-full h-[50px] lg:h-[70px] px-3 lg:px-4 bg-[#E5DDD4] text-[#8C8072] text-[16px] lg:text-[20px] leading-[27px] text-center border-0 focus:outline-none font-product"
          />
        </div>
      </div>
    </div>
  );
};

export default PriceFilter;