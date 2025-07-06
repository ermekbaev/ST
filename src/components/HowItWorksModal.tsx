'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);

  // Монтируем компонент только на клиенте
  useEffect(() => {
    setMounted(true);
  }, []);

  // Обработка клавиш и блокировка скролла
  useEffect(() => {
    if (!mounted || !isOpen) return;

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Блокируем скролл страницы
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    // Добавляем обработчик клавиш
    document.addEventListener('keydown', handleEscapeKey);

    // Очистка при размонтировании
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [mounted, isOpen, onClose]);

  // Не рендерим до монтирования или если закрыто
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
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white relative"
        style={{
          width: '730px',
          height: '500px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          borderRadius: '8px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center transition-colors z-10"
          aria-label="Закрыть модальное окно"
        >
          ×
        </button>
        
        {/* Контент модального окна */}
        <div className="p-8 pr-12 h-full overflow-y-auto">
          {/* Заголовок */}
          <h2 
            className="text-2xl text-black mb-6"
            style={{
              fontFamily: 'Random Grotesque, Arial, sans-serif',
              fontWeight: 900,
              fontStyle: 'italic'
            }}
          >
            Как это работает?
          </h2>
          
          {/* Основной текст */}
          <div 
            className="text-black leading-relaxed space-y-4"
            style={{
              fontFamily: 'Random Grotesque, Arial, sans-serif',
              fontWeight: 400,
              fontSize: '16px',
              lineHeight: '1.6'
            }}
          >
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