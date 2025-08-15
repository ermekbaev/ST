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
          
          const userInfo = {
            name: userData.name || userData.email?.split('@')[0] || 'Пользователь',
            phone: userData.phone || 'Не указан',
            email: userData.email || 'Не указан',
            agreeToMarketing: userData.agreeToMarketing || false
          };
          
          setUser(userInfo);
          setAgreeToMarketing(userData.agreeToMarketing || false);
          
        } catch (error) {
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
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
    }
    window.location.href = '/';
  };

const handleMarketingChange = async (newValue: boolean) => {
  console.log('🔄 Обновляем согласие на маркетинг:', newValue);
  
  setAgreeToMarketing(newValue);
  
  if (user) {
    const updatedUser = { ...user, agreeToMarketing: newValue };
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    console.log('✅ Согласие обновлено в localStorage');
  }
  
  const authToken = localStorage.getItem('authToken');
  if (authToken) {
    try {
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
      }
    } catch (error) {
      console.error('❌ Ошибка сети при обновлении согласия:', error);
    }
  } else {
    console.log('⚠️ Нет JWT токена для обновления в Strapi');
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