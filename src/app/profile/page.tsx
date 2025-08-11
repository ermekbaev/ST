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
  agreeToMarketing?: boolean;
}

const UserProfilePage: NextPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [agreeToMarketing, setAgreeToMarketing] = useState(false);
  
  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('currentUser');
      
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          console.log('👤 Данные из localStorage:', userData);
          
          // Устанавливаем данные пользователя
          const userInfo = {
            name: userData.name || userData.email?.split('@')[0] || 'Пользователь',
            phone: userData.phone || 'Не указан',
            email: userData.email || 'Не указан',
            agreeToMarketing: userData.agreeToMarketing || false
          };
          
          console.log('👤 Обработанные данные пользователя:', userInfo);
          
          setUser(userInfo);
          setAgreeToMarketing(userData.agreeToMarketing || false);
          
        } catch (error) {
          console.error('Ошибка парсинга пользователя:', error);
          localStorage.removeItem('currentUser');
          localStorage.removeItem('authToken');
          window.location.href = '/';
        }
      } else {
        console.log('❌ Пользователь не найден в localStorage');
        window.location.href = '/';
      }
      setIsLoading(false);
    }
  };

  const handleEditField = (field: string) => {
    console.log(`Редактировать поле: ${field}`);
    alert(`Редактирование поля "${field}" будет добавлено в следующих обновлениях`);
  };

  const handleOrderHistory = () => {
    window.location.href = '/order-history';
  };

  const handleLogout = () => {
    console.log('Выход из аккаунта');
    
    // Сразу выходим без подтверждения
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
    }
    window.location.href = '/';
  };

// Полная версия handleMarketingChange с сохранением в Strapi
const handleMarketingChange = async (newValue: boolean) => {
  console.log('🔄 Обновляем согласие на маркетинг:', newValue);
  
  // Сначала обновляем локальное состояние (мгновенно)
  setAgreeToMarketing(newValue);
  
  // Обновляем localStorage (мгновенно)
  if (user) {
    const updatedUser = { ...user, agreeToMarketing: newValue };
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    console.log('✅ Согласие обновлено в localStorage');
  }
  
  // Обновляем в Strapi (в фоне)
  const authToken = localStorage.getItem('authToken');
  if (authToken) {
    try {
      console.log('📤 Отправляем обновление в Strapi...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          agreeToMarketing: newValue
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Согласие успешно обновлено в Strapi:', result);
      } else {
        const error = await response.json();
        console.error('❌ Ошибка обновления в Strapi:', error);
        // НО НЕ откатываем изменение - localStorage уже обновлен
      }
    } catch (error) {
      console.error('❌ Ошибка сети при обновлении согласия:', error);
      // Оставляем изменение в localStorage даже при ошибке сети
    }
  } else {
    console.log('⚠️ Нет JWT токена для обновления в Strapi');
    // Но localStorage все равно обновлен
  }
};

  if (isMobile) {
    return (
      <MobileProfileView 
        user={user}
        isLoading={isLoading}
        agreeToMarketing={agreeToMarketing}
        setAgreeToMarketing={handleMarketingChange}
        handleEditField={handleEditField}
        handleOrderHistory={handleOrderHistory}
        handleLogout={handleLogout}
      />
    );
  }

  return (
    <DesktopProfileView 
      user={user}
      isLoading={isLoading}
      agreeToMarketing={agreeToMarketing}
      setAgreeToMarketing={handleMarketingChange}
      handleEditField={handleEditField}
      handleOrderHistory={handleOrderHistory}
      handleLogout={handleLogout}
    />
  );
};

export default UserProfilePage;