'use client';

import React from 'react';

interface CustomOrderDesktopProps {
  onHowItWorksClick: () => void;
}

const CustomOrderDesktop: React.FC<CustomOrderDesktopProps> = ({ onHowItWorksClick }) => {
  return (
    <>
      {/* Заголовок - черная часть, выровнена по левому краю */}
      <h2 
        className="text-[45px] lg:text-[55px] text-brand-dark leading-tight mb-8 text-left"
        style={{ 
          fontFamily: 'Druk Wide Cyr, sans-serif',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
          lineHeight: '0.95'
        }}
      >
        В КАТАЛОГЕ НЕТ ИНТЕРЕСУЮЩЕЙ<br />
        МОДЕЛИ?<br />
        ВЫ ВСЕГДА МОЖЕТЕ ОФОРМИТЬ
      </h2>
      
      {/* "ИНДИВИДУАЛЬНЫЙ ЗАКАЗ" белым цветом */}
      <p 
        className="text-[45px] lg:text-[55px] text-white mb-16 text-left"
        style={{ 
          fontFamily: 'Druk Wide Cyr, sans-serif',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
          lineHeight: '0.95',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}
      >
        ИНДИВИДУАЛЬНЫЙ ЗАКАЗ
      </p>
      
      {/* Кнопка заказа - десктопная */}
      <div className="text-center mb-16">
        <a
          href="https://t.me/TIGRSHOPsupport"
          className="inline-block bg-transparent border-2 border-white text-white px-12 py-4 text-[24px] lg:text-[26px] hover:bg-white hover:text-brand-dark transition-colors uppercase tracking-wide"
          style={{ 
            fontFamily: 'Random Grotesque, sans-serif',
            fontWeight: 400,
            width: '732px',
            maxWidth: '90vw'
          }}
        >
          ОФОРМИТЬ ИНДИВИДУАЛЬНЫЙ ЗАКАЗ
        </a>
      </div>

      {/* Ссылка "Как это работает?" - десктопная версия */}
      <div className="text-center">
        <button
          onClick={onHowItWorksClick}
          className="text-gray-600 text-[16px] lg:text-[18px] underline hover:text-gray-800 transition-colors cursor-pointer bg-transparent border-none"
          style={{ 
            fontFamily: 'Random Grotesque, sans-serif',
            fontWeight: 400
          }}
        >
          Как это работает?
        </button>
      </div>
    </>
  );
};

export default CustomOrderDesktop;