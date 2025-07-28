// src/components/Pages/BankPage.tsx
'use client';

import React from 'react';

const BankPage: React.FC = () => {

  return (
    <div className="min-h-screen bg-white">
      {/* Контейнер страницы с отступами по 20px для основного контента */}
      <div className="px-5 lg:px-5 pb-4 lg:pb-6">
        
        {/* Основное содержание с отступами */}
        <div className="px-5 lg:px-5 pt-6 lg:pt-8 pb-[70px] lg:pb-[110px]">

          {/* ДЕСКТОПНАЯ ВЕРСИЯ - показывается только на desktop */}
          <div className="hidden lg:block">
            
            {/* Заголовок страницы с Tailwind классами */}
            <div className="flex items-center mb-10">
              <h1 className="font-banner font-bold text-[50px] leading-[61px] text-black uppercase w-[312px] min-w-[312px] mr-48">
                реквизиты
              </h1>
              <div className="flex-1 h-0.5 bg-black ml-[45px]"></div>
            </div>

        {/* Основной контент */}
        <div className="mt-[50px] lg:mt-[70px]">
          
          {/* ДЕСКТОПНАЯ ВЕРСИЯ - показывается только на desktop */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-2 gap-x-20">
              
              {/* Левая колонка */}
              <div className="space-y-10">
                <div>
                  <div className="font-product font-black text-black text-[20px] leading-[35px] mb-1">
                    Название организации
                  </div>
                  <div className="font-product text-black text-[20px] leading-[35px]">
                    ИНДИВИДУАЛЬНЫЙ ПРЕДПРИНИМАТЕЛЬ АЙВАЗЯН ТИГРАН ЭДУАРДОВИЧ
                  </div>
                </div>
                
                <div>
                  <div className="font-product font-black text-black text-[20px] leading-[35px] mb-1">
                    Юридический адрес организации
                  </div>
                  <div className="font-product text-black text-[20px] leading-[35px]">
                    690054, РОССИЯ ПРИМОРСКИЙ КРАЙ Г ВЛАДИВОСТОК, УЛ 1-Я ПРИГОРОДНАЯ, Д 15
                  </div>
                </div>
                
                <div>
                  <div className="font-product font-black text-black text-[20px] leading-[35px] mb-1">
                    ИНН
                  </div>
                  <div className="font-product text-black text-[20px] leading-[35px]">
                    253812345040
                  </div>
                </div>
                
                <div>
                  <div className="font-product font-black text-black text-[20px] leading-[35px] mb-1">
                    ОГРН/ОГРНИП
                  </div>
                  <div className="font-product text-black text-[20px] leading-[35px]">
                    322595000049575
                  </div>
                </div>
                
                <div>
                  <div className="font-product font-black text-black text-[20px] leading-[35px] mb-1">
                    Расчетный счет
                  </div>
                  <div className="font-product text-black text-[20px] leading-[35px]">
                    40802810700008532183
                  </div>
                </div>
              </div>

              {/* Правая колонка */}
              <div className="space-y-10">
                <div>
                  <div className="font-product font-black text-black text-[20px] leading-[35px] mb-1">
                    Банк
                  </div>
                  <div className="font-product text-black text-[20px] leading-[35px]">
                    АО «Т-Банк»
                  </div>
                </div>
                
                <div>
                  <div className="font-product font-black text-black text-[20px] leading-[35px] mb-1">
                    ИНН банка
                  </div>
                  <div className="font-product text-black text-[20px] leading-[35px]">
                    771040679
                  </div>
                </div>
                
                <div>
                  <div className="font-product font-black text-black text-[20px] leading-[35px] mb-1">
                    БИК банка
                  </div>
                  <div className="font-product text-black text-[20px] leading-[35px]">
                    044525974
                  </div>
                </div>
                
                <div>
                  <div className="font-product font-black text-black text-[20px] leading-[35px] mb-1">
                    Корреспондентский счет банка
                  </div>
                  <div className="font-product text-black text-[20px] leading-[35px]">
                    30101810H525000974
                  </div>
                </div>
                
                <div>
                  <div className="font-product font-black text-black text-[20px] leading-[35px] mb-1">
                    Юридический адрес банка
                  </div>
                  <div className="font-product text-black text-[20px] leading-[35px]">
                    127287, Г МОСКВА, УЛ ХУТОРСКАЯ 2-Я, Д 38А, СТР 26
                  </div>
                </div>
              </div>
              
            </div>

          </div>

          {/* МОБИЛЬНАЯ ВЕРСИЯ - показывается только на мобильном */}
          <div className="block lg:hidden">

            {/* Блоки реквизитов для мобильного - одна колонка */}
            <div className="space-y-10">
              
              {/* Данные организации */}
              <div>
                <div className="font-product font-black text-black text-[14px] leading-[20px] mb-1">
                  Название организации
                </div>
                <div className="font-product text-black text-[16px] leading-[22px] mb-8">
                  ИНДИВИДУАЛЬНЫЙ ПРЕДПРИНИМАТЕЛЬ АЙВАЗЯН ТИГРАН ЭДУАРДОВИЧ
                </div>
              </div>
              
              <div>
                <div className="font-product font-black text-black text-[14px] leading-[20px] mb-1">
                  Юридический адрес организации
                </div>
                <div className="font-product text-black text-[16px] leading-[22px] mb-8">
                  690054, РОССИЯ ПРИМОРСКИЙ КРАЙ Г ВЛАДИВОСТОК, УЛ 1-Я ПРИГОРОДНАЯ, Д 15
                </div>
              </div>
              
              <div>
                <div className="font-product font-black text-black text-[14px] leading-[20px] mb-1">
                  ИНН
                </div>
                <div className="font-product text-black text-[16px] leading-[22px] mb-8">
                  253812345040
                </div>
              </div>
              
              <div>
                <div className="font-product font-black text-black text-[14px] leading-[20px] mb-1">
                  ОГРН/ОГРНИП
                </div>
                <div className="font-product text-black text-[16px] leading-[22px] mb-8">
                  322595000049575
                </div>
              </div>
              
              <div>
                <div className="font-product font-black text-black text-[14px] leading-[20px] mb-1">
                  Расчетный счет
                </div>
                <div className="font-product text-black text-[16px] leading-[22px] mb-8">
                  40802810700008532183
                </div>
              </div>

              {/* Данные банка */}
              <div>
                <div className="font-product font-black text-black text-[14px] leading-[20px] mb-1">
                  Банк
                </div>
                <div className="font-product text-black text-[16px] leading-[22px] mb-8">
                  АО «Т-Банк»
                </div>
              </div>
              
              <div>
                <div className="font-product font-black text-black text-[14px] leading-[20px] mb-1">
                  ИНН банка
                </div>
                <div className="font-product text-black text-[16px] leading-[22px] mb-8">
                  771040679
                </div>
              </div>
              
              <div>
                <div className="font-product font-black text-black text-[14px] leading-[20px] mb-1">
                  БИК банка
                </div>
                <div className="font-product text-black text-[16px] leading-[22px] mb-8">
                  044525974
                </div>
              </div>
              
              <div>
                <div className="font-product font-black text-black text-[14px] leading-[20px] mb-1">
                  Корреспондентский счет банка
                </div>
                <div className="font-product text-black text-[16px] leading-[22px] mb-8">
                  30101810H525000974
                </div>
              </div>
              
              <div>
                <div className="font-product font-black text-black text-[14px] leading-[20px] mb-1">
                  Юридический адрес банка
                </div>
                <div className="font-product text-black text-[16px] leading-[22px]">
                  127287, Г МОСКВА, УЛ ХУТОРСКАЯ 2-Я, Д 38А, СТР 26
                </div>
              </div>
              
            </div>

        </div>

      </div>
    </div>
    </div>

    </div>

    </div>

  );
};

export default BankPage;