'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthButton from './AuthButton';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-product">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        {fallback || (
          <>
            <h2 className="text-2xl font-product mb-4">Требуется авторизация</h2>
            <p className="text-gray-600 mb-6">
              Для доступа к этой странице необходимо войти в систему
            </p>
            <AuthButton />
          </>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;