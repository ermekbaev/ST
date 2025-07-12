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
    <div className={`${isMobile ? 'flex gap-2 items-start py-2' : 'checkout-order-item'}`}>
      {/* Изображение товара */}
      <div className={`${isMobile ? 'w-20 h-19 bg-[#e5ddd4] flex-shrink-0 overflow-hidden' : 'checkout-order-item-image'} relative overflow-hidden`}>
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

      {/* Информация о товаре и цена */}
      {isMobile ? (
        <div className="flex-1 flex flex-col gap-1">
          {/* Название и цена в одной строке с минимальным отступом */}
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="text-[7px] leading-[9px] font-normal text-black overflow-hidden text-ellipsis">
                {item.name}
              </h3>
            </div>
            <div className="flex-shrink-0">
              <p className="text-[14px] leading-[19px] font-normal text-black">
                {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
              </p>
            </div>
          </div>
          
          {/* Размер */}
          <p className="text-[15px] leading-[20px] font-normal text-[#8C8072]">
            Размер: {item.size}
          </p>
          
          {/* Контролы количества */}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-2 bg-[#e5ddd4] px-2 py-1 rounded-sm">
              <button
                type="button"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                className="text-[12px] text-[#8c8072] w-3 h-3 flex items-center justify-center"
                disabled={item.quantity <= 1}
              >
                −
              </button>
              <span className="text-[12px] text-black min-w-[12px] text-center">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                className="text-[12px] text-[#8c8072] w-3 h-3 flex items-center justify-center"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="text-[12px] text-[#8c8072] ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Десктопная версия */}
          <div className="checkout-order-item-info">
            <h3 className="checkout-order-item-name">
              {item.name}
            </h3>
            <p className="checkout-order-item-size">
              Размер: {item.size}
            </p>
            <div className="checkout-order-item-controls">
              <div className="checkout-quantity-controls">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  className="checkout-quantity-btn"
                  disabled={item.quantity <= 1}
                >
                  −
                </button>
                <span className="checkout-quantity-number">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  className="checkout-quantity-btn"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="text-red-500 hover:text-red-700 text-sm ml-4 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="flex flex-col items-end justify-between">
            <p className="checkout-order-item-price">
              {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {item.price.toLocaleString('ru-RU')} ₽ за шт.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderItem;