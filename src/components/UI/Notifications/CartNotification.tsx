'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface CartNotificationProps {
  isVisible: boolean;
  productName: string;
  onHide: () => void;
}

const CartNotification: React.FC<CartNotificationProps> = ({ 
  isVisible, 
  productName, 
  onHide 
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onHide();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onHide]);

  if (!mounted || !isVisible) {
    return null;
  }

  return createPortal(
    <div 
      className="fixed top-4 right-4 z-50 animate-slide-in-right"
      style={{
        maxWidth: '350px'
      }}
    >
      <div 
        className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3"
        style={{
          fontFamily: 'Random Grotesque, Arial, sans-serif'
        }}
      >
        {/* Иконка галочки */}
        <div className="flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        {/* Текст */}
        <div className="flex-1 min-w-0">
          <p 
            className="text-sm font-medium leading-tight"
            style={{
              fontWeight: 500
            }}
          >
            Товар добавлен в корзину
          </p>
          <p 
            className="text-xs opacity-90 mt-1 truncate"
            style={{
              fontWeight: 400
            }}
          >
            {productName}
          </p>
        </div>

        {/* Кнопка закрытия */}
        <button
          onClick={onHide}
          className="flex-shrink-0 text-white hover:text-green-100 transition-colors ml-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>,
    document.body
  );
};

export default CartNotification;