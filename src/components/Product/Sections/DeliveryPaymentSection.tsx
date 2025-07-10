// src/components/Product/Sections/DeliveryPaymentSection.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface DeliveryPaymentSectionProps {
  className?: string;
}

const DeliveryPaymentSection: React.FC<DeliveryPaymentSectionProps> = ({ 
  className = '' 
}) => {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'delivery' | 'payment'>('delivery');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-full ${className}`}>
        <div className="animate-pulse">
          <div className="hidden lg:block space-y-8">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            </div>
          </div>
          <div className="block lg:hidden space-y-4">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-4/5"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Контент для доставки
  const deliveryContent = (
    <div className="delivery-content">
      <p className="delivery-intro">
        Мы бережем ваше время, и работаем надёжно, учитывая все ваши пожелания.
      </p>
      
      <div className="delivery-sections">
        <div>
          <h3 className="delivery-section-title">
            Самовывоз
          </h3>
          <p className="delivery-section-text">
            Для Владивостока – доступен самовывоз или доставка по городу. 
            <br/>При поступлении товара на склад, в личном кабинете будет обозначено, что товар готов к выдаче. 
            <br/>Поступление занимает от 4 до 14 рабочих дней. 
            <br/>Уточнить актуальную информацию можно у поддержки интернет-магазина.
          </p>
        </div>
        
        <div>
          <h3 className="delivery-section-title">
            Доставка по всей России и СНГ
          </h3>
          
          <div className="delivery-methods">
            <p className="delivery-method">
              <strong>СДЭК</strong> — доставка до пункта выдачи или курьером. 
              <br/>Сроки и стоимость рассчитываются индивидуально при оформлении заказа через калькулятор СДЭК.
            </p>
            
            <p className="delivery-method">
              <strong>Почта России</strong> — доставка до пункта выдачи или курьером. 
              <br/>Сроки и стоимость рассчитываются индивидуально при оформлении заказа через калькулятор Почта России.
            </p>
            
            <p className="delivery-method">
              <strong>BoxBerry</strong> — доставка до пункта выдачи или курьером. 
              <br/>Сроки и стоимость рассчитываются индивидуально при оформлении заказа через калькулятор СДЭК.
            </p>
            
            <p className="delivery-method">
              <strong>КАРГО</strong> — доставка в страны СНГ обговаривается и рассчитывается индивидуально с менеджером.
            </p>
          </div>
        </div>
        
        <div>
          <p className="delivery-section-text">
            Сроки и стоимость курьерской доставки рассчитываются индивидуально. Сервис может быть изменен при недоступности доставки по указанному адресу.
          </p>
          
          <ul className="delivery-list">
            <li className="delivery-list-item">
              Срок доставки: 7-14 рабочих дней.
            </li>
            <li className="delivery-list-item">
              После оформления заявки на индивидуальный заказ, персональный менеджер свяжется с Вами и подберет для Вас подходящий размер.
            </li>
            <li className="delivery-list-item">
              Курьер уведомляет получателя о доставке за 30 минут до своего приезда.
            </li>
            <li className="delivery-list-item">
              Электронный чек, подтверждающий покупку, Вы получите по электронной почте, указанной при оформлении заказа.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Контент для оплаты
  const paymentContent = (
    <div className="delivery-content">
      <div className="delivery-sections">
        <div>
          <h3 className="delivery-section-title">
            Какие способы оплаты возможны?
          </h3>
          <div className="delivery-section-text">
            <p className="mb-4">
              Мы принимаем оплату банковскими картами:
            </p>
            <ul className="payment-cards-list">
              <li>Visa, Mastercard, МИР.</li>
              <li>СБП и др.</li>
            </ul>
            <p className="mt-4">
              Кроме того, в городе Владивосток мы также принимаем платежи наличными, а также можем создать электронную ссылку для оплаты товаров под заказ.
            </p>
          </div>
        </div>
        
        <div>
          <h3 className="delivery-section-title">
            Нужно ли дополнительно оплачивать налоги и таможенные сборы?
          </h3>
          <p className="delivery-section-text">
            Нет, не нужно, все налоги и таможенные сборы уже включены в итоговую стоимость товаров в нашем магазине.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`w-full ${className}`}>
      {/* Desktop версия */}
      <div className="hidden lg:block">
        <div className="py-12">
          {/* Заголовки секций с кликабельностью */}
          <div className="flex items-center gap-16 mb-4">
            <button
              onClick={() => setActiveTab('delivery')}
              className="delivery-tab-title"
            >
              ДОСТАВКА
            </button>
            
            <button
              onClick={() => setActiveTab('payment')}
              className="delivery-tab-title"
            >
              ОПЛАТА
            </button>
          </div>

          {/* Подчеркивания заголовков - ближе к тексту */}
          <div className="flex gap-16 mb-8">
            <div className={`delivery-tab-underline delivery-tab-underline--delivery ${
              activeTab === 'delivery' ? 'bg-black' : 'bg-brand-light-beige'
            }`}></div>
            <div className={`delivery-tab-underline delivery-tab-underline--payment ${
              activeTab === 'payment' ? 'bg-black' : 'bg-brand-light-beige'
            }`}></div>
          </div>

          {/* Контент в зависимости от активной вкладки */}
          {activeTab === 'delivery' ? deliveryContent : paymentContent}
        </div>
      </div>

      {/* Mobile версия */}
      <div className="block lg:hidden">
        <div className="py-8">
          {/* Заголовки секций */}
          <div className="flex items-center gap-8 mb-3">
            <button
              onClick={() => setActiveTab('delivery')}
              className="delivery-tab-title--mobile"
            >
              ДОСТАВКА
            </button>
            
            <button
              onClick={() => setActiveTab('payment')}
              className="delivery-tab-title--mobile"
            >
              ОПЛАТА
            </button>
          </div>

          {/* Подчеркивания заголовков */}
          <div className="flex gap-8 mb-6">
            <div className={`delivery-tab-underline--mobile-delivery ${
              activeTab === 'delivery' ? 'bg-black' : 'bg-brand-light-beige'
            }`}></div>
            <div className={`delivery-tab-underline--mobile-payment ${
              activeTab === 'payment' ? 'bg-black' : 'bg-brand-light-beige'
            }`}></div>
          </div>

          {/* Мобильный контент */}
          <div className="delivery-content--mobile">
            {activeTab === 'delivery' ? (
              <div>
                <p className="delivery-intro--mobile">
                  Мы бережем ваше время, и работаем надёжно, учитывая все ваши пожелания.
                </p>
                
                <div className="delivery-sections--mobile">
                  <div>
                    <h3 className="delivery-section-title--mobile">Самовывоз</h3>
                    <p className="delivery-section-text--mobile">
                      Для Владивостока - доступен самовывоз или доставка по городу. При поступлении товара на склад, в личном кабинете будет обозначено, что товар готов к выдаче. Поступление занимает от 4 до 14 рабочих дней.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="delivery-section-title--mobile">Доставка по России и СНГ</h3>
                    
                    <div className="delivery-methods--mobile">
                      <p><strong>СДЭК</strong> — доставка до пункта выдачи или курьером.</p>
                      <p><strong>Почта России</strong> — доставка до пункта выдачи или курьером.</p>
                      <p><strong>BoxBerry</strong> — доставка до пункта выдачи или курьером.</p>
                      <p><strong>КАРГО</strong> — доставка в страны СНГ обговаривается индивидуально.</p>
                      <p>Срок доставки: 7-14 рабочих дней. Курьер уведомляет получателя за 30 минут до приезда.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="delivery-sections--mobile">
                  <div>
                    <h3 className="delivery-section-title--mobile">Какие способы оплаты возможны?</h3>
                    <div className="delivery-section-text--mobile">
                      <p className="mb-2">Мы принимаем оплату банковскими картами:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2 mb-2">
                        <li>Visa, Mastercard, МИР.</li>
                        <li>СБП и др.</li>
                      </ul>
                      <p>
                        Кроме того, в городе Владивосток мы также принимаем платежи наличными, а также можем создать электронную ссылку для оплаты товаров под заказ.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="delivery-section-title--mobile">Нужно ли дополнительно оплачивать налоги и таможенные сборы?</h3>
                    <p className="delivery-section-text--mobile">
                      Нет, не нужно, все налоги и таможенные сборы уже включены в итоговую стоимость товаров в нашем магазине.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPaymentSection;