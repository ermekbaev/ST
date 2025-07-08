// src/components/Product/Info/DesktopProductInfo.tsx
'use client';

import React, { useState } from 'react';

// Импортируем типы из главного компонента
export interface ProductSize {
  size: string;
  price: number;
  available: boolean;
  originalPrice?: number;
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

interface DesktopProductInfoProps {
  product: ProductInfo;
  selectedSize: string | null;
  selectedSizeInfo: ProductSize | null | undefined;
  onSizeSelect: (size: string) => void;
  onAddToCart: () => void;
  isAddingToCart: boolean;
}

const DesktopProductInfo: React.FC<DesktopProductInfoProps> = ({
  product,
  selectedSize,
  selectedSizeInfo,
  onSizeSelect,
  onAddToCart,
  isAddingToCart
}) => {
  const [isSizeDropdownOpen, setIsSizeDropdownOpen] = useState(false);

  // Форматирование цены
  const formatPrice = (price: number) => {
    return price.toLocaleString('ru-RU') + ' ₽';
  };

  // Получаем финальную цену (из выбранного размера или базовую)
  const finalPrice = selectedSizeInfo?.price || product.price;
  const hasDiscount = selectedSizeInfo?.originalPrice && selectedSizeInfo.originalPrice > finalPrice;

  // Сортируем размеры по числовому значению
  const sortedSizes = [...product.sizes].sort((a, b) => {
    const aNum = parseFloat(a.size.replace(/[^\d.]/g, ''));
    const bNum = parseFloat(b.size.replace(/[^\d.]/g, ''));
    return aNum - bNum;
  });

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Название товара */}
      <h1 
        className="text-black text-2xl leading-tight"
        style={{
          fontFamily: 'Random Grotesque, Arial, sans-serif',
          fontWeight: 400,
          fontSize: '25px',
          lineHeight: '35px'
        }}
      >
        {product.name}
      </h1>

      {/* Цена */}
      <div className="flex items-center gap-4">
        <span 
          className="text-[#595047]"
          style={{
            fontFamily: 'Random Grotesque, Arial, sans-serif',
            fontWeight: 400,
            fontSize: '30px',
            lineHeight: '41px'
          }}
        >
          {formatPrice(finalPrice)}
        </span>
        
        {hasDiscount && selectedSizeInfo?.originalPrice && (
          <span 
            className="text-gray-400 line-through"
            style={{
              fontFamily: 'Random Grotesque, Arial, sans-serif',
              fontWeight: 400,
              fontSize: '24px'
            }}
          >
            {formatPrice(selectedSizeInfo.originalPrice)}
          </span>
        )}
      </div>

      {/* Кнопка "Добавить в корзину" с выбранным размером */}
      <div className="relative">
        <button
          onClick={onAddToCart}
          disabled={!selectedSize || isAddingToCart || !product.inStock}
          className={`w-full max-w-2xl h-20 flex items-center justify-between px-6 transition-all ${
            !selectedSize || !product.inStock
              ? 'bg-gray-400 cursor-not-allowed' 
              : isAddingToCart
              ? 'bg-gray-600 cursor-wait'
              : 'bg-[#0B0B0D] hover:bg-gray-800'
          }`}
          style={{
            fontFamily: 'Random Grotesque, Arial, sans-serif'
          }}
        >
          {/* Левая часть - размер */}
          <div className="flex items-center">
            <span 
              className="text-white"
              style={{
                fontWeight: 400,
                fontSize: '30px',
                lineHeight: '41px'
              }}
            >
              {selectedSize || 'Размер'}
            </span>
          </div>

          {/* Разделитель */}
          <div className="w-px h-12 bg-white"></div>

          {/* Правая часть - текст кнопки */}
          <div className="flex items-center justify-center flex-1">
            <span 
              className="text-white"
              style={{
                fontWeight: 400,
                fontSize: '30px',
                lineHeight: '41px'
              }}
            >
              {isAddingToCart ? 'ДОБАВЛЯЕМ...' : 'ДОБАВИТЬ В КОРЗИНУ'}
            </span>
          </div>
        </button>
      </div>

      {/* Заголовок "ВЫБЕРИТЕ РАЗМЕР" */}
      <div>
        <h3 
          className="text-black mb-4"
          style={{
            fontFamily: 'Random Grotesque, Arial, sans-serif',
            fontWeight: 400,
            fontSize: '30px',
            lineHeight: '41px'
          }}
        >
          ВЫБЕРИТЕ РАЗМЕР
        </h3>

        {/* Выпадающий список размеров */}
        <div className="relative">
          <button
            onClick={() => setIsSizeDropdownOpen(!isSizeDropdownOpen)}
            className="w-full max-w-2xl h-20 border border-[#0B0B0D] bg-white flex items-center justify-between px-6 hover:bg-gray-50 transition-colors"
          >
            <span 
              className="text-black"
              style={{
                fontFamily: 'Random Grotesque, Arial, sans-serif',
                fontWeight: 400,
                fontSize: '30px',
                lineHeight: '41px'
              }}
            >
              {selectedSize ? 
                `${selectedSize} RU — ${formatPrice(selectedSizeInfo?.price || product.price)}` 
                : 'Выберите размер'
              }
            </span>
            
            {/* Стрелка */}
            <div 
              className={`w-3 h-3 border-r-2 border-b-2 border-black transform transition-transform ${
                isSizeDropdownOpen ? '-rotate-45' : 'rotate-45'
              }`}
              style={{ marginTop: isSizeDropdownOpen ? '4px' : '-4px' }}
            ></div>
          </button>

          {/* Список размеров */}
          {isSizeDropdownOpen && (
            <div className="absolute top-full left-0 w-full max-w-2xl bg-white border border-[#0B0B0D] border-t-0 shadow-lg z-10 max-h-80 overflow-y-auto">
              {sortedSizes.map((size, index) => (
                <button
                  key={size.size}
                  onClick={() => {
                    onSizeSelect(size.size);
                    setIsSizeDropdownOpen(false);
                  }}
                  disabled={!size.available}
                  className={`w-full h-20 border-b border-[#0B0B0D] last:border-b-0 flex items-center px-6 transition-colors ${
                    !size.available 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : selectedSize === size.size
                      ? 'bg-gray-100'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span 
                    className="text-left"
                    style={{
                      fontFamily: 'Random Grotesque, Arial, sans-serif',
                      fontWeight: 400,
                      fontSize: '30px',
                      lineHeight: '41px',
                      color: size.available ? '#000000' : '#9CA3AF'
                    }}
                  >
                    {size.size} RU — {formatPrice(size.price)}
                    {!size.available && ' (нет в наличии)'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Информация о доставке */}
      <div className="flex items-start gap-4 pt-4">
        {/* Иконка доставки */}
        <div className="flex-shrink-0 mt-1">
          <div className="w-10 h-10 flex items-center justify-center">
            {/* SVG иконка грузовика */}
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 15h20v10H5V15z" stroke="black" strokeWidth="1" fill="none"/>
              <path d="M25 20h5l3 3v7h-3" stroke="black" strokeWidth="1" fill="none"/>
              <circle cx="10" cy="30" r="2" stroke="black" strokeWidth="1" fill="none"/>
              <circle cx="25" cy="30" r="2" stroke="black" strokeWidth="1" fill="none"/>
              <path d="M10 28v-3M25 28v-3" stroke="black" strokeWidth="1"/>
            </svg>
          </div>
        </div>
        
        <div>
          <p 
            className="text-black"
            style={{
              fontFamily: 'Random Grotesque, Arial, sans-serif',
              fontWeight: 400,
              fontSize: '20px',
              lineHeight: '27px'
            }}
          >
            {product.deliveryInfo || 'Среднее время стандартной доставки: 15-20 рабочих дней.'}
          </p>
        </div>
      </div>

      {/* Блок качества */}
      <div 
        className="w-full max-w-2xl h-10 flex items-center px-6"
        style={{ backgroundColor: '#C8EBB9' }}
      >
        <span 
          className="text-black"
          style={{
            fontFamily: 'Random Grotesque, Arial, sans-serif',
            fontWeight: 400,
            fontSize: '20px',
            lineHeight: '27px'
          }}
        >
          Товар прошел проверку на качество и оригинальность
        </span>
      </div>

      {/* Информация о бренде */}
      <div className="border-t border-b border-[#8C8072] py-4">
        <div className="flex justify-between items-center">
          <span 
            className="text-[#8C8072]"
            style={{
              fontFamily: 'Random Grotesque, Arial, sans-serif',
              fontWeight: 400,
              fontSize: '20px',
              lineHeight: '35px'
            }}
          >
            Бренд
          </span>
          
          <span 
            className="text-[#8C8072]"
            style={{
              fontFamily: 'Random Grotesque, Arial, sans-serif',
              fontWeight: 400,
              fontSize: '20px',
              lineHeight: '35px'
            }}
          >
            {product.brand}
          </span>
          
          {/* Стрелка */}
          <div className="w-3 h-3 border-r-2 border-b-2 border-[#8C8072] transform rotate-45"></div>
        </div>
      </div>
    </div>
  );
};

export default DesktopProductInfo;