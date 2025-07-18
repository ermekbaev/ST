'use client';

import { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import type { NextPage } from 'next';
import { MobileProfileView } from '@/components/Profile/MobileProfileView';
import { DesktopProfileView } from '@/components/Profile/DesktopProfileView';

interface User {
  name: string;
  phone: string;
  email: string;
}

const UserProfilePage: NextPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [agreeToMarketing, setAgreeToMarketing] = useState(false);
  
  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    // ОБНОВЛЕННАЯ ЛОГИКА: Читаем пользователя из localStorage
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          console.log('👤 Загружен пользователь из localStorage:', userData);
          setUser({
            name: userData.name || userData.email?.split('@')[0] || 'Пользователь',
            phone: userData.phone || 'Не указан',
            email: userData.email || 'Не указан'
          });
        } catch (error) {
          console.error('Ошибка парсинга пользователя:', error);
          localStorage.removeItem('currentUser');
          // Перенаправляем на главную если нет валидных данных
          window.location.href = '/';
        }
      } else {
        console.log('❌ Пользователь не найден в localStorage');
        // Перенаправляем на главную если не авторизован
        window.location.href = '/';
      }
      setIsLoading(false);
    }
  }, []);

  const handleEditField = (field: string) => {
    console.log(`Редактировать поле: ${field}`);
    alert(`Редактирование поля "${field}" будет добавлено в следующих обновлениях`);
  };

  const handleOrderHistory = () => {
    console.log('Переход к истории заказов');
    alert('История заказов будет добавлена в следующих обновлениях');
  };

  const handleLogout = () => {
    console.log('Выход из аккаунта');
    const confirmLogout = confirm('Вы уверены, что хотите выйти из аккаунта?');
    if (confirmLogout) {
      // Очищаем localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('currentUser');
      }
      // Перенаправляем на главную
      window.location.href = '/';
    }
  };

  // Показываем загрузку
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-product text-gray-600">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  // Проверяем авторизацию
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-product text-2xl text-black mb-4">Доступ ограничен</h1>
          <p className="font-product text-gray-600 mb-6">
            Для доступа к личному кабинету необходимо авторизоваться
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-black text-white px-6 py-3 rounded-sm font-product text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors"
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  // Общие пропсы для обеих версий
  const commonProps = {
    user,
    isLoading,
    agreeToMarketing,
    setAgreeToMarketing,
    handleEditField,
    handleOrderHistory,
    handleLogout
  };

  // Условный рендеринг в зависимости от размера экрана
  return isMobile ? (
    <MobileProfileView {...commonProps} />
  ) : (
    <DesktopProfileView {...commonProps} />
  );
};

export default UserProfilePage;