'use client';

import React, { useState, useEffect } from 'react';

const ContactsPage: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Главная секция с отступами по 20px с каждой стороны */}
      <div className="px-5 pb-0">

        {/* Заголовок с линией */}
        <div className="mb-8 pt-8">
          <div className="relative">
            <h1 className="font-banner text-[30px] lg:text-[50px] leading-[35px] lg:leading-[61px] text-[#0B0B0D] uppercase w-[250px] lg:w-[428px] h-[35px] lg:h-[61px]">
              КОНТАКТЫ
            </h1>
            
            {/* Линия - только на десктопе */}
            <div className="hidden lg:block absolute bg-black h-[3px] top-8 left-[448px] right-0 max-w-[calc(100vw-488px)]"></div>
          </div>
        </div>

        {/* ДЕСКТОПНАЯ ВЕРСИЯ - скрыта на мобильном */}
        <div className="hidden lg:block">
          {/* Глобальный grid: левая зона (текст) + правая зона (карта) */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_570px] gap-16 mt-[69px]">
            
            {/* ЛЕВАЯ ЗОНА - весь текстовый контент */}
            <div className="grid grid-cols-1 lg:grid-cols-3 grid-rows-2 gap-16">
              
              {/* Первая строка, первая колонка - Способы связи */}
              <div className="lg:col-span-1">
                <h2 className="font-product font-black italic text-[30px] leading-[35px] text-black mb-8">
                  Способ связи
                </h2>
                
                <div className="flex gap-16">
                  {/* Telegram */}
                  <div className="flex flex-col items-center">
                    <a 
                      href="https://t.me/TIGRSHOPsupport"
                      className="mb-4 block hover:opacity-70 transition-opacity"
                    >
                      <img src="/social/tg_dark.svg" alt="Telegram" className="w-8 h-8" />
                    </a>
                    <span className="font-product text-black text-center text-[20px] leading-[35px]">
                      telegram
                    </span>
                  </div>

                  {/* WhatsApp */}
                  <div className="flex flex-col items-center">
                    <a 
                      href="https://wa.me/79962814667"
                      className="mb-4 block hover:opacity-70 transition-opacity"
                    >
                      <img src="/social/wa_dark.svg" alt="WhatsApp" className="w-8 h-8" />
                    </a>
                    <span className="font-product text-black text-center text-[20px] leading-[35px]">
                      whatsapp
                    </span>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col items-center">
                    <a 
                      href="mailto:contact@tigrshop.ru"
                      className="mb-4 block hover:opacity-70 transition-opacity"
                    >
                      <img src="/social/em_dark.svg" alt="Email" className="w-8 h-8" />
                    </a>
                    <span className="font-product text-black text-center text-[20px] leading-[35px]">
                      email
                    </span>
                  </div>
                </div>
              </div>

              {/* Первая строка, вторая колонка - пустой div */}
              <div className="lg:col-span-1">
                {/* Пустое место */}
              </div>

              {/* Первая строка, третья колонка - Адрес */}
              <div className="lg:col-span-1">
                <h2 className="font-product font-black italic text-[30px] leading-[35px] text-black mb-12">
                  Адрес
                </h2>
                <div className="font-product text-black text-[20px] leading-[35px]">
                  г. Владивосток, 1-я<br />
                  пригородная 13
                </div>
              </div>

              {/* Вторая строка - Секция "Подробнее" на все 3 колонки */}
              <div className="lg:col-span-3 mt-16">
                <h2 className="font-product font-black italic text-[30px] leading-[35px] text-black mb-8">
                  Подробнее
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                  
                  {/* Наименование */}
                  <div>
                    <h3 className="font-product font-black italic text-[20px] leading-[35px] text-black">
                      Наименование
                    </h3>
                    <span className='font-product text-black'>
                      ИП Воздюк Глеб Витальевич
                    </span>
                  </div>

                  {/* ОГРНИП */}
                  <div>
                    <h3 className="font-product font-black italic text-[20px] leading-[35px] text-black">
                      ОГРНИП
                    </h3>
                    <span className='font-product text-black'>
                      322250000009070
                    </span>
                  </div>

                  {/* ИНН */}
                  <div>
                    <h3 className="font-product font-black italic text-[20px] leading-[35px] text-black">
                      ИНН
                    </h3>
                    <span className='font-product text-black'>
                      792028574102
                    </span>
                  </div>

                </div>
              </div>

            </div>

            {/* ПРАВАЯ ЗОНА - только карта */}
            <div className="relative overflow-hidden w-full h-[408px] bg-[#E5DDD4]">
              {/* Заглушка карты */}
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-gray-600">
                  <div className="font-product text-[14px]">
                    Здесь будет интерактивная карта
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* МОБИЛЬНАЯ ВЕРСИЯ - показывается только на мобильном */}
        <div className="block lg:hidden">
          <div className="space-y-12 mt-8">
            
            {/* Способы связи */}
            <div>
              <h2 className="font-product font-black italic text-[20px] leading-[25px] text-black mb-6">
                Способ связи
              </h2>
              
              <div className="flex gap-8 justify-start">
                {/* Telegram */}
                <div className="flex flex-col items-center">
                  <a 
                    href="https://t.me/TIGRSHOPsupport"
                    className="mb-3 block hover:opacity-70 transition-opacity"
                  >
                    <img src="/social/tg_dark.svg" alt="Telegram" className="w-6 h-6" />
                  </a>
                  <span className="font-product text-black text-center text-[14px] leading-[20px]">
                    telegram
                  </span>
                </div>

                {/* WhatsApp */}
                <div className="flex flex-col items-center">
                  <a 
                    href="https://wa.me/79962814667"
                    className="mb-3 block hover:opacity-70 transition-opacity"
                  >
                    <img src="/social/wa_dark.svg" alt="WhatsApp" className="w-6 h-6" />
                  </a>
                  <span className="font-product text-black text-center text-[14px] leading-[20px]">
                    whatsapp
                  </span>
                </div>

                {/* Email */}
                <div className="flex flex-col items-center">
                  <a 
                    href="mailto:contact@tigrshop.ru"
                    className="mb-3 block hover:opacity-70 transition-opacity"
                  >
                    <img src="/social/em_dark.svg" alt="Email" className="w-6 h-6" />
                  </a>
                  <span className="font-product text-black text-center text-[14px] leading-[20px]">
                    email
                  </span>
                </div>
              </div>
            </div>

            {/* Адрес */}
            <div>
              <h2 className="font-product font-black italic text-[20px] leading-[25px] text-black mb-6">
                Адрес
              </h2>
              <div className="font-product text-black text-[16px] leading-[22px]">
                г. Владивосток, 1-я<br />
                пригородная 13
              </div>
            </div>

            {/* Карта - размеры для мобильного W:300, H:130 */}
            <div className="relative overflow-hidden w-[300px] h-[130px] bg-[#E5DDD4] mx-auto">
              {/* Заглушка карты */}
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-gray-600">
                  <div className="font-product text-[12px]">
                    Карта
                  </div>
                </div>
              </div>
            </div>

            {/* Секция "Подробнее" */}
            <div>
              <h2 className="font-product font-black italic text-[20px] leading-[25px] text-black mb-6">
                Подробнее
              </h2>

              <div className="space-y-6">
                
                {/* Наименование */}
                <div>
                  <h3 className="font-product font-black italic text-[16px] leading-[20px] text-black mb-2">
                    Наименование
                  </h3>
                  <span className='font-product text-black text-[14px] leading-[18px]'>
                    ИП Воздюк Глеб Витальевич
                  </span>
                </div>

                {/* ОГРНИП */}
                <div>
                  <h3 className="font-product font-black italic text-[16px] leading-[20px] text-black mb-2">
                    ОГРНИП
                  </h3>
                  <span className='font-product text-black text-[14px] leading-[18px]'>
                    322250000009070
                  </span>
                </div>

                {/* ИНН */}
                <div>
                  <h3 className="font-product font-black italic text-[16px] leading-[20px] text-black mb-2">
                    ИНН
                  </h3>
                  <span className='font-product text-black text-[14px] leading-[18px]'>
                    792028574102
                  </span>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ContactsPage;