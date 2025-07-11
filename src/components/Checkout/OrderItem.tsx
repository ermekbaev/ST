'use client';

import React from 'react';
import Image from 'next/image';
import { CartItem } from '@/types/cart';
import { useCart } from '@/contexts/CartContext';

interface OrderItemProps {
  item: CartItem;
  isMobile?: boolean;
}

const OrderItem: React.FC<OrderItemProps> = ({ item, isMobile = false }) => {
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(item.article);
    } else {
      updateQuantity(item.article, newQuantity);
    }
  };

  return (
    <div className={`checkout-order-item ${isMobile ? 'checkout-order-item--mobile' : ''}`}>
      {/* Изображение товара */}
      <div className={`checkout-order-item-image ${isMobile ? 'checkout-order-item-image--mobile' : ''}`}>
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">Нет фото</span>
          </div>
        )}
      </div>

      {/* Информация о товаре */}
      <div className="checkout-order-item-info">
        {/* Название */}
        <h3 className={`checkout-order-item-name ${isMobile ? 'checkout-order-item-name--mobile' : ''}`}>
          {item.name}
        </h3>

        {/* Размер */}
        <p className={`checkout-order-item-size ${isMobile ? 'checkout-order-item-size--mobile' : ''}`}>
          Размер: {item.size}
        </p>

        {/* Контролы количества */}
        <div className={`checkout-order-item-controls ${isMobile ? 'checkout-order-item-controls--mobile' : ''}`}>
          <div className={`checkout-quantity-controls ${isMobile ? 'checkout-quantity-controls--mobile' : ''}`}>
            <button
              type="button"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className={`checkout-quantity-btn ${isMobile ? 'checkout-quantity-btn--mobile' : ''}`}
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
        </div>
      </div>

      {/* Цена */}
      <div className="flex flex-col items-end justify-between">
        <p className={`checkout-order-item-price ${isMobile ? 'checkout-order-item-price--mobile' : ''}`}>
          {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
        </p>
        
        {/* Кнопка удаления */}
        <button
          type="button"
          onClick={() => removeFromCart(item.article)}
          className="text-red-500 hover:text-red-700 text-sm mt-2"
        >
          Удалить
        </button>
      </div>
    </div>
  );
};

export default OrderItem;