'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../../../contexts/CartContext';
import AuthModal from '../../Auth/AuthModal'; 

interface BottomNavigationProps {
  onSupportClick?: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ onSupportClick }) => {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false); 
  const { totalItems, toggleCart } = useCart();

  useEffect(() => {
    setMounted(true);
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('currentUser');
      setIsAuthenticated(!!savedUser);
    }
  };

  const handleProfileClick = () => {
    
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        window.location.href = '/profile';
      } else {
        setShowAuthModal(true);
      }
    }
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
    checkAuthStatus();
  };

  const handleSupportClick = () => {
    if (onSupportClick) {
      onSupportClick();
    }
  };

  const handleCartClick = () => {
    toggleCart();
  };

  const handleHomeClick = () => {
    window.location.href = '/';
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 lg:hidden">
        <div className="flex items-center justify-around h-[70px] px-4">

          <button
            onClick={handleProfileClick}
            className="flex flex-col items-center justify-center p-2 hover:opacity-70 transition-opacity"
          >
            <img src="/icons/profile.svg" alt="Профиль" className="w-6 h-6 mb-1" />
            <span className="text-xs text-gray-600 font-product">
              {isAuthenticated ? 'Профиль' : 'Войти'}
            </span>
          </button>

          
          {/* Кнопка корзины */}
          <button
            onClick={handleCartClick}
            className="flex flex-col items-center justify-center p-2 hover:opacity-70 transition-opacity relative"
          >
            <div className="relative">
              <img src="/icons/cart.svg" alt="Корзина" className="w-6 h-6 mb-1" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-600 font-product">Корзина</span>
          </button>

          {/* Кнопка поддержки */}
          <button
            onClick={handleSupportClick}
            className="flex flex-col items-center justify-center p-2 hover:opacity-70 transition-opacity"
          >
            <img src="/supportIcons/Support2.svg" alt="Поддержка" className="w-6 h-6 mb-1" />
            <span className="text-xs text-gray-600 font-product">Поддержка</span>
          </button>
          
        </div>
      </div>

      {/* ДОБАВИЛИ: Модальное окно авторизации */}
      {showAuthModal && (
        <AuthModal onClose={handleCloseAuthModal} />
      )}

      {/* Отступ для контента, чтобы он не перекрывался нижней навигацией */}
      <div className="h-[70px] lg:hidden" />
    </>
  );
};

export default BottomNavigation;