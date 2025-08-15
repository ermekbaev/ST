'use client';

import React from 'react';
import ProductCard from '../Product/ProductCard';

interface Product {
  id?: string;
  article: string;
  brand: string;
  name: string;
  size: string;
  category: string;
  gender: string;
  price: number;
  photo: string;
}

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  onClearFilters?: () => void;
  className?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading,
  onClearFilters,
  className = ''
}) => {
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {Array.from({ length: 20 }, (_, index) => (
        <div key={index} className="bg-white w-full loading-skeleton">
          <div className="w-full h-[150px] lg:h-[200px] bg-gray-200"></div>
          <div className="w-full h-px bg-gray-200"></div>
          <div className="py-2 space-y-2">
            <div className="h-5 lg:h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 lg:h-5 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-20">
      <div className="mb-4">
        <svg 
          className="mx-auto h-16 w-16 text-gray-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.034 0-3.9.785-5.291 2.09m0 0L4 19.5l2.709-2.409M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      
      <h3 className="text-lg lg:text-[25px] leading-[22px] lg:leading-[34px] font-product text-[#8C8072] mb-4">
        Товары не найдены
      </h3>
      
      <p className="text-sm lg:text-base text-gray-500 mb-6 font-product">
        Попробуйте изменить критерии поиска или очистить фильтры
      </p>
      
      {onClearFilters && (
        <button
          onClick={onClearFilters}
          className="px-6 py-3 bg-[#0B0B0D] text-white font-product hover:bg-gray-800 transition-colors text-sm lg:text-base"
        >
          Очистить фильтры
        </button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className={className}>
        <LoadingSkeleton />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={className}>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 ${className}`}>
      {products.map((product, index) => (
        <ProductCard key={product.id || `${product.article}-${index}`} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;