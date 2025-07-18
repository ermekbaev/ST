'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../../../contexts/CartContext';

interface BottomNavigationProps {
  onSupportClick?: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ onSupportClick }) => {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { totalItems, toggleCart } = useCart();

  useEffect(() => {
    setMounted(true);
    
    // Проверяем авторизацию при загрузке компонента
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('currentUser');
      setIsAuthenticated(!!savedUser);
    }
  };

  const handleProfileClick = () => {
    console.log('Клик по иконке профиля в мобильной навигации');
    
    // Проверяем авторизацию
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        // Пользователь авторизован - переходим в профиль
        console.log('👤 Пользователь авторизован, переход в профиль');
        window.location.href = '/profile';
      } else {
        // Пользователь не авторизован - показываем сообщение с инструкцией
        alert(
          '🔐 Для доступа к профилю необходимо авторизоваться.\n\n' +
          '👆 Нажмите кнопку "Войти" в верхней части сайта для регистрации или входа.'
        );
      }
    }
  };

  const handleCartClick = () => {
    console.log('Открытие корзины');
    toggleCart();
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
          className="flex items-center justify-center p-4 hover:opacity-70 transition-opacity relative"
        >
          <img src="/icons/profile.svg" alt="Профиль" className="w-8 h-8" />
          {/* Показываем зеленую точку если пользователь авторизован */}
          {mounted && isAuthenticated && (
            <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
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
          <img src="/supportIcons/Support2.svg" alt="Поддержка" className="w-8 h-8" />
        </button>
        
      </div>
    </div>
  );
};

export default BottomNavigation;