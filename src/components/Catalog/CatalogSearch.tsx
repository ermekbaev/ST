// src/components/Catalog/CatalogSearch.tsx - ИСПРАВЛЕНО
'use client';

import React from 'react';

interface CatalogSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const CatalogSearch: React.FC<CatalogSearchProps> = ({
  value,
  onChange,
  placeholder = "введите название товара",
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-[40px] lg:h-[50px] px-4 bg-[#E5DDD4] text-black placeholder-[#8C8072] font-product text-[16px] lg:text-[20px] leading-[27px] border-0 focus:outline-none"
      />
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="w-4 h-4 lg:w-5 lg:h-5">
          <path 
            d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z" 
            stroke="#8C8072" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M19 19L14.65 14.65" 
            stroke="#8C8072" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

export default CatalogSearch;