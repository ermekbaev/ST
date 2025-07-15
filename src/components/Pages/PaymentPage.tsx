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
    <div className="min-h-screen bg-white">
      {/* Контейнер страницы с отступами по 20px и минимальным отступом снизу */}
      <div className="px-5 lg:px-5 pb-4 lg:pb-6">

        {/* Заголовок с линией */}
        <div className="mb-8 pt-8">
          <div className="relative flex items-center">
            {/* Заголовок "ОПЛАТА" */}
            <h1 className="payment-page-title">
              ОПЛАТА
            </h1>
            
            {/* Линия справа от заголовка - только на десктопе */}
            <div className="payment-page-line"></div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="mt-[50px] lg:mt-[70px]">
          <div className="payment-page-content">
            
            {/* DESKTOP ВЕРСИЯ */}
            <div className="hidden lg:block">
              
              {/* Секция "Какие способы оплаты возможны?" */}
              <div className="mb-12">
                <h2 className="text-[30px] leading-[45px] font-black mb-6">
                  Какие способы оплаты возможны?
                </h2>
                
                <div className="payment-section-content space-y-6">
                  <p className="text-[30px] leading-[45px]">
                    Мы принимаем оплату банковскими картами:
                  </p>
                  
                  <div className="ml-8">
                    <ul className="space-y-3 text-[20px] leading-[45px]">
                      <li>• Visa, Mastercard, МИР.</li>
                      <li>• СБП и др.</li>
                    </ul>
                  </div>
                  
                  <p className="text-[30px] leading-[45px]">
                    Кроме того, в городе Владивосток мы также принимаем платежи наличными, а также можем создать электронную ссылку для оплаты товаров под заказ.
                  </p>
                </div>
              </div>

              {/* Секция "Нужно ли дополнительно оплачивать налоги и таможенные сборы?" */}
              <div className="mb-12">
                <h2 className="text-[30px] leading-[45px] font-black mb-6">
                  Нужно ли дополнительно оплачивать налоги и таможенные сборы?
                </h2>
                
                <div className="payment-section-content">
                  <p className="text-[30px] leading-[45px]">
                    Нет, не нужно, все налоги и таможенные сборы уже включены в итоговую стоимость товаров в нашем магазине.
                  </p>
                </div>
              </div>
              
            </div>

            {/* MOBILE ВЕРСИЯ */}
            <div className="block lg:hidden">
              
              {/* Секция "Какие способы оплаты возможны?" */}
              <div className="mb-6">
                <h2 className="text-xl leading-6 font-black mb-3">
                  Какие способы оплаты возможны?
                </h2>
                
                <div className="payment-section-content-mobile">
                  <p className="mb-3">
                    Мы принимаем оплату банковскими картами:
                  </p>
                  
                  <ul className="list-disc list-inside space-y-1 mb-3 ml-2">
                    <li>Visa, Mastercard, МИР.</li>
                    <li>СБП и др.</li>
                  </ul>
                  
                  <p>
                    Кроме того, в городе Владивосток мы также принимаем платежи наличными, а также можем создать электронную ссылку для оплаты товаров под заказ.
                  </p>
                </div>
              </div>

              {/* Секция "Нужно ли дополнительно оплачивать налоги и таможенные сборы?" */}
              <div className="mb-6">
                <h2 className="text-xl leading-6 font-black mb-3">
                  Нужно ли дополнительно оплачивать налоги и таможенные сборы?
                </h2>
                
                <div className="payment-section-content-mobile">
                  <p>
                    Нет, не нужно, все налоги и таможенные сборы уже включены в итоговую стоимость товаров в нашем магазине.
                  </p>
                </div>
              </div>
              
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default PaymentPage;