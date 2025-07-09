'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '../../contexts/CartContext';
import CartItem from './CartItem';
import MobileCartItem from './MobileCartItem';

const CartSidebar: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const { 
    items, 
    isCartOpen, 
    closeCart, 
    totalPrice, 
    totalItems 
  } = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Блокировка скролла при открытой корзине
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  // Обработка клавиши Escape
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };

    if (isCartOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isCartOpen, closeCart]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeCart();
    }
  };

  const handleOrderClick = () => {
    console.log('Оформление заказа');
    // Здесь будет логика перехода к оформлению заказа
    closeCart();
  };

  if (!mounted || !isCartOpen) {
    return null;
  }

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
      onClick={handleBackdropClick}
    >
      {/* Desktop версия корзины */}
      <div className="hidden lg:block ml-auto">
        <div 
          className="bg-white h-full flex flex-col animate-slide-in-right"
          style={{
            width: '600px',
            maxWidth: '90vw'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Заголовок корзины */}
          <div 
            className="flex items-center justify-between p-6 border-b border-gray-200"
            style={{
              height: '80px'
            }}
          >
            <h2 
              className="text-black"
              style={{
                fontFamily: 'Druk Wide Cyr, sans-serif',
                fontWeight: 700,
                fontSize: '32px',
                lineHeight: '1',
                textTransform: 'uppercase'
              }}
            >
              КОРЗИНА
            </h2>
            
            {/* Кнопка закрытия */}
            <button
              onClick={closeCart}
              className="w-8 h-8 flex items-center justify-center text-black hover:text-gray-600 transition-colors"
              aria-label="Закрыть корзину"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Контент корзины */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              // Пустая корзина
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="mb-6">
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 20L60 60M20 60L60 20" stroke="#BFB3A3" strokeWidth="3" strokeLinecap="round"/>
                    <circle cx="40" cy="40" r="35" stroke="#BFB3A3" strokeWidth="3"/>
                  </svg>
                </div>
                <h3 
                  className="text-black mb-4"
                  style={{
                    fontFamily: 'Random Grotesque, Arial, sans-serif',
                    fontWeight: 400,
                    fontSize: '24px',
                    lineHeight: '32px'
                  }}
                >
                  Корзина пуста
                </h3>
                <p 
                  className="text-gray-500 mb-8"
                  style={{
                    fontFamily: 'Random Grotesque, Arial, sans-serif',
                    fontWeight: 400,
                    fontSize: '16px',
                    lineHeight: '22px'
                  }}
                >
                  Добавьте товары в корзину, чтобы оформить заказ
                </p>
                <button
                  onClick={closeCart}
                  className="bg-[#0B0B0D] text-white px-8 py-3 hover:bg-gray-800 transition-colors"
                  style={{
                    fontFamily: 'Random Grotesque, Arial, sans-serif',
                    fontWeight: 400,
                    fontSize: '16px'
                  }}
                >
                  Продолжить покупки
                </button>
              </div>
            ) : (
              // Список товаров
              <div className="p-6 space-y-6">
                {items.map((item) => (
                  <CartItem 
                    key={item.id || item.article} 
                    item={item} 
                  />
                ))}
              </div>
            )}
          </div>

          {/* Итог и кнопка оформления заказа */}
          {items.length > 0 && (
            <div 
              className="border-t border-gray-200 p-6 bg-white"
              style={{
                minHeight: '140px'
              }}
            >
              {/* Итоговая сумма */}
              <div className="flex items-center justify-between mb-6">
                <span 
                  className="text-black"
                  style={{
                    fontFamily: 'Random Grotesque, Arial, sans-serif',
                    fontWeight: 400,
                    fontSize: '24px',
                    lineHeight: '32px'
                  }}
                >
                  ИТОГ:
                </span>
                <span 
                  className="text-black"
                  style={{
                    fontFamily: 'Random Grotesque, Arial, sans-serif',
                    fontWeight: 400,
                    fontSize: '32px',
                    lineHeight: '43px'
                  }}
                >
                  {totalPrice.toLocaleString('ru-RU')} ₽
                </span>
              </div>

              {/* Кнопка оформления заказа */}
              <button
                onClick={handleOrderClick}
                className="w-full bg-[#0B0B0D] text-white py-4 hover:bg-gray-800 transition-colors flex items-center justify-center"
                style={{
                  height: '60px'
                }}
              >
                <span 
                  style={{
                    fontFamily: 'Random Grotesque, Arial, sans-serif',
                    fontWeight: 400,
                    fontSize: '20px',
                    lineHeight: '27px',
                    textTransform: 'uppercase'
                  }}
                >
                  ОФОРМИТЬ ЗАКАЗ
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile версия корзины - справа, но на всю ширину экрана */}
      <div className="block lg:hidden ml-auto w-full">
        <div 
          className="bg-white h-full flex flex-col animate-slide-in-right"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Заголовок корзины - мобильная версия */}
          <div 
            className="flex items-center justify-between px-5 py-4 border-b border-gray-200"
            style={{
              height: '70px'
            }}
          >
            <h2 
              className="text-black"
              style={{
                fontFamily: 'Druk Wide Cyr, sans-serif',
                fontWeight: 700,
                fontSize: '26px',
                lineHeight: '1',
                textTransform: 'uppercase'
              }}
            >
              КОРЗИНА
            </h2>
            
            {/* Кнопка закрытия */}
            <button
              onClick={closeCart}
              className="w-7 h-7 flex items-center justify-center text-black hover:text-gray-600 transition-colors"
              aria-label="Закрыть корзину"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Контент корзины - мобильная версия */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              // Пустая корзина - мобильная версия
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <div className="mb-4">
                  <svg width="60" height="60" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 20L60 60M20 60L60 20" stroke="#BFB3A3" strokeWidth="3" strokeLinecap="round"/>
                    <circle cx="40" cy="40" r="35" stroke="#BFB3A3" strokeWidth="3"/>
                  </svg>
                </div>
                <h3 
                  className="text-black mb-3"
                  style={{
                    fontFamily: 'Random Grotesque, Arial, sans-serif',
                    fontWeight: 400,
                    fontSize: '20px',
                    lineHeight: '24px'
                  }}
                >
                  Корзина пуста
                </h3>
                <p 
                  className="text-gray-500 mb-6"
                  style={{
                    fontFamily: 'Random Grotesque, Arial, sans-serif',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '18px'
                  }}
                >
                  Добавьте товары в корзину, чтобы оформить заказ
                </p>
                <button
                  onClick={closeCart}
                  className="bg-[#0B0B0D] text-white px-6 py-3 hover:bg-gray-800 transition-colors"
                  style={{
                    fontFamily: 'Random Grotesque, Arial, sans-serif',
                    fontWeight: 400,
                    fontSize: '14px'
                  }}
                >
                  Продолжить покупки
                </button>
              </div>
            ) : (
              // Список товаров - мобильная версия
              <div className="px-5 py-5 space-y-5">
                {items.map((item) => (
                  <MobileCartItem 
                    key={item.id || item.article} 
                    item={item} 
                  />
                ))}
              </div>
            )}
          </div>

          {/* Итог и кнопка оформления заказа - мобильная версия */}
          {items.length > 0 && (
            <div 
              className="border-t border-gray-200 px-5 py-5 bg-white"
              style={{
                minHeight: '130px'
              }}
            >
              {/* Итоговая сумма */}
              <div className="flex items-center justify-between mb-5">
                <span 
                  className="text-black"
                  style={{
                    fontFamily: 'Random Grotesque, Arial, sans-serif',
                    fontWeight: 400,
                    fontSize: '22px',
                    lineHeight: '26px'
                  }}
                >
                  ИТОГ:
                </span>
                <span 
                  className="text-black"
                  style={{
                    fontFamily: 'Random Grotesque, Arial, sans-serif',
                    fontWeight: 400,
                    fontSize: '30px',
                    lineHeight: '34px'
                  }}
                >
                  {totalPrice.toLocaleString('ru-RU')} ₽
                </span>
              </div>

              {/* Кнопка оформления заказа */}
              <button
                onClick={handleOrderClick}
                className="w-full bg-[#0B0B0D] text-white py-4 hover:bg-gray-800 transition-colors flex items-center justify-center"
                style={{
                  height: '55px'
                }}
              >
                <span 
                  style={{
                    fontFamily: 'Random Grotesque, Arial, sans-serif',
                    fontWeight: 400,
                    fontSize: '18px',
                    lineHeight: '22px',
                    textTransform: 'uppercase'
                  }}
                >
                  ОФОРМИТЬ ЗАКАЗ
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CartSidebar;