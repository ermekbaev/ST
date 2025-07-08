// src/components/Sections/ProductActions.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface ProductActionsProps {
  onContinueShopping?: () => void;
  onBackToStore?: () => void;
  className?: string;
}

const ProductActions: React.FC<ProductActionsProps> = ({ 
  onContinueShopping,
  onBackToStore,
  className = '' 
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleContinueShopping = () => {
    if (onContinueShopping) {
      onContinueShopping();
    } else {
      // Заглушка - переход в каталог
      console.log('Переход в каталог');
      // window.location.href = '/catalog';
    }
  };

  const handleBackToStore = () => {
    if (onBackToStore) {
      onBackToStore();
    } else {
      // Заглушка - переход на главную
      console.log('Переход на главную');
      // window.location.href = '/';
    }
  };

  if (!mounted) {
    return (
      <div className={`w-full ${className}`}>
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="hidden lg:block space-y-4">
            <div className="w-96 h-20 bg-gray-200 rounded"></div>
            <div className="w-96 h-6 bg-gray-200 rounded"></div>
            <div className="w-96 h-20 bg-gray-200 rounded"></div>
          </div>
          <div className="block lg:hidden space-y-3">
            <div className="w-80 h-9 bg-gray-200 rounded"></div>
            <div className="w-80 h-6 bg-gray-200 rounded"></div>
            <div className="w-80 h-9 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Desktop версия */}
      <div className="hidden lg:block">
        <div className="flex flex-col items-center gap-6 py-12">
          {/* Кнопка "Продолжить покупки" */}
          <button
            onClick={handleContinueShopping}
            className="bg-[#0B0B0D] hover:bg-gray-800 text-white transition-colors flex items-center justify-center"
            style={{
              width: '692px',
              height: '80px',
              maxWidth: '90vw'
            }}
          >
            <span 
              style={{
                fontFamily: 'Random Grotesque, Arial, sans-serif',
                fontWeight: 400,
                fontSize: '30px',
                lineHeight: '41px'
              }}
            >
              ПРОДОЛЖИТЬ ПОКУПКИ
            </span>
          </button>

          {/* Описательный текст */}
          <p 
            className="text-black text-center max-w-2xl"
            style={{
              fontFamily: 'Random Grotesque, Arial, sans-serif',
              fontWeight: 400,
              fontSize: '20px',
              lineHeight: '27px'
            }}
          >
            Найдите то, что вы хотите, в один клик. Всего один клик, не стесняйтесь продолжить
          </p>

          {/* Кнопка "Вернуться в магазин" */}
          <button
            onClick={handleBackToStore}
            className="bg-[#D9CDBF] hover:bg-[#BFB3A3] text-[#0B0B0D] transition-colors flex items-center justify-center"
            style={{
              width: '692px',
              height: '80px',
              maxWidth: '90vw'
            }}
          >
            <span 
              style={{
                fontFamily: 'Random Grotesque, Arial, sans-serif',
                fontWeight: 400,
                fontSize: '30px',
                lineHeight: '41px'
              }}
            >
              ВЕРНУТЬСЯ В МАГАЗИН
            </span>
          </button>
        </div>
      </div>

      {/* Mobile версия */}
      <div className="block lg:hidden">
        <div className="flex flex-col items-center gap-4 py-8 px-5">
          {/* Кнопка "Продолжить покупки" */}
          <button
            onClick={handleContinueShopping}
            className="w-full max-w-sm bg-[#0B0B0D] hover:bg-gray-800 text-white transition-colors flex items-center justify-center"
            style={{
              height: '35px'
            }}
          >
            <span 
              style={{
                fontFamily: 'Random Grotesque, Arial, sans-serif',
                fontWeight: 400,
                fontSize: '15px',
                lineHeight: '20px'
              }}
            >
              ПРОДОЛЖИТЬ ПОКУПКИ
            </span>
          </button>

          {/* Описательный текст */}
          <p 
            className="text-black text-center max-w-sm"
            style={{
              fontFamily: 'Random Grotesque, Arial, sans-serif',
              fontWeight: 400,
              fontSize: '10px',
              lineHeight: '14px'
            }}
          >
            Найдите то, что вы хотите, в один клик. Всего один клик, не стесняйтесь продолжить
          </p>

          {/* Кнопка "Вернуться в магазин" */}
          <button
            onClick={handleBackToStore}
            className="w-full max-w-sm bg-[#D9CDBF] hover:bg-[#BFB3A3] text-[#0B0B0D] transition-colors flex items-center justify-center"
            style={{
              height: '35px'
            }}
          >
            <span 
              style={{
                fontFamily: 'Random Grotesque, Arial, sans-serif',
                fontWeight: 400,
                fontSize: '15px',
                lineHeight: '20px'
              }}
            >
              ВЕРНУТЬСЯ В МАГАЗИН
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductActions;