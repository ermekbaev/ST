'use client';

import React, { useState } from 'react';

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
  allSizes?: ProductSize[]; 
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

  const formatPrice = (price: number) => {
    return price.toLocaleString('ru-RU') + ' ₽';
  };

  const availableSizes = product.allSizes && product.allSizes.length > 0 ? product.allSizes : product.sizes;

  const actualSelectedSizeInfo = selectedSize && availableSizes
    ? availableSizes.find(s => s.size === selectedSize)
    : selectedSizeInfo;

  const finalPrice = actualSelectedSizeInfo?.price || product.price;
  const hasDiscount = actualSelectedSizeInfo?.originalPrice && actualSelectedSizeInfo.originalPrice > finalPrice;

  const sortedSizes = [...availableSizes].sort((a, b) => {
    const aNum = parseFloat(a.size.replace(/[^\d.]/g, ''));
    const bNum = parseFloat(b.size.replace(/[^\d.]/g, ''));
    return aNum - bNum;
  });

  const getButtonText = () => {
    if (isAddingToCart) return 'ДОБАВЛЯЕМ...';
    if (!selectedSize) return 'НЕ ВЫБРАНО';
    return 'ДОБАВИТЬ В КОРЗИНУ';
  };

  return (
    <div className="space-y-4 w-full max-w-sm">
      {/* Название товара */}
      <h1 className="product-name--small text-black">
        {product.name}
      </h1>

      {/* Цена */}
      <div className="flex items-center gap-3">
        <span className="product-price--medium text-brand-light-beige">
          {formatPrice(finalPrice)}
        </span>
        
        {hasDiscount && actualSelectedSizeInfo?.originalPrice && (
          <span className="text-gray-400 line-through text-lg">
            {formatPrice(actualSelectedSizeInfo.originalPrice)}
          </span>
        )}
      </div>

      {/* Кнопка "Добавить в корзину" с выбранным размером */}
      <div className="relative">
        <button
          onClick={onAddToCart}
          disabled={!selectedSize || isAddingToCart || !product.inStock}
          className={`btn-add-cart btn-add-cart--mobile ${
            !selectedSize || !product.inStock
              ? 'bg-gray-400 cursor-not-allowed' 
              : isAddingToCart
              ? 'bg-gray-600 cursor-wait'
              : ''
          }`}
        >
          {/* Левая часть - "Размер" или конкретный размер */}
          <div className="flex items-center justify-center w-20">
            <span className="text-white text-center text-[14px] leading-[18px]">
              {selectedSize || 'Размер'}
            </span>
          </div>

          {/* Разделитель */}
          <div className="btn-add-cart__divider btn-add-cart__divider--mobile"></div>

          {/* Правая часть - текст кнопки */}
          <div className="flex items-center justify-center flex-1">
            <span className="text-white text-[12px] leading-[16px]">
              {getButtonText()}
            </span>
          </div>
        </button>
      </div>

      {/* Заголовок "ВЫБЕРИТЕ РАЗМЕР" */}
      <div>
        <h3 className="product-name--small text-black mb-2 uppercase">
          ВЫБЕРИТЕ РАЗМЕР
        </h3>

        {/* Выпадающий список размеров */}
        <div className="relative">
          <button
            onClick={() => setIsSizeDropdownOpen(!isSizeDropdownOpen)}
            className="size-dropdown size-dropdown--mobile"
          >
            <span className="text-black text-left text-[15px] leading-[20px]">
              {selectedSize ? 
                `${selectedSize} RU — ${formatPrice(actualSelectedSizeInfo?.price || product.price)}` 
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
            <div className="size-dropdown-list max-h-60">
              {sortedSizes.map((size) => (
                <button
                  key={size.size}
                  onClick={() => {
                    onSizeSelect(size.size);
                    setIsSizeDropdownOpen(false);
                  }}
                  disabled={!size.available}
                  className={`size-dropdown-item size-dropdown-item--mobile ${
                    selectedSize === size.size ? 'selected' : ''
                  }`}
                >
                  <span className="text-left text-[15px] leading-[20px]">
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
            <img src="../icons/delivery.svg" alt="" />
          </div>
        </div>
        
        <div className="flex-1">
          <p className="text-body--tiny text-black">
            {product.deliveryInfo || 'Среднее время стандартной доставки: 15-20 рабочих дней.'}
          </p>
        </div>
      </div>

      {/* Блок качества - мобильная версия */}
      <div className="quality-badge-mobile">
        <span className="text-black text-[11px] leading-[12px]">
          Товар прошел проверку на качество и оригинальность
        </span>
      </div>

      {/* Информация о бренде */}
      <div className="border-t border-b border-brand-light-gray py-2">
        <div className="flex justify-between items-center">
          <span className="text-brand-light-gray text-[10px] leading-[35px]">
            Бренд
          </span>
          <div className="flex justify-between items-center">
            <span className="text-brand-light-gray mr-2 text-[10px] leading-[35px]">
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

export default MobileProductInfo;