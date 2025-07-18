import { useState, useEffect } from 'react';

interface AuthUser {
  id: string;
  email: string;
  phone: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем сохраненного пользователя при загрузке
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Ошибка парсинга пользователя:', error);
          localStorage.removeItem('currentUser');
        }
      }
    }
    setLoading(false);
  }, []);

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
    }
  };

  const login = (userData: AuthUser) => {
    setUser(userData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(userData));
    }
  };

  return {
    user,
    loading,
    logout,
    login,
    isAuthenticated: !!user
  };
};