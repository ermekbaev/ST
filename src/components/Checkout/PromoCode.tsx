'use client';

import React, { useState } from 'react';

interface PromoCodeProps {
  onApply: (code: string) => boolean;
  isMobile?: boolean;
}

const PromoCode: React.FC<PromoCodeProps> = ({ onApply, isMobile = false }) => {
  const [code, setCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [message, setMessage] = useState('');

  const handleApply = async () => {
    if (!code.trim()) return;
    
    setIsApplying(true);
    setMessage('');
    
    try {
      const success = onApply(code.trim().toUpperCase());
      
      if (success) {
        setMessage('Промокод применен!');
        setCode('');
      } else {
        setMessage('Неверный промокод');
      }
    } catch (error) {
      setMessage('Ошибка при применении промокода');
    } finally {
      setIsApplying(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  return (
    <div className="space-y-3">
      {/* Заголовок */}
      <div className="text-[17px] leading-[23px] font-normal text-black">
        ПРОМОКОД
      </div>

      {/* Поле ввода и кнопка */}
      <div className={`checkout-promo-container ${isMobile ? 'flex-col' : ''}`}>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Введите промокод"
          className={`checkout-promo-input ${isMobile ? 'checkout-promo-input--mobile' : ''}`}
          disabled={isApplying}
        />
        
        <button
          type="button"
          onClick={handleApply}
          disabled={isApplying || !code.trim()}
          className={`checkout-promo-btn ${isMobile ? 'checkout-promo-btn--mobile' : ''}`}
        >
          {isApplying ? 'ПРИМЕНЯЕМ...' : 'ПРИМЕНИТЬ'}
        </button>
      </div>

      {/* Сообщения */}
      {message && (
        <p className={`text-sm ${message.includes('применен') ? 'text-green-600' : 'text-red-500'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default PromoCode;
