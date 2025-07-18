'use client';

import { useState, useEffect } from 'react';

interface SmartProfileIconProps {
  onAuthClick: () => void; // Функция для показа модального окна авторизации
  className?: string;
}

const SmartProfileIcon: React.FC<SmartProfileIconProps> = ({ 
  onAuthClick, 
  className = "w-6 h-8" 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuthStatus();
    
    // Проверяем статус авторизации периодически (например, если пользователь авторизовался в другой вкладке)
    const interval = setInterval(checkAuthStatus, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const checkAuthStatus = () => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setIsAuthenticated(true);
          setUserName(userData.name || userData.email?.split('@')[0] || 'Пользователь');
        } catch (error) {
          console.error('Ошибка парсинга пользователя:', error);
          localStorage.removeItem('currentUser');
          setIsAuthenticated(false);
          setUserName('');
        }
      } else {
        setIsAuthenticated(false);
        setUserName('');
      }
    }
  };

  const handleClick = () => {
    if (isAuthenticated) {
      // Переходим в личный кабинет
      window.location.href = '/profile';
    } else {
      // Показываем модальное окно авторизации
      onAuthClick();
    }
  };

  if (!mounted) {
    return <img src="/icons/profile.svg" alt="Профиль" className={className} />;
  }

  return (
    <div className="relative group">
      {/* Иконка профиля */}
      <div 
        className="cursor-pointer hover:opacity-70 transition-opacity duration-200 hover-lift relative"
        onClick={handleClick}
      >
        <img src="/icons/profile.svg" alt="Профиль" className={className} />
        
        {/* Зеленая точка если авторизован */}
        {isAuthenticated && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>

      {/* Всплывающая подсказка */}
      {isAuthenticated ? (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-black text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          👤 {userName}
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
        </div>
      ) : (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-black text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          🔐 Войти в аккаунт
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
        </div>
      )}
    </div>
  );
};

export default SmartProfileIcon;