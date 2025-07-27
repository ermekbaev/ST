// src/components/Product/Info/DesktopProductInfo.tsx - ВАШ КОД с минимальными исправлениями
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
  sizes: ProductSize[]; // оставляем для совместимости
  allSizes?: ProductSize[]; // ДОБАВИЛИ: размеры с API
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

  // ИСПРАВЛЕНО: Используем размеры из API (allSizes) если есть, иначе sizes
  const availableSizes = product.allSizes && product.allSizes.length > 0 ? product.allSizes : product.sizes;

  // ИСПРАВЛЕНО: Получаем информацию о выбранном размере из правильного источника
  const actualSelectedSizeInfo = selectedSize && availableSizes
    ? availableSizes.find(s => s.size === selectedSize)
    : selectedSizeInfo;

  // Получаем финальную цену (из выбранного размера или базовую)
  const finalPrice = actualSelectedSizeInfo?.price || product.price;
  const hasDiscount = actualSelectedSizeInfo?.originalPrice && actualSelectedSizeInfo.originalPrice > finalPrice;

  // Сортируем размеры по числовому значению
  const sortedSizes = [...availableSizes].sort((a, b) => {
    const aNum = parseFloat(a.size.replace(/[^\d.]/g, ''));
    const bNum = parseFloat(b.size.replace(/[^\d.]/g, ''));
    return aNum - bNum;
  });

  // ЛОГИКА ТЕКСТА КНОПКИ
  const getButtonText = () => {
    if (isAddingToCart) return 'ДОБАВЛЯЕМ...';
    if (!selectedSize) return 'НЕ ВЫБРАНО';
    return 'ДОБАВИТЬ В КОРЗИНУ';
  };

  return (
    <div className="space-y-6 w-full">
      {/* Название товара */}
      <h1 className="product-name--large text-black">
        {product.name}
      </h1>

      {/* Цена */}
      <div className="flex items-center gap-4">
        <span className="product-price--large text-brand-gray">
          {formatPrice(finalPrice)}
        </span>
        
        {hasDiscount && actualSelectedSizeInfo?.originalPrice && (
          <span className="product-price--medium text-gray-400 line-through">
            {formatPrice(actualSelectedSizeInfo.originalPrice)}
          </span>
        )}
      </div>

      {/* Кнопка "Добавить в корзину" с выбранным размером */}
      <div className="relative">
        <button
          onClick={onAddToCart}
          disabled={!selectedSize || isAddingToCart || !product.inStock}
          className={`btn-add-cart btn-add-cart--desktop ${
            !selectedSize || !product.inStock
              ? 'bg-gray-400 cursor-not-allowed' 
              : isAddingToCart
              ? 'bg-gray-600 cursor-wait'
              : ''
          }`}
        >
          {/* Левая часть - "Размер" или конкретный размер */}
          <div className="flex items-center justify-center w-32">
            <span className="text-white text-[24px] leading-[32px]">
              {selectedSize || 'Размер'}
            </span>
          </div>

          {/* Разделитель */}
          <div className="btn-add-cart__divider btn-add-cart__divider--desktop"></div>

          {/* Правая часть - текст кнопки */}
          <div className="flex items-center justify-center flex-1">
            <span className="text-white text-[26px] leading-[41px]">
              {getButtonText()}
            </span>
          </div>
        </button>
      </div>

      {/* Заголовок "ВЫБЕРИТЕ РАЗМЕР" */}
      <div>
        <h3 className="text-body--large text-black mb-4 uppercase">
          ВЫБЕРИТЕ РАЗМЕР
        </h3>

        {/* Выпадающий список размеров */}
        <div className="relative">
          <button
            onClick={() => setIsSizeDropdownOpen(!isSizeDropdownOpen)}
            className="size-dropdown size-dropdown--desktop"
          >
            <span className="text-black text-[30px] leading-[41px]">
              {selectedSize ? 
                `${selectedSize} RU — ${formatPrice(actualSelectedSizeInfo?.price || product.price)}` 
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
            <div className="size-dropdown-list">
              {sortedSizes.map((size, index) => (
                <button
                  key={size.size}
                  onClick={() => {
                    onSizeSelect(size.size);
                    setIsSizeDropdownOpen(false);
                  }}
                  disabled={!size.available}
                  className={`size-dropdown-item size-dropdown-item--desktop ${
                    selectedSize === size.size ? 'selected' : ''
                  }`}
                >
                  <span className="text-left text-[30px] leading-[41px]">
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
            <img src="../icons/delivery.svg" alt="" />
          </div>
        </div>
        
        <div>
          <p className="text-body--large text-black">
            {product.deliveryInfo || 'Среднее время стандартной доставки: 15-20 рабочих дней.'}
          </p>
        </div>
      </div>

      {/* Блок качества */}
      <div className="quality-badge">
        <span className="text-black text-[15px] leading-[27px]">
          Товар прошел проверку на качество и оригинальность
        </span>
      </div>

      {/* Информация о бренде */}
      <div className="border-t border-b border-brand-light-gray py-4">
        <div className="flex justify-between items-center">
          <span className="text-brand-light-gray text-body--large leading-[35px]">
            Бренд
          </span>
          <div className="flex justify-between items-center gap-2">
            <span className="text-brand-light-gray text-body--large leading-[35px]">
              {product.brand}
            </span>
            {/* Стрелка */}
            <img src="../utils/arrow_right.svg" alt="" className="w-[10px]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopProductInfo;