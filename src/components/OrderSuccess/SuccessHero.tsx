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
    // ИЗМЕНЕНИЕ: убираем фиксированную высоту h-[645px] lg:h-[563px] 
    // и заменяем на min-h-screen, чтобы компонент занимал всю высоту экрана
    <div className="order-success-hero-container relative w-full min-h-screen overflow-hidden">
      
      {/* ======== ДЕСКТОПНАЯ ВЕРСИЯ ======== */}
      <div className="hidden lg:block relative z-20 min-h-screen">
        <div className="min-h-screen flex flex-col justify-center items-center px-8">
          
          {/* Заголовочная секция с линиями по бокам */}
          <div className="w-full mb-16">
            <div className="flex items-start justify-between w-full px-5">
              {/* Левая линия */}
              <div className="flex-1 flex justify-start items-start pt-[1.2em] pr-8">
                <div className="w-full h-0.5 bg-white"></div>
              </div>
              
              {/* Центральный блок с заголовком */}
              <div className="text-center flex-shrink-0">
                <h1 className="order-success-title text-white font-bold text-[50px] leading-[59px] mb-4 whitespace-nowrap">
                  ВАШ ЗАКАЗ УСПЕШНО ОПЛАЧЕН
                </h1>
                <p className="order-success-subtitle text-[#d9cdbf] text-[20px] leading-[27px]">
                  Мы свяжемся с вами в ближайшее время
                </p>
              </div>
              
              {/* Правая линия */}
              <div className="flex-1 flex justify-end items-start pt-[1.2em] pl-8">
                <div className="w-full h-0.5 bg-white"></div>
              </div>
            </div>
          </div>

          {/* Нижний блок - разделен на два */}
          <div className="grid grid-cols-2 gap-50 max-w-4xl w-full ">
            
            {/* Левая секция */}
            <div className="flex flex-col items-start gap-4 ml-8">
              <p className="order-success-subtitle text-white text-[20px] leading-[27px] font-normal">
                Номер заказа: {orderNumber}
              </p>
              
              <button
                onClick={handleTrackOrder}
                className="order-success-subtitle flex items-center gap-3 text-white text-[20px] leading-[27px] font-normal underline bg-transparent border-none p-0 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <span>Отслеживать заказ</span>
                <div className="w-[10px] h-[10px] border-t-2 border-r-2 border-white transform rotate-45"></div>
              </button>
              
              <button
                onClick={handleGoToMain}
                className="order-success-subtitle bg-[#0b0b0d] hover:bg-[#2a2a2a] text-white font-normal transition-colors w-[255px] h-[50px] text-[20px] leading-[27px] mt-4"
              >
                НА ГЛАВНУЮ
              </button>
            </div>

            {/* Правая секция */}
            <div className="flex flex-col items-start gap-4">
              <p className="order-success-subtitle text-[#d9cdbf] text-[20px] leading-[27px] font-normal">
                Если у вас остались вопросы<br />напишите нам
              </p>
              
              <div className="flex gap-5 items-center">
                <button
                  onClick={() => window.open('https://t.me/TIGRSHOPsupport')}
                  className="bg-transparent rounded cursor-pointer flex items-center justify-center transition-all hover:scale-110"
                  title="Telegram"
                >
                  <img src="/social/tg.svg" alt="" className="w-10 h-10" />
                </button>
                
                <button
                  onClick={() => window.open('https://wa.me/79958714667')}
                  className="bg-transparent rounded cursor-pointer flex items-center justify-center transition-all hover:scale-110"
                  title="WhatsApp"
                >
                  <img src="/social/wa.svg" alt="" className="w-10 h-10" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======== МОБИЛЬНАЯ ВЕРСИЯ ======== */}
      <div className="lg:hidden relative z-20 min-h-screen">
        <div className="min-h-screen flex flex-col justify-center items-center px-4">
          
          {/* 1. Верхний блок - может быть пустым или с декором */}
          <div className="flex-1 flex items-end justify-center pb-8">
            {/* Верхняя вертикальная линия */}
            <div className="w-px h-[25vh] bg-white"></div>
          </div>

          {/* 2. Средний блок - заголовок */}
          <div className="flex-shrink-0 text-center py-8">
            <h1 className="order-success-title text-white font-bold text-[30px] leading-[35px] mb-3 max-w-[300px] mx-auto">
              ВАШ ЗАКАЗ УСПЕШНО ОПЛАЧЕН
            </h1>
            <p className="order-success-subtitle text-white text-[10px] leading-[10px] max-w-[300px] mx-auto">
              Мы свяжемся с вами в ближайшее время
            </p>
          </div>

          {/* 3. Нижний блок - два столбца с линией посередине */}
          <div className="flex-1 flex items-start justify-center pt-8 w-full">
            <div className="flex w-full max-w-sm relative">
              
              {/* Левая секция - номер заказа и кнопки */}
              <div className="flex-1 flex flex-col items-center gap-3 pr-4">
                <p className="text-white text-[10px] leading-[14px] font-normal text-center">
                  Номер заказа: {orderNumber}
                </p>
                
                <button
                  onClick={handleTrackOrder}
                  className="flex items-center justify-center text-white text-[10px] leading-[14px] font-normal w-[140px] h-[25px] bg-[#595047] px-3"
                >
                  <span>ОТСЛЕЖИВАТЬ ЗАКАЗ</span>
                </button>
                
                <button
                  onClick={handleGoToMain}
                  className="bg-[#0b0b0d] hover:bg-[#2a2a2a] text-white font-normal transition-colors w-[140px] h-[25px] text-[10px] leading-[14px] mt-2"
                >
                  НА ГЛАВНУЮ
                </button>
              </div>

              {/* Центральная линия */}
              <div className="absolute left-1/2 top-0 w-px h-[25vh] bg-white transform -translate-x-1/2"></div>

              {/* Правая секция - контакты */}
              <div className="flex-1 flex flex-col items-center gap-3 pl-4">
                <p className="text-white text-[10px] leading-[14px] font-normal text-center">
                  Если у вас остались вопросы<br />напишите нам
                </p>
                
                <div className="flex gap-5 items-center justify-center">
                  <button
                    onClick={() => window.open('https://t.me/TIGRSHOPsupport')}
                    className="bg-transparent rounded cursor-pointer flex items-center justify-center transition-all hover:scale-110"
                    title="Telegram"
                  >
                    <img src="/social/tg.svg" alt="" className="w-6 h-6" />
                  </button>
                  
                  <button
                    onClick={() => window.open('https://wa.me/79958714667')}
                    className="bg-transparent rounded cursor-pointer flex items-center justify-center transition-all hover:scale-110"
                    title="WhatsApp"
                  >
                    <img src="/social/wa.svg" alt="" className="w-6 h-6" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default SuccessHero;