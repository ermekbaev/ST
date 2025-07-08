// src/components/Product/Info/MobileProductInfo.tsx
'use client';

import React, { useState } from 'react';

// Импортируем типы (дублируем для независимости компонента)
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

interface MobileProductInfoProps {
  product: ProductInfo;
  selectedSize: string | null;
  selectedSizeInfo: ProductSize | null | undefined;
  onSizeSelect: (size: string) => void;
  onAddToCart: () => void;
  isAddingToCart: boolean;
}

const MobileProductInfo: React.FC<MobileProductInfoProps> = ({
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
    <div className="space-y-4 w-full max-w-sm">
      {/* Название товара */}
      <h1 
        className="text-black"
        style={{
          fontFamily: 'Random Grotesque, Arial, sans-serif',
          fontWeight: 400,
          fontSize: '15px',
          lineHeight: '20px'
        }}
      >
        {product.name}
      </h1>

      {/* Цена */}
      <div className="flex items-center gap-3">
        <span 
          className="text-[#BFB3A3]"
          style={{
            fontFamily: 'Random Grotesque, Arial, sans-serif',
            fontWeight: 400,
            fontSize: '25px',
            lineHeight: '34px'
          }}
        >
          {formatPrice(finalPrice)}
        </span>
        
        {hasDiscount && selectedSizeInfo?.originalPrice && (
          <span 
            className="text-gray-400 line-through text-lg"
            style={{
              fontFamily: 'Random Grotesque, Arial, sans-serif',
              fontWeight: 400
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
          className={`w-full h-9 flex items-center justify-between px-4 transition-all ${
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
                fontSize: '20px',
                lineHeight: '27px'
              }}
            >
              {selectedSize || '?'}
            </span>
          </div>

          {/* Разделитель */}
          <div className="w-px h-5 bg-white"></div>

          {/* Правая часть - текст кнопки */}
          <div className="flex items-center justify-center flex-1">
            <span 
              className="text-white"
              style={{
                fontWeight: 400,
                fontSize: '15px',
                lineHeight: '20px'
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
          className="text-black mb-2"
          style={{
            fontFamily: 'Random Grotesque, Arial, sans-serif',
            fontWeight: 400,
            fontSize: '15px',
            lineHeight: '20px'
          }}
        >
          ВЫБЕРИТЕ РАЗМЕР
        </h3>

        {/* Выпадающий список размеров */}
        <div className="relative">
          <button
            onClick={() => setIsSizeDropdownOpen(!isSizeDropdownOpen)}
            className="w-full h-9 border border-[#0B0B0D] bg-white flex items-center justify-between px-4 hover:bg-gray-50 transition-colors"
          >
            <span 
              className="text-black text-left"
              style={{
                fontFamily: 'Random Grotesque, Arial, sans-serif',
                fontWeight: 400,
                fontSize: '15px',
                lineHeight: '20px'
              }}
            >
              {selectedSize ? 
                `${selectedSize} RU — ${formatPrice(selectedSizeInfo?.price || product.price)}` 
                : 'Выберите размер'
              }
            </span>
            
            {/* Стрелка */}
            <div 
              className={`w-2 h-2 border-r-2 border-b-2 border-black transform transition-transform ${
                isSizeDropdownOpen ? '-rotate-45' : 'rotate-45'
              }`}
              style={{ marginTop: isSizeDropdownOpen ? '2px' : '-2px' }}
            ></div>
          </button>

          {/* Список размеров */}
          {isSizeDropdownOpen && (
            <div className="absolute top-full left-0 w-full bg-white border border-[#0B0B0D] border-t-0 shadow-lg z-10 max-h-60 overflow-y-auto">
              {sortedSizes.map((size) => (
                <button
                  key={size.size}
                  onClick={() => {
                    onSizeSelect(size.size);
                    setIsSizeDropdownOpen(false);
                  }}
                  disabled={!size.available}
                  className={`w-full h-9 border-b border-[#0B0B0D] last:border-b-0 flex items-center px-4 transition-colors ${
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
                      fontSize: '15px',
                      lineHeight: '20px',
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
      <div className="flex items-start gap-3 pt-2">
        {/* Иконка доставки */}
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-4 h-4 flex items-center justify-center">
            {/* Упрощенная SVG иконка для мобильного */}
            <img src="../icons/delivery.svg" alt="" />

          </div>
        </div>
        
        <div className="flex-1">
          <p 
            className="text-black"
            style={{
              fontFamily: 'Random Grotesque, Arial, sans-serif',
              fontWeight: 400,
              fontSize: '10px',
              lineHeight: '14px'
            }}
          >
            {product.deliveryInfo || 'Среднее время стандартной доставки: 15-20 рабочих дней.'}
          </p>
        </div>
      </div>

      {/* Блок качества */}
      <div 
        className="w-full h-5 flex items-center px-4"
        style={{ backgroundColor: '#C8EBB9' }}
      >
        <span 
          className="text-black"
          style={{
            fontFamily: 'Random Grotesque, Arial, sans-serif',
            fontWeight: 400,
            fontSize: '11px',
            lineHeight: '12px'
          }}
        >
          Товар прошел проверку на качество и оригинальность
        </span>
      </div>

      {/* Информация о бренде */}
      <div className="border-t border-b border-[#8C8072] py-2">
        <div className="flex justify-between items-center">
          <span 
            className="text-[#8C8072]"
            style={{
              fontFamily: 'Random Grotesque, Arial, sans-serif',
              fontWeight: 400,
              fontSize: '10px',
              lineHeight: '35px'
            }}
          >
            Бренд
          </span>
          <div className='flex justify-between items-center'>

          <span 
            className="text-[#8C8072] mr-2"
            style={{
              fontFamily: 'Random Grotesque, Arial, sans-serif',
              fontWeight: 400,
              fontSize: '10px',
              lineHeight: '35px'
            }}
          >
            {product.brand}
          </span>
          
          {/* Стрелка */}
          <img src="../utils/arrow_right.svg" alt="" width={10}/>
        </div>
        </div>

      </div>
    </div>
  );
};

export default MobileProductInfo;