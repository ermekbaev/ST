'use client';

import React from 'react';

interface CatalogPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const CatalogPagination: React.FC<CatalogPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={`flex justify-center items-center gap-2 lg:gap-4 mt-12 ${className}`}>
      {/* Кнопка "Назад" */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="pagination-arrow w-4 h-4 lg:w-5 lg:h-5 transform -rotate-45 disabled:opacity-30"
        aria-label="Предыдущая страница"
      />
      
      {/* Номера страниц */}
      {visiblePages.map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="text-lg lg:text-[25px] leading-[22px] lg:leading-[34px] font-product text-[#8C8072] px-1 lg:px-2">
              ...
            </span>
          ) : (
            <button
              onClick={() => onPageChange(page as number)}
              className={`pagination-button text-lg lg:text-[25px] leading-[22px] lg:leading-[34px] font-product px-1 lg:px-2 min-w-[32px] lg:min-w-[40px] ${
                currentPage === page 
                  ? 'text-black font-bold' 
                  : 'text-[#8C8072] hover:text-black'
              }`}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}

      {/* Кнопка "Вперед" */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="pagination-arrow w-4 h-4 lg:w-5 lg:h-5 transform rotate-45 disabled:opacity-30"
        aria-label="Следующая страница"
      />
    </div>
  );
};

export default CatalogPagination;