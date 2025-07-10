'use client';

import React from 'react';

interface CustomOrderMobileProps {
  onHowItWorksClick: () => void;
}

const CustomOrderMobile: React.FC<CustomOrderMobileProps> = ({ onHowItWorksClick }) => {
  return (
    <div className="md:hidden h-full flex flex-col justify-center px-2">
      {/* Первый блок: "В КАТАЛОГЕ НЕТ ИНТЕРЕСУЮЩЕЙ МОДЕЛИ?" - черный текст, левый край */}
      <div className="mb-2">
        <h2 className="custom-order-title custom-order-title--mobile text-brand-dark text-left">
          В КАТАЛОГЕ НЕТ<br />
          ИНТЕРЕСУЮЩЕЙ<br />
          МОДЕЛИ?
        </h2>
      </div>

      {/* Второй блок: "ВЫ ВСЕГДА МОЖЕТЕ ОФОРМИТЬ" - белый текст, центр */}
      <div className="mt-8 text-center">
        <h3 className="custom-order-subtitle custom-order-subtitle--mobile text-white custom-order-highlight">
          ВЫ ВСЕГДА МОЖЕТЕ ОФОРМИТЬ
        </h3>
      </div>

      {/* Третий блок: "ИНДИВИДУАЛЬНЫЙ ЗАКАЗ" - белый текст, центр */}
      <div className="mb-8 text-center">
        <h4 className="custom-order-main custom-order-main--mobile text-white custom-order-highlight">
          ИНДИВИДУАЛЬНЫЙ<br />
          ЗАКАЗ
        </h4>
      </div>
      
      {/* Кнопка заказа - мобильная */}
      <div className="flex justify-center mb-8">
        <a
          href="https://t.me/TIGRSHOPsupport"
          className="custom-order-btn custom-order-btn--mobile"
        >
          ОФОРМИТЬ ИНДИВИДУАЛЬНЫЙ ЗАКАЗ
        </a>
      </div>

      {/* Ссылка "Как это работает?" - мобильная версия */}
      <div className="text-center">
        <button
          onClick={onHowItWorksClick}
          className="custom-order-link custom-order-link--mobile"
        >
          Как это работает?
        </button>
      </div>
    </div>
  );
};

export default CustomOrderMobile;