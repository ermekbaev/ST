'use client';

import React, { useState } from 'react';

interface CheckboxFilterProps {
  title: string;
  options: string[];
  selectedValues: string[];
  onChange: (value: string) => void;
  maxHeight?: string; 
  maxVisible?: number; 
}

const CheckboxFilter: React.FC<CheckboxFilterProps> = ({
  title,
  options,
  selectedValues,
  onChange,
  maxHeight, 
  maxVisible = 6 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const displayOptions = isExpanded ? options : options.slice(0, maxVisible);
  const hasMore = options.length > maxVisible;
  const hiddenCount = options.length - maxVisible;

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

      {/* Список чекбоксов */}
      <div className="space-y-2 lg:space-y-3 mb-3">
        {displayOptions.map((option, index) => (
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

      {/* Кнопка "Показать еще" / "Скрыть" */}
      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[14px] lg:text-[16px] text-[#595047] hover:text-black transition-colors font-product underline flex items-center space-x-1"
        >
          <span>
            {isExpanded 
              ? 'Скрыть' 
              : `Показать еще ${hiddenCount}`
            }
          </span>
          <svg 
            className={`w-3 h-3 lg:w-4 lg:h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
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
          onClick={() => selectedValues.forEach(value => onChange(value))}
          className="mt-3 text-[12px] lg:text-[14px] text-gray-500 hover:text-red-600 transition-colors font-product underline block"
        >
          Сбросить {title.toLowerCase()}
        </button>
      )}
    </div>
  );
};

export default CheckboxFilter;