// ===================================================================
// ИСПРАВЛЕННЫЙ src/components/OrderSuccess/SuccessHero.tsx
// ===================================================================

'use client';

import React from 'react';

interface SuccessHeroProps {
  orderNumber?: string;
}

const SuccessHero: React.FC<SuccessHeroProps> = ({ orderNumber = "TS-127702" }) => {
  const handleGoToMain = () => {
    window.location.href = '/';
  };

  const handleTrackOrder = () => {
    console.log('Отслеживание заказа:', orderNumber);
  };

  return (
    <div className="order-success-hero-container">
      {/* Декоративные линии по бокам - только десктоп */}
      <div className="order-success-hero-lines">
        <div className="order-success-hero-line-left"></div>
        <div className="order-success-hero-line-right"></div>
      </div>
      
      {/* Вертикальные линии - только мобиль */}
      <div className="order-success-hero-vertical-lines">
        <div className="order-success-hero-vertical-line-top"></div>
        <div className="order-success-hero-vertical-line-bottom"></div>
      </div>

      {/* Основной заголовок */}
      <div className="order-success-hero-content">
        <h1 className="order-success-title">
          ВАШ ЗАКАЗ УСПЕШНО ОПЛАЧЕН
        </h1>
        <p className="order-success-subtitle">
          Мы свяжемся с вами в ближайшее время
        </p>
      </div>

      {/* Левая секция - номер заказа и кнопки */}
      <div className="order-success-left-section">
        <p className="order-success-order-text">
          Номер заказа: {orderNumber}
        </p>
        
        <button 
          onClick={handleTrackOrder}
          className="order-success-track-btn"
        >
          <span>Отслеживать заказ</span>
          <div className="order-success-track-arrow"></div>
        </button>
        
        <button 
          onClick={handleGoToMain}
          className="order-success-main-btn"
        >
          НА ГЛАВНУЮ
        </button>
      </div>

      {/* Правая секция - поддержка */}
      <div className="order-success-right-section">
        <p className="order-success-support-text">
          Если у вас остались вопросы<br />напишите нам
        </p>
        
        <div className="order-success-contact-icons">
          <button 
            onClick={() => window.open('https://t.me/TIGRSHOPsupport')}
            className="order-success-contact-btn"
            title="Telegram"
          >
            <img src="/social/tg.svg" alt="" className='w-10 h-10'/>
          </button>
          
          <button 
            onClick={() => window.open('https://wa.me/79962814667')}
            className="order-success-contact-btn"
            title="WhatsApp"
          >
            <img src="/social/wa.svg" alt="" className='w-10 h-10'/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessHero;

