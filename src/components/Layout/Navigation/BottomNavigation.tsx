'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../../../contexts/CartContext';

interface BottomNavigationProps {
  onSupportClick?: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ onSupportClick }) => {
  const [mounted, setMounted] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleProfileClick = () => {
    console.log('Переход в профиль');
    // Здесь будет логика перехода в профиль
  };

  const handleCartClick = () => {
    console.log('Переход в корзину');
    // Здесь будет логика перехода в корзину
  };

  const handleSupportClick = () => {
    console.log('Активация виджета поддержки');
    if (onSupportClick) {
      onSupportClick();
    }
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200">
      <div className="flex items-center justify-around h-[70px] px-4">
{/* Профиль */}
        <button
          onClick={handleProfileClick}
          className="flex items-center justify-center p-4 hover:opacity-70 transition-opacity"
        >
          <img src="/icons/profile.svg" alt="Профиль" className="w-8 h-8" />
        </button>

                {/* Корзина */}
        <button
          onClick={handleCartClick}
          className="flex items-center justify-center p-4 hover:opacity-70 transition-opacity relative"
        >
          <div className="relative">
            <img src="/icons/cart.svg" alt="Корзина" className="w-8 h-8" />
            {/* Счетчик товаров */}
            {mounted && totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px]">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </div>
        </button>

        {/* Поддержка */}
        <button
          onClick={handleSupportClick}
          className="flex items-center justify-center p-4 hover:opacity-70 transition-opacity"
        >
          {/* Используем ту же иконку что и в SupportWidget, но меньшего размера */}
          <img src="/supportIcons/Support2.svg" alt="Профиль" className="w-8 h-8" />

        </button>


      </div>
    </div>
  );
};

export default BottomNavigation;