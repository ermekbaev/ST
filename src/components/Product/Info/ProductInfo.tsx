// src/components/Product/Info/ProductInfo.tsx
'use client';

import React, { useState, useEffect } from 'react';

// Импорты компонентов - будут созданы как отдельные файлы
import DesktopProductInfo from './DesktopProductInfo';  
import MobileProductInfo from './MobileProductInfo';


export interface ProductSize {
  size: string;
  price: number;
  available: boolean;
  originalPrice?: number; // Для скидок
}

export interface ProductInfo {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  category: string;
  article: string;
  description?: string;
  sizes: ProductSize[];
  inStock: boolean;
  isNew?: boolean;
  isExclusive?: boolean;
  deliveryInfo?: string;
}

// Интерфейсы для пропсов дочерних компонентов
export interface CommonProductInfoProps {
  product: ProductInfo;
  selectedSize: string | null;
  selectedSizeInfo: ProductSize | null | undefined;
  onSizeSelect: (size: string) => void;
  onAddToCart: () => void;
  isAddingToCart: boolean;
}

interface ProductInfoProps {
  product: ProductInfo;
  selectedSize: string | null;
  onSizeSelect: (size: string) => void;
  onAddToCart: (size: string) => void;
  className?: string;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  selectedSize,
  onSizeSelect,
  onAddToCart,
  className = ''
}) => {
  const [mounted, setMounted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Функция добавления в корзину с загрузкой
  const handleAddToCart = async () => {
    if (!selectedSize) {
      alert('Пожалуйста, выберите размер');
      return;
    }

    setIsAddingToCart(true);
    
    try {
      // Имитируем загрузку
      await new Promise(resolve => setTimeout(resolve, 800));
      onAddToCart(selectedSize);
      
      // Показываем успешное добавление
      // Здесь можно добавить toast уведомление
      console.log(`Товар добавлен в корзину: ${product.name}, размер: ${selectedSize}`);
      
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      alert('Произошла ошибка. Попробуйте еще раз.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Получаем информацию о выбранном размере
  const selectedSizeInfo = selectedSize 
    ? product.sizes.find(s => s.size === selectedSize)
    : null;

  // Показываем заглушку до монтирования
  if (!mounted) {
    return (
      <div className={`w-full ${className}`}>
        <div className="animate-pulse">
          {/* Desktop заглушка */}
          <div className="hidden lg:block space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            <div className="h-16 bg-gray-200 rounded w-full"></div>
            <div className="h-12 bg-gray-200 rounded w-full"></div>
          </div>
          
          {/* Mobile заглушка */}
          <div className="block lg:hidden space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
            <div className="h-9 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  const commonProps: CommonProductInfoProps = {
    product,
    selectedSize,
    selectedSizeInfo,
    onSizeSelect,
    onAddToCart: handleAddToCart,
    isAddingToCart,
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Desktop версия */}
      <div className="hidden lg:block">
        <DesktopProductInfo {...commonProps} />
      </div>
      
      {/* Mobile версия */}
      <div className="block lg:hidden">
        <MobileProductInfo {...commonProps} />
      </div>
    </div>
  );
};

export default ProductInfo;