'use client';

import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';

interface CartItemProps {
  item: {
    id?: string;
    article: string;
    brand: string;
    name: string;
    size: string;
    category: string;
    gender: string;
    price: number;
    photo: string;
    quantity: number;
  };
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const [imageError, setImageError] = useState(false);

  const productId = item.id || item.article;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemove = () => {
    removeFromCart(productId);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const showPlaceholder = !item.photo || imageError || item.photo.trim() === '';

  return (
    <div className="flex items-start gap-4 pb-6 border-b border-gray-100 last:border-b-0 last:pb-0">
      {/* Изображение товара */}
      <div className="flex-shrink-0">
        <div 
          className="bg-gray-50 rounded overflow-hidden"
          style={{
            width: '80px',
            height: '80px'
          }}
        >
          {!showPlaceholder ? (
            <img
              src={item.photo}
              alt={item.name}
              className="w-full h-full object-contain"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 text-xs text-center">
                {item.brand}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Информация о товаре */}
      <div className="flex-1 min-w-0">
        {/* Название и размер */}
        <div className="mb-2">
          <h3 
            className="text-black line-clamp-2"
            style={{
              fontFamily: 'Random Grotesque, Arial, sans-serif',
              fontWeight: 400,
              fontSize: '16px',
              lineHeight: '22px'
            }}
          >
            {item.name}
          </h3>
          <p 
            className="text-gray-500 mt-1"
            style={{
              fontFamily: 'Random Grotesque, Arial, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '18px'
            }}
          >
            размер: {item.size}
          </p>
        </div>

        {/* Цена */}
        <div className="mb-3">
          <span 
            className="text-black"
            style={{
              fontFamily: 'Random Grotesque, Arial, sans-serif',
              fontWeight: 400,
              fontSize: '20px',
              lineHeight: '27px'
            }}
          >
            {item.price.toLocaleString('ru-RU')} ₽
          </span>
        </div>

        {/* Контролы количества */}
        <div className="flex items-center justify-between">
          {/* Счетчик количества */}
          <div className="flex items-center">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:bg-gray-50 transition-colors"
              style={{
                backgroundColor: '#BFB3A3'
              }}
            >
              <span 
                className="text-black"
                style={{
                  fontSize: '18px',
                  lineHeight: '1'
                }}
              >
                −
              </span>
            </button>

            <span 
              className="w-12 text-center text-black"
              style={{
                fontFamily: 'Random Grotesque, Arial, sans-serif',
                fontWeight: 400,
                fontSize: '16px',
                lineHeight: '22px'
              }}
            >
              {item.quantity}
            </span>

            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:bg-gray-50 transition-colors"
              style={{
                backgroundColor: '#BFB3A3'
              }}
            >
              <span 
                className="text-black"
                style={{
                  fontSize: '18px',
                  lineHeight: '1'
                }}
              >
                +
              </span>
            </button>
          </div>

          {/* Кнопка удаления */}
          <button
            onClick={handleRemove}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Удалить товар"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M2.5 5h15M8.333 9.167v5M11.667 9.167v5M3.333 5l.834 10a1.667 1.667 0 001.666 1.667h6.334a1.667 1.667 0 001.666-1.667L14.667 5M7.5 5V3.333a1.667 1.667 0 011.667-1.666h1.666A1.667 1.667 0 0112.5 3.333V5" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;