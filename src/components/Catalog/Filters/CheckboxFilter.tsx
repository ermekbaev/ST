// src/components/Catalog/Filters/CheckboxFilter.tsx
'use client';

import React from 'react';

interface CheckboxFilterProps {
  title: string;
  options: string[];
  selectedValues: string[];
  onChange: (value: string) => void;
  maxHeight?: string;
}

const CheckboxFilter: React.FC<CheckboxFilterProps> = ({
  title,
  options,
  selectedValues,
  onChange,
  maxHeight = 'max-h-[200px] lg:max-h-[300px]'
}) => {
  return (
    <div className="filter-section">
      <h3 className="text-black text-[20px] lg:text-[25px] leading-[25px] lg:leading-[37px] font-product font-black italic mb-4">
        {title}
      </h3>
      <div className={`space-y-2 lg:space-y-3 ${maxHeight} overflow-y-auto filter-scroll`}>
        {options.map((option, index) => (
          <label key={index} className="flex items-center cursor-pointer group">
            <input
              type="checkbox"
              checked={selectedValues.includes(option)}
              onChange={() => onChange(option)}
              className="w-[12px] h-[12px] lg:w-[15px] lg:h-[15px] border border-black mr-3 lg:mr-4 flex-shrink-0"
            />
            <span className="text-black text-[14px] lg:text-[17px] leading-[18px] lg:leading-[23px] font-product group-hover:text-gray-700 transition-colors">
              {option}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default CheckboxFilter;