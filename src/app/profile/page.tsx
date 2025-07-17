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
  
  // Определение размера экрана
  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    // Симуляция загрузки данных пользователя
    const timer = setTimeout(() => {
      setUser({
        name: 'Иван Иванов',
        phone: '+7 (895) 457-71-21',
        email: 'ivaniv@mail.com'
      });
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleEditField = (field: string) => {
    console.log(`Редактировать поле: ${field}`);
    // Здесь будет логика редактирования
  };

  const handleOrderHistory = () => {
    console.log('Переход к истории заказов');
    // Здесь будет переход к истории заказов
    window.location.href = '/orders';
  };

  const handleLogout = () => {
    console.log('Выход из аккаунта');
    // Здесь будет логика выхода
    // Например: очистка токенов, редирект на главную
    window.location.href = '/';
  };

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