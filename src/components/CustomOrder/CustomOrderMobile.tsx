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
        <h2 
          className="text-2xl text-brand-dark text-left font-bold"
          style={{ 
            fontFamily: 'Druk Wide Cyr, sans-serif',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '-0.01em',
            lineHeight: '1.05'
          }}
        >
          В КАТАЛОГЕ НЕТ<br />
          ИНТЕРЕСУЮЩЕЙ<br />
          МОДЕЛИ?
        </h2>
      </div>

      {/* Второй блок: "ВЫ ВСЕГДА МОЖЕТЕ ОФОРМИТЬ" - белый текст, центр */}
      <div className="mt-8 text-center">
        <h3 
          className="text-sm text-white font-bold"
          style={{ 
            fontFamily: 'Druk Wide Cyr, sans-serif',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '-0.01em',
            lineHeight: '1.05',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }}
        >
          ВЫ ВСЕГДА МОЖЕТЕ ОФОРМИТЬ
        </h3>
      </div>

      {/* Третий блок: "ИНДИВИДУАЛЬНЫЙ ЗАКАЗ" - белый текст, центр */}
      <div className="mb-8 text-center">
        <h4 
          className="text-[23px] text-white font-bold"
          style={{ 
            fontFamily: 'Druk Wide Cyr, sans-serif',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '-0.01em',
            lineHeight: '1.05',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }}
        >
          ИНДИВИДУАЛЬНЫЙ<br />
          ЗАКАЗ
        </h4>
      </div>
      
      {/* Кнопка заказа - мобильная */}
      <div className="flex justify-center mb-8">
        <a
          href="https://t.me/TIGRSHOPsupport"
          className="inline-block bg-transparent border border-white text-white px-6 py-3 text-[12px] hover:bg-white hover:text-black transition-colors uppercase text-center leading-tight"
          style={{ 
            fontFamily: 'Random Grotesque, sans-serif',
            fontWeight: 400,
            borderWidth: '1px',
            width: '290px',
            maxWidth: '85vw'
          }}
        >
          ОФОРМИТЬ ИНДИВИДУАЛЬНЫЙ ЗАКАЗ
        </a>
      </div>

      {/* Ссылка "Как это работает?" - мобильная версия */}
      <div className="text-center">
        <button
          onClick={onHowItWorksClick}
          className="text-gray-600 text-[13px] underline hover:text-gray-800 transition-colors cursor-pointer bg-transparent border-none"
          style={{ 
            fontFamily: 'Random Grotesque, sans-serif',
            fontWeight: 400
          }}
        >
          Как это работает?
        </button>
      </div>
    </div>
  );
};

export default CustomOrderMobile;