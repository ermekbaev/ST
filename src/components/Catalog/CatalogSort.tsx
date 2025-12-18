"use client";

import React from "react";

interface CatalogSortProps {
  sortBy: string;
  onSortChange: (value: string) => void;
  totalResults: number;
  className?: string;
}

const sortOptions = [
  { value: "popularity", label: "по популярности" },
  { value: "random", label: "в случайном порядке" }, // 🎲 НОВАЯ ОПЦИЯ
  { value: "price-asc", label: "по цене (возрастание)" },
  { value: "price-desc", label: "по цене (убывание)" },
  { value: "name", label: "по названию" },
  { value: "newest", label: "сначала новые" },
];

const CatalogSort: React.FC<CatalogSortProps> = ({
  sortBy,
  onSortChange,
  totalResults,
  className = "",
}) => {
  return (
    <div className={`flex justify-end mb-6 ${className}`}>
      <div className="sort-container w-full lg:w-[495px] h-[40px] lg:h-[50px] bg-[#E5DDD4] flex items-center px-4 lg:px-5">
        <span className="text-black text-[14px] lg:text-[20px] leading-[18px] lg:leading-[27px] font-product mr-2 lg:mr-4 flex-shrink-0">
          сортировать по:
        </span>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="sort-select flex-1 bg-transparent text-[#8C8072] text-[14px] lg:text-[20px] leading-[18px] lg:leading-[27px] font-product focus:outline-none cursor-pointer"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="sort-arrow w-2 h-2 lg:w-3 lg:h-3 border-r-2 border-b-2 border-[#8C8072] transform rotate-45 ml-2 flex-shrink-0 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default CatalogSort;
