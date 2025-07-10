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
      className="cart-backdrop"
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
          className="cart-sidebar cart-sidebar--desktop"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Заголовок корзины */}
          <div className="cart-header cart-header--desktop">
            <h2 className="cart-title cart-title--desktop">
              КОРЗИНА
            </h2>
            
            {/* Кнопка закрытия */}
            <button
              onClick={closeCart}
              className="cart-close-btn"
              aria-label="Закрыть корзину"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Контент корзины */}
          <div className="cart-content cart-content--desktop">
            {items.length === 0 ? (
              // Пустая корзина
              <div className="cart-empty">
                <div className="cart-empty__icon">
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 20L60 60M20 60L60 20" stroke="#BFB3A3" strokeWidth="3" strokeLinecap="round"/>
                    <circle cx="40" cy="40" r="35" stroke="#BFB3A3" strokeWidth="3"/>
                  </svg>
                </div>
                <h3 className="cart-empty__title">
                  Корзина пуста
                </h3>
                <p className="cart-empty__text">
                  Добавьте товары в корзину, чтобы оформить заказ
                </p>
                <button
                  onClick={closeCart}
                  className="cart-empty__btn"
                >
                  Продолжить покупки
                </button>
              </div>
            ) : (
              // Список товаров
              <div className="cart-items-list">
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
            <div className="cart-footer cart-footer--desktop">
              {/* Итоговая сумма */}
              <div className="cart-total cart-total--desktop">
                <span className="cart-total-label cart-total-label--desktop">
                  ИТОГ:
                </span>
                <span className="cart-total-price cart-total-price--desktop">
                  {totalPrice.toLocaleString('ru-RU')} ₽
                </span>
              </div>

              {/* Кнопка оформления заказа */}
              <button
                onClick={handleOrderClick}
                className="cart-checkout-btn cart-checkout-btn--desktop"
              >
                ОФОРМИТЬ ЗАКАЗ
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile версия корзины - справа, но на всю ширину экрана */}
      <div className="block lg:hidden ml-auto w-full">
        <div 
          className="cart-sidebar cart-sidebar--mobile"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Заголовок корзины - мобильная версия */}
          <div className="cart-header cart-header--mobile">
            <h2 className="cart-title cart-title--mobile">
              КОРЗИНА
            </h2>
            
            {/* Кнопка закрытия */}
            <button
              onClick={closeCart}
              className="cart-close-btn--mobile"
              aria-label="Закрыть корзину"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Контент корзины - мобильная версия */}
          <div className="cart-content cart-content--mobile">
            {items.length === 0 ? (
              // Пустая корзина - мобильная версия
              <div className="cart-empty cart-empty--mobile">
                <div className="cart-empty__icon--mobile">
                  <svg width="60" height="60" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 20L60 60M20 60L60 20" stroke="#BFB3A3" strokeWidth="3" strokeLinecap="round"/>
                    <circle cx="40" cy="40" r="35" stroke="#BFB3A3" strokeWidth="3"/>
                  </svg>
                </div>
                <h3 className="cart-empty__title--mobile">
                  Корзина пуста
                </h3>
                <p className="cart-empty__text--mobile">
                  Добавьте товары в корзину, чтобы оформить заказ
                </p>
                <button
                  onClick={closeCart}
                  className="cart-empty__btn--mobile"
                >
                  Продолжить покупки
                </button>
              </div>
            ) : (
              // Список товаров - мобильная версия
              <div className="cart-items-list--mobile">
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
            <div className="cart-footer cart-footer--mobile">
              {/* Итоговая сумма */}
              <div className="cart-total cart-total--mobile">
                <span className="cart-total-label cart-total-label--mobile">
                  ИТОГ:
                </span>
                <span className="cart-total-price cart-total-price--mobile">
                  {totalPrice.toLocaleString('ru-RU')} ₽
                </span>
              </div>

              {/* Кнопка оформления заказа */}
              <button
                onClick={handleOrderClick}
                className="cart-checkout-btn cart-checkout-btn--mobile"
              >
                ОФОРМИТЬ ЗАКАЗ
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