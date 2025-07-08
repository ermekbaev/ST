// src/components/Sections/DeliveryPaymentSection.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface DeliveryPaymentSectionProps {
  className?: string;
}

const DeliveryPaymentSection: React.FC<DeliveryPaymentSectionProps> = ({ 
  className = '' 
}) => {
  const [mounted, setMounted] = useState(false);

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

  return (
    <div className={`w-full ${className}`}>
      {/* Desktop версия */}
      <div className="hidden lg:block">
        <div className="max-w-6xl mx-auto px-8 py-12">
          {/* Разделительная линия */}
          <div className="w-full h-0.5 bg-black mb-12"></div>
          
          {/* Заголовки секций */}
          <div className="flex items-center gap-16 mb-8">
            <h2 
              className="text-black"
              style={{
                fontFamily: 'Random Grotesque, Arial, sans-serif',
                fontWeight: 900,
                fontStyle: 'italic',
                fontSize: '30px',
                lineHeight: '45px'
              }}
            >
              ДОСТАВКА
            </h2>
            
            <h2 
              className="text-black"
              style={{
                fontFamily: 'Random Grotesque, Arial, sans-serif',
                fontWeight: 900,
                fontStyle: 'italic',
                fontSize: '30px',
                lineHeight: '45px'
              }}
            >
              ОПЛАТА
            </h2>
          </div>

          {/* Подчеркивания заголовков */}
          <div className="flex gap-16 mb-12">
            <div className="w-44 h-0.5 bg-black"></div>
            <div className="w-32 h-0.5 bg-[#BFB3A3]"></div>
          </div>

          {/* Основной текст */}
          <div 
            className="text-black leading-relaxed"
            style={{
              fontFamily: 'Random Grotesque, Arial, sans-serif',
              fontWeight: 900,
              fontStyle: 'italic',
              fontSize: '30px',
              lineHeight: '35px'
            }}
          >
            <p className="mb-6">
              Мы бережем ваше время, и работаем надёжно, учитывая все ваши пожелания.
            </p>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-bold mb-2">Самовывоз</h3>
                <p>
                  Для Владивостока - доступен самовывоз или доставка по городу. При поступлении товара на склад, в личном кабинете будет обозначено, что товар готов к выдаче. Поступление занимает от 4 до 14 рабочих дней. Уточнить актуальную информацию можно у поддержки интернет-магазина.
                </p>
              </div>
              
              <div>
                <h3 className="font-bold mb-2">Доставка по всей России и СНГ</h3>
                
                <div className="space-y-4">
                  <p>
                    <strong>СДЭК</strong> — доставка до пункта выдачи или курьером. Сроки и стоимость рассчитываются индивидуально при оформлении заказа через калькулятор СДЭК.
                  </p>
                  
                  <p>
                    <strong>Почта России</strong> — доставка до пункта выдачи или курьером. Сроки и стоимость рассчитываются индивидуально при оформлении заказа через калькулятор Почта России.
                  </p>
                  
                  <p>
                    <strong>BoxBerry</strong> — доставка до пункта выдачи или курьером. Сроки и стоимость рассчитываются индивидуально при оформлении заказа через калькулятор СДЭК.
                  </p>
                  
                  <p>
                    <strong>КАРГО</strong> — доставка в страны СНГ обговаривается и рассчитывается индивидуально с менеджером.
                  </p>
                </div>
              </div>
              
              <div>
                <p>
                  Сроки и стоимость курьерской доставки рассчитываются индивидуально. Сервис может быть изменен при недоступности доставки по указанному адресу. Срок доставки: 7-14 рабочих дней.
                </p>
              </div>
              
              <div>
                <p>
                  После оформления заявки на индивидуальный заказ, персональный менеджер свяжется с Вами и подберет для Вас подходящий размер. Курьер уведомляет получателя о доставке за 30 минут до своего приезда. Электронный чек, подтверждающий покупку, Вы получите по электронной почте, указанной при оформлении заказа.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile версия */}
      <div className="block lg:hidden">
        <div className="px-5 py-8">
          {/* Разделительная линия */}
          <div className="w-full h-0.5 bg-black mb-8"></div>
          
          {/* Заголовки секций */}
          <div className="flex items-center gap-8 mb-6">
            <h2 
              className="text-black"
              style={{
                fontFamily: 'Random Grotesque, Arial, sans-serif',
                fontWeight: 900,
                fontStyle: 'italic',
                fontSize: '20px',
                lineHeight: '30px'
              }}
            >
              ДОСТАВКА
            </h2>
            
            <h2 
              className="text-black"
              style={{
                fontFamily: 'Random Grotesque, Arial, sans-serif',
                fontWeight: 900,
                fontStyle: 'italic',
                fontSize: '20px',
                lineHeight: '30px'
              }}
            >
              ОПЛАТА
            </h2>
          </div>

          {/* Подчеркивания заголовков */}
          <div className="flex gap-8 mb-8">
            <div className="w-32 h-0.5 bg-black"></div>
            <div className="w-24 h-0.5 bg-[#BFB3A3]"></div>
          </div>

          {/* Основной текст */}
          <div 
            className="text-black leading-tight"
            style={{
              fontFamily: 'Random Grotesque, Arial, sans-serif',
              fontWeight: 900,
              fontStyle: 'italic',
              fontSize: '20px',
              lineHeight: '20px'
            }}
          >
            <p className="mb-4">
              Мы бережем ваше время, и работаем надёжно, учитывая все ваши пожелания.
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-bold mb-2">Самовывоз</h3>
                <p className="text-sm leading-snug">
                  Для Владивостока - доступен самовывоз или доставка по городу. При поступлении товара на склад, в личном кабинете будет обозначено, что товар готов к выдаче. Поступление занимает от 4 до 14 рабочих дней.
                </p>
              </div>
              
              <div>
                <h3 className="font-bold mb-2">Доставка по России и СНГ</h3>
                
                <div className="space-y-3 text-sm leading-snug">
                  <p>
                    <strong>СДЭК</strong> — доставка до пункта выдачи или курьером.
                  </p>
                  
                  <p>
                    <strong>Почта России</strong> — доставка до пункта выдачи или курьером.
                  </p>
                  
                  <p>
                    <strong>BoxBerry</strong> — доставка до пункта выдачи или курьером.
                  </p>
                  
                  <p>
                    <strong>КАРГО</strong> — доставка в страны СНГ обговаривается индивидуально.
                  </p>
                  
                  <p>
                    Срок доставки: 7-14 рабочих дней. Курьер уведомляет получателя за 30 минут до приезда.
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

export default DeliveryPaymentSection;