'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isOpen) return;

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [mounted, isOpen, onClose]);

  if (!mounted || !isOpen) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Используем portal для рендера в body
  return createPortal(
    <div 
      className="modal-backdrop"
      onClick={handleBackdropClick}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
      <div className="modal-container">
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="modal-close-button"
          aria-label="Закрыть модальное окно"
        >
          ×
        </button>
        
        {/* Контент модального окна */}
        <div className="modal-content">
          {/* Заголовок */}
          <h2 className="modal-title">
            Как это работает?
          </h2>
          
          {/* Основной текст */}
          <div className="modal-text">
            <p>
              <strong>1.</strong> Для размещения индивидуального заказа на интересующий Вас товар нажмите "Оформить индивидуальный заказ" и перейдите в Telegram.
            </p>
            
            <p>
              <strong>2.</strong> Менеджер свяжется с вами, уточнит детали заказа, подберет модель или размер, уточнит цену и сроки доставки.
            </p>
            
            <p>
              <strong>3.</strong> Все индивидуальные заказы оформляются по предоплате. Менеджер предоставит способы оплаты.
            </p>
            
            <p>
              <strong>4.</strong> Товар проходит проверки на оригинальность нашей командой специалистов.
            </p>
            
            <p>
              <strong>5.</strong> Товар упаковывается и подготавливается к отправке. Менеджер уточнит детали доставки и отправит трек-номер.
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default HowItWorksModal;