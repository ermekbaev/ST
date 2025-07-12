'use client';

import React from 'react';
import { useCart } from '@/contexts/CartContext';

interface OrderItemProps {
  item: any;
  isMobile?: boolean;
}

const OrderItem: React.FC<OrderItemProps> = ({ item, isMobile = false }) => {
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    const itemKey = item.id || item.article;
     
    if (newQuantity <= 0) {
      removeFromCart(itemKey);
    } else {
      updateQuantity(itemKey, newQuantity);
    }
  };

  const handleRemove = () => {
    const itemKey = item.id || item.article;
    removeFromCart(itemKey);
  };

  return (
    <div className={`checkout-order-item ${isMobile ? 'checkout-order-item--mobile py-2' : ''}`}>
      {/* Изображение товара */}
      <div className={`checkout-order-item-image ${isMobile ? 'checkout-order-item-image--mobile' : ''} relative overflow-hidden`}>
        {item.image || item.photo ? (
          <img
            src={item.image || item.photo}
            alt={item.name}
            className="w-full h-full object-contain bg-white"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-xs">Нет фото</span>
          </div>
        )}
      </div>

      {/* Информация о товаре */}
      <div className={`checkout-order-item-info ${isMobile ? 'checkout-order-item-info--mobile' : ''}`}>
        {/* Название */}
        <h3 className={`checkout-order-item-name ${isMobile ? 'checkout-order-item-name--mobile' : ''}`}>
          {item.name}
        </h3>

        {/* Размер */}
        <p className={`checkout-order-item-size ${isMobile ? 'checkout-order-item-size--mobile' : ''}`}>
          Размер: {item.size}
        </p>

        {/* Контролы количества и удаления - только для мобильной версии */}
        {isMobile && (
          <div className={`checkout-order-item-controls ${isMobile ? 'checkout-order-item-controls--mobile' : ''}`}>
            <div className={`checkout-quantity-controls ${isMobile ? 'checkout-quantity-controls--mobile' : ''}`}>
              <button
                type="button"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                className={`checkout-quantity-btn ${isMobile ? 'checkout-quantity-btn--mobile' : ''}`}
                disabled={item.quantity <= 1}
              >
                −
              </button>
              
              <span className={`checkout-quantity-number ${isMobile ? 'checkout-quantity-number--mobile' : ''}`}>
                {item.quantity}
              </span>
              
              <button
                type="button"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                className={`checkout-quantity-btn ${isMobile ? 'checkout-quantity-btn--mobile' : ''}`}
              >
                +
              </button>
            </div>

            {/* Кнопка удаления */}
            <button
              type="button"
              onClick={handleRemove}
              className={`checkout-remove-btn ${isMobile ? 'checkout-remove-btn--mobile' : ''}`}
            >
              ✕
            </button>
          </div>
        )}

        {/* Контролы для десктопной версии */}
        {!isMobile && (
          <div className={`checkout-order-item-controls`}>
            <div className={`checkout-quantity-controls`}>
              <button
                type="button"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                className={`checkout-quantity-btn`}
                disabled={item.quantity <= 1}
              >
                −
              </button>
              
              <span className={`checkout-quantity-number`}>
                {item.quantity}
              </span>
              
              <button
                type="button"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                className={`checkout-quantity-btn`}
              >
                +
              </button>
            </div>

            {/* Кнопка удаления */}
            <button
              type="button"
              onClick={handleRemove}
              className="text-red-500 hover:text-red-700 text-sm ml-4 transition-colors"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Цена - всегда отображается */}
      <div className="flex flex-col items-end justify-between">
        <p className={`checkout-order-item-price ${isMobile ? 'checkout-order-item-price--mobile' : ''}`}>
          {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
        </p>
        
        {/* Цена за единицу - только на десктопе */}
        {!isMobile && (
          <p className="text-sm text-gray-500 mt-1">
            {item.price.toLocaleString('ru-RU')} ₽ за шт.
          </p>
        )}
      </div>
    </div>
  );
};

export default OrderItem;