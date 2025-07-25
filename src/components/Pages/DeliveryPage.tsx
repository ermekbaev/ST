'use client';

import React, { useState, useEffect } from 'react';

const DeliveryPage: React.FC = () => {
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
      {/* Контейнер страницы с отступами по 20px и отступом снизу от футера */}
      <div className="px-5 lg:px-5 pb-8 lg:pb-12">

        {/* Заголовок с линией */}
        <div className="mb-8 pt-8">
          <div className="relative flex items-center">
            {/* Заголовок "ДОСТАВКА" */}
            <h1 className="delivery-page-title">
              ДОСТАВКА
            </h1>
            
            {/* Линия справа от заголовка - только на десктопе */}
            <div className="delivery-page-line"></div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="mt-[50px] lg:mt-[70px]">
          <div className="delivery-page-content">
            
            {/* DESKTOP ВЕРСИЯ */}
            <div className="hidden lg:block">
              {/* Вводный текст */}
              <p className="text-[30px] leading-[35px] mb-8">
                Мы бережем ваше время, и работаем надёжно, учитывая все ваши пожелания.
              </p>

              {/* Секция "Самовывоз" */}
              <div className="mb-8">
                <h2 className="text-[30px] leading-[35px] font-black mb-4">
                  Самовывоз
                </h2>
                <div className="delivery-section-content">
                  <p>
                    Для Владивостока – доступен самовывоз или доставка по городу.
                    <br />При поступлении товара на склад, в личном кабинете будет обозначено, что товар готов к выдаче.
                    <br />Поступление занимает от 4 до 14 рабочих дней.
                    <br />Уточнить актуальную информацию можно у поддержки интернет-магазина.
                  </p>
                </div>
              </div>

              {/* Секция "Доставка по всей России и СНГ" */}
              <div className="mb-8">
                <h2 className="text-[30px] leading-[35px] font-black mb-4">
                  Доставка по всей России и СНГ
                </h2>
                
                <div className="space-y-4 delivery-section-content">
                  <p>
                    <strong>СДЭК</strong> — доставка до пункта выдачи или курьером.
                    <br />Сроки и стоимость рассчитываются индивидуально при оформлении заказа через калькулятор СДЭК.
                  </p>
                  
                  <p>
                    <strong>Почта России</strong> — доставка до пункта выдачи или курьером.
                    <br />Сроки и стоимость рассчитываются индивидуально при оформлении заказа через калькулятор Почта России.
                  </p>
                  
                  <p>
                    <strong>BoxBerry</strong> — доставка до пункта выдачи или курьером.
                    <br />Сроки и стоимость рассчитываются индивидуально при оформлении заказа через калькулятор СДЭК.
                  </p>
                  
                  <p>
                    <strong>КАРГО</strong> — доставка в страны СНГ обговаривается и рассчитывается индивидуально с менеджером.
                  </p>
                </div>
              </div>

              {/* Дополнительная информация */}
              <div className="mb-8">
                <div className="delivery-section-content">
                  <p className="mb-4">
                    Сроки и стоимость курьерской доставки рассчитываются индивидуально. Сервис может быть изменен при недоступности доставки по указанному адресу.
                  </p>
                  
                  <ul className="space-y-2">
                    <li>• Срок доставки: 7-14 рабочих дней.</li>
                    <li>• После оформления заявки на индивидуальный заказ, персональный менеджер свяжется с Вами и подберет для Вас подходящий размер.</li>
                    <li>• Курьер уведомляет получателя о доставке за 30 минут до своего приезда.</li>
                    <li>• Электронный чек, подтверждающий покупку, Вы получите по электронной почте, указанной при оформлении заказа.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* MOBILE ВЕРСИЯ */}
            <div className="block lg:hidden">
              {/* Вводный текст */}
              <p className="text-lg leading-[22px] mb-6">
                Мы бережем ваше время, и работаем надёжно, учитывая все ваши пожелания.
              </p>

              {/* Секция "Самовывоз" */}
              <div className="mb-6">
                <h2 className="text-xl leading-6 font-black mb-3">
                  Самовывоз
                </h2>
                <div className="delivery-section-content-mobile">
                  <p>
                    Для Владивостока – доступен самовывоз или доставка по городу.
                    При поступлении товара на склад, в личном кабинете будет обозначено, что товар готов к выдаче.
                    Поступление занимает от 4 до 14 рабочих дней.
                    Уточнить актуальную информацию можно у поддержки интернет-магазина.
                  </p>
                </div>
              </div>

              {/* Секция "Доставка по всей России и СНГ" */}
              <div className="mb-6">
                <h2 className="text-xl leading-6 font-black mb-3">
                  Доставка по всей России и СНГ
                </h2>
                
                <div className="space-y-3 delivery-section-content-mobile">
                  <p>
                    <strong>СДЭК</strong> — доставка до пункта выдачи или курьером.
                    Сроки и стоимость рассчитываются индивидуально при оформлении заказа через калькулятор СДЭК.
                  </p>
                  
                  <p>
                    <strong>Почта России</strong> — доставка до пункта выдачи или курьером.
                    Сроки и стоимость рассчитываются индивидуально при оформлении заказа через калькулятор Почта России.
                  </p>
                  
                  <p>
                    <strong>BoxBerry</strong> — доставка до пункта выдачи или курьером.
                    Сроки и стоимость рассчитываются индивидуально при оформлении заказа через калькулятор СДЭК.
                  </p>
                  
                  <p>
                    <strong>КАРГО</strong> — доставка в страны СНГ обговаривается и рассчитывается индивидуально с менеджером.
                  </p>
                </div>
              </div>

              {/* Дополнительная информация */}
              <div className="mb-6">
                <div className="delivery-section-content-mobile">
                  <p className="mb-3">
                    Сроки и стоимость курьерской доставки рассчитываются индивидуально. Сервис может быть изменен при недоступности доставки по указанному адресу.
                  </p>
                  
                  <ul className="space-y-2">
                    <li>• Срок доставки: 7-14 рабочих дней.</li>
                    <li>• После оформления заявки на индивидуальный заказ, персональный менеджер свяжется с Вами и подберет для Вас подходящий размер.</li>
                    <li>• Курьер уведомляет получателя о доставке за 30 минут до своего приезда.</li>
                    <li>• Электронный чек, подтверждающий покупку, Вы получите по электронной почте, указанной при оформлении заказа.</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default DeliveryPage;