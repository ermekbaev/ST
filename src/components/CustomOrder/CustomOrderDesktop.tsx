'use client';

import React from 'react';

interface CustomOrderDesktopProps {
  onHowItWorksClick: () => void;
}

const CustomOrderDesktop: React.FC<CustomOrderDesktopProps> = ({ onHowItWorksClick }) => {
  return (
    <>
      {/* Заголовок - черная часть, выровнена по левому краю */}
      <h2 className="custom-order-title custom-order-title--desktop text-brand-dark text-left my-8">
        В КАТАЛОГЕ НЕТ ИНТЕРЕСУЮЩЕЙ<br />
        МОДЕЛИ?<br />
        ВЫ ВСЕГДА МОЖЕТЕ ОФОРМИТЬ
      </h2>
      
      {/* "ИНДИВИДУАЛЬНЫЙ ЗАКАЗ" белым цветом */}
      <p className="custom-order-title custom-order-title--desktop text-white mb-16 text-left custom-order-highlight">
        ИНДИВИДУАЛЬНЫЙ ЗАКАЗ
      </p>
      
      {/* Кнопка заказа - десктопная */}
      <div className="text-center my-16">
        <a
          href="https://t.me/TIGRSHOPsupport"
          className="custom-order-btn custom-order-btn--desktop"
        >
          ОФОРМИТЬ ИНДИВИДУАЛЬНЫЙ ЗАКАЗ
        </a>
      </div>

      {/* Ссылка "Как это работает?" - десктопная версия */}
      <div className="text-center">
        <button
          onClick={onHowItWorksClick}
          className="custom-order-link custom-order-link--desktop pt-10"
        >
          Как это работает?
        </button>
      </div>
    </>
  );
};

export default CustomOrderDesktop;