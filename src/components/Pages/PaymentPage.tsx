'use client';

import React, { useState, useEffect } from 'react';

const PaymentPage: React.FC = () => {
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
    <div className="pb-20 bg-white">
      {/* Контейнер страницы с отступами */}
      <div className="px-5 pb-4 lg:pb-6">

        {/* Заголовок с линией */}
        <div className="mb-8 pt-8">
          <div className="relative flex items-center">
            {/* Заголовок "ОПЛАТА" */}
            <h1 className="font-black italic text-[28px] leading-[24px] lg:text-[40px] lg:leading-[48px] text-black uppercase w-[180px] lg:w-[260px] min-w-[180px] lg:min-w-[260px]">
              ОПЛАТА
            </h1>
            
            {/* Линия справа от заголовка - только на десктопе */}
            <div className="hidden lg:block bg-black h-[2px] flex-1 ml-[71px]"></div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="mt-8 lg:mt-12">
          
          {/* DESKTOP ВЕРСИЯ */}
          <div className="hidden lg:block space-y-10">
            
            {/* Секция "Какие способы оплаты возможны?" */}
            <div>
              <h2 className="text-[22px] leading-[28px] font-black mb-4 text-black">
                Какие способы оплаты возможны?
              </h2>
              
              <div className="space-y-4">
                <p className="text-[18px] leading-[26px] text-black">
                  Мы принимаем оплату банковскими картами:
                </p>
                
                <div className="ml-6">
                  <ul className="space-y-2 text-[16px] leading-[24px] text-black">
                    <li>• Visa, Mastercard, МИР</li>
                    <li>• СБП и др.</li>
                  </ul>
                </div>
                
                <p className="text-[18px] leading-[26px] text-black">
                  Кроме того, в городе Владивосток мы также принимаем платежи наличными, а также можем создать электронную ссылку для оплаты товаров под заказ.
                </p>
              </div>
            </div>

            {/* Секция "Нужно ли дополнительно оплачивать налоги и таможенные сборы?" */}
            <div>
              <h2 className="text-[22px] leading-[28px] font-black mb-4 text-black">
                Нужно ли дополнительно оплачивать налоги и таможенные сборы?
              </h2>
              
              <div>
                <p className="text-[18px] leading-[26px] text-black">
                  Нет, не нужно, все налоги и таможенные сборы уже включены в итоговую стоимость товаров в нашем магазине.
                </p>
              </div>
            </div>
            
          </div>

          {/* MOBILE ВЕРСИЯ */}
          <div className="block lg:hidden space-y-6">
            
            {/* Секция "Какие способы оплаты возможны?" */}
            <div>
              <h2 className="text-[16px] leading-[20px] font-black mb-3 text-black">
                Какие способы оплаты возможны?
              </h2>
              
              <div className="space-y-3">
                <p className="text-[14px] leading-[20px] text-black">
                  Мы принимаем оплату банковскими картами:
                </p>
                
                <ul className="list-disc list-inside space-y-1 ml-2 text-[14px] leading-[20px] text-black">
                  <li>Visa, Mastercard, МИР</li>
                  <li>СБП и др.</li>
                </ul>
                
                <p className="text-[14px] leading-[20px] text-black">
                  Кроме того, в городе Владивосток мы также принимаем платежи наличными, а также можем создать электронную ссылку для оплаты товаров под заказ.
                </p>
              </div>
            </div>

            {/* Секция "Нужно ли дополнительно оплачивать налоги и таможенные сборы?" */}
            <div>
              <h2 className="text-[16px] leading-[20px] font-black mb-3 text-black">
                Нужно ли дополнительно оплачивать налоги и таможенные сборы?
              </h2>
              
              <div>
                <p className="text-[14px] leading-[20px] text-black">
                  Нет, не нужно, все налоги и таможенные сборы уже включены в итоговую стоимость товаров в нашем магазине.
                </p>
              </div>
            </div>
            
          </div>

        </div>

      </div>
    </div>
  );
};

export default PaymentPage;