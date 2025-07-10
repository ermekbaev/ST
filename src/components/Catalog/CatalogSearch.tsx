// src/components/Catalog/CatalogSearch.tsx
'use client';

import React from 'react';

interface CatalogSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  totalResults: number;
  className?: string;
}

const CatalogSearch: React.FC<CatalogSearchProps> = ({
  searchQuery,
  onSearchChange,
  totalResults,
  className = ''
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="text-[#8C8072] text-[25px] lg:text-[25px] leading-[34px] mb-4 font-product">
        Найдено: {totalResults}
      </div>
      
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="введите название товара"
          className="w-full h-[40px] lg:h-[50px] px-4 bg-[#E5DDD4] text-black placeholder-[#8C8072] font-product text-[16px] lg:text-[20px] leading-[27px] border-0 focus:outline-none"
        />
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <img src="/icons/search.svg" alt="Search" className="w-4 h-4 lg:w-5 lg:h-5" />
        </div>
      </div>
    </div>
  );
};

export default CatalogSearch;