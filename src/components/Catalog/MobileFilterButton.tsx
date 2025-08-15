'use client';

import React from 'react';

interface MobileFilterButtonProps {
  onOpenFilters: () => void; 
  totalResults: number;
  hasActiveFilters: boolean;
  className?: string;
}

const MobileFilterButton: React.FC<MobileFilterButtonProps> = ({
  onOpenFilters, 
  totalResults,
  hasActiveFilters,
  className = ''
}) => {
  return (
    <div className={`lg:hidden ${className}`}>
      <div className="flex items-center justify-between mb-4">
        {/* Счетчик результатов */}
        <div className="text-[#8C8072] text-[25px] leading-[34px] font-product">
          Найдено: {totalResults}
        </div>
        
        {/* Кнопка фильтра */}
        <button
          onClick={onOpenFilters}
          className="relative bg-[#0B0B0D] text-white px-4 py-2 flex items-center gap-2 hover:bg-gray-800 transition-colors"
        >
          <span className="text-white text-[15px] leading-[20px] font-product">
            ФИЛЬТР
          </span>
          
          {/* Индикатор активных фильтров */}
          {hasActiveFilters && (
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          )}
        </button>
      </div>
    </div>
  );
};

export default MobileFilterButton;