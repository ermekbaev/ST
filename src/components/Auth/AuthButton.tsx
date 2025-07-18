
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from './AuthModal';

const AuthButton: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const { user, logout, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
    );
  }

  const handleAuthClick = () => {
    if (isAuthenticated) {
      logout();
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleAuthClick}
        className="flex items-center gap-2 px-4 py-2 text-sm font-product hover:bg-gray-100 rounded transition-colors"
      >
        {isAuthenticated ? (
          <>
            <span>👤</span>
            <span className="hidden sm:inline">{user?.email}</span>
            <span className="text-xs text-gray-500">(Выйти)</span>
          </>
        ) : (
          <>
            <span>🔐</span>
            <span>Войти</span>
          </>
        )}
      </button>

      {showModal && (
        <AuthModal onClose={() => setShowModal(false)} />
      )}
    </>
  );
};

export default AuthButton;