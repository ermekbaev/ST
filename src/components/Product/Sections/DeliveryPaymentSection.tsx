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
        {/* НЕ применяем отступы в loading состоянии - они уже есть на уровне страницы */}
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
      {/* НЕ применяем отступы здесь, так как они уже есть на уровне страницы продукта */}
      
      {/* Desktop версия */}
      <div className="hidden lg:block">
        <div className="py-12">
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
            className="text-black"
            style={{
              fontFamily: 'Random Grotesque, Arial, sans-serif',
              fontWeight: 900,
              fontStyle: 'italic'
            }}
          >
            <p 
              className="mb-8"
              style={{
                fontSize: '30px',
                lineHeight: '35px'
              }}
            >
              Мы бережем ваше время, и работаем надёжно, учитывая все ваши пожелания.
            </p>
            
            <div className="space-y-8">
              <div>
                <h3 
                  className="font-bold mb-4"
                  style={{
                    fontSize: '30px',
                    lineHeight: '35px'
                  }}
                >
                  Самовывоз
                </h3>
                <p
                  style={{
                    fontSize: '20px',
                    lineHeight: '27px',
                    fontWeight: 400,
                    fontStyle: 'normal'
                  }}
                >
                  Для Владивостока – доступен самовывоз или доставка по городу. 
                  <br/>При поступлении товара на склад, в личном кабинете будет обозначено, что товар готов к выдаче. 
                  <br/>Поступление занимает от 4 до 14 рабочих дней. 
                  <br/>Уточнить актуальную информацию можно у поддержки интернет-магазина.
                </p>
              </div>
              
              <div>
                <h3 
                  className="font-bold mb-4"
                  style={{
                    fontSize: '30px',
                    lineHeight: '35px'
                  }}
                >
                  Доставка по всей России и СНГ
                </h3>
                
                <div className="space-y-4">
                  <p
                    style={{
                      fontSize: '20px',
                      lineHeight: '27px',
                      fontWeight: 400,
                      fontStyle: 'normal'
                    }}
                  >
                    <strong>СДЭК</strong> — доставка до пункта выдачи или курьером. 
                    <br/>Сроки и стоимость рассчитываются индивидуально при оформлении заказа через калькулятор СДЭК.
                  </p>
                  
                  <p
                    style={{
                      fontSize: '20px',
                      lineHeight: '27px',
                      fontWeight: 400,
                      fontStyle: 'normal'
                    }}
                  >
                    <strong>Почта России</strong> — доставка до пункта выдачи или курьером. 
                    <br/>Сроки и стоимость рассчитываются индивидуально при оформлении заказа через калькулятор Почта России.
                  </p>
                  
                  <p
                    style={{
                      fontSize: '20px',
                      lineHeight: '27px',
                      fontWeight: 400,
                      fontStyle: 'normal'
                    }}
                  >
                    <strong>BoxBerry</strong> — доставка до пункта выдачи или курьером. 
                    <br/>Сроки и стоимость рассчитываются индивидуально при оформлении заказа через калькулятор СДЭК.
                  </p>
                  
                  <p
                    style={{
                      fontSize: '20px',
                      lineHeight: '27px',
                      fontWeight: 400,
                      fontStyle: 'normal'
                    }}
                  >
                    <strong>КАРГО</strong> — доставка в страны СНГ обговаривается и рассчитывается индивидуально с менеджером.
                  </p>
                </div>
              </div>
              
              <div>
                <p
                  style={{
                    fontSize: '20px',
                    lineHeight: '27px',
                    fontWeight: 400,
                    fontStyle: 'normal'
                  }}
                >
                  Сроки и стоимость курьерской доставки рассчитываются индивидуально. Сервис может быть изменен при недоступности доставки по указанному адресу.
                </p>
                
                {/* Маркированный список */}
                <ul className="mt-4 space-y-2 list-disc list-inside">
                  <li
                    style={{
                      fontSize: '20px',
                      lineHeight: '27px',
                      fontWeight: 400,
                      fontStyle: 'normal'
                    }}
                  >
                    Срок доставки: 7-14 рабочих дней.
                  </li>
                  <li
                    style={{
                      fontSize: '20px',
                      lineHeight: '27px',
                      fontWeight: 400,
                      fontStyle: 'normal'
                    }}
                  >
                    После оформления заявки на индивидуальный заказ, персональный менеджер свяжется с Вами и подберет для Вас подходящий размер.
                  </li>
                  <li
                    style={{
                      fontSize: '20px',
                      lineHeight: '27px',
                      fontWeight: 400,
                      fontStyle: 'normal'
                    }}
                  >
                    Курьер уведомляет получателя о доставке за 30 минут до своего приезда.
                  </li>
                  <li
                    style={{
                      fontSize: '20px',
                      lineHeight: '27px',
                      fontWeight: 400,
                      fontStyle: 'normal'
                    }}
                  >
                    Электронный чек, подтверждающий покупку, Вы получите по электронной почте, указанной при оформлении заказа.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile версия */}
      <div className="block lg:hidden">
        <div className="py-8">
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
  );}

export default DeliveryPaymentSection;