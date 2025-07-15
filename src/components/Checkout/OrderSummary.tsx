// src/components/Checkout/OrderSummary.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateOrderNumber } from '@/utils/orderUtils';

interface OrderSummaryProps {
  checkout: any; // Данные из useCheckout с API
  isMobile?: boolean;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ checkout, isMobile = false }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Получаем данные из checkout
  const { 
    items = [], 
    total = 0, 
    subtotal = 0, 
    deliveryFee = 0,
    promoCodes = [],
    generalSettings = {}
  } = checkout || {};

  // Функция обработки оформления заказа
  const handleSubmitOrder = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    try {
      setIsSubmitting(true);
      
      console.log('🚀 Оформляем заказ...');
      
      // Имитируем небольшую задержку для UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Генерируем номер заказа
      const orderNumber = generateOrderNumber();
      
      console.log('✅ Заказ оформлен:', orderNumber);
      
      // Сохраняем базовую информацию о заказе для страницы успеха
      const orderData = {
        orderNumber,
        total,
        subtotal,
        deliveryFee,
        items: items.map((item: any) => ({
          id: item.id,
          name: item.name,
          brand: item.brand,
          size: item.size,
          price: item.price,
          quantity: item.quantity
        })),
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('lastOrder', JSON.stringify(orderData));
      
      // Переходим на страницу успеха
      router.push(`/order-success?order=${orderNumber}`);
      
    } catch (error) {
      console.error('❌ Ошибка оформления заказа:', error);
      alert('Произошла ошибка. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${isMobile ? 'checkout-summary-mobile' : 'checkout-summary'}`}>
      {/* Заголовок сводки заказа */}
      <h2 className={isMobile ? 'checkout-section-title--mobile mb-6' : 'checkout-section-title mb-8'}>
        СВОДКА ЗАКАЗА
      </h2>

      {/* Список товаров */}
      <div className={`space-y-4 ${isMobile ? 'mb-6' : 'mb-8'}`}>
        {items.map((item: any) => (
          <div key={`${item.id}-${item.size}`} className={isMobile ? 'checkout-order-item--mobile' : 'checkout-order-item'}>
            {/* Изображение товара */}
            <div className={isMobile ? 'checkout-order-item-image--mobile' : 'w-20 h-20 bg-gray-200 rounded flex-shrink-0'}>
              {item.image ? (
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                  Фото
                </div>
              )}
            </div>
            
            {/* Информация о товаре */}
            <div className={isMobile ? 'checkout-order-item-info--mobile' : 'flex-1 min-w-0'}>
              <h3 className={isMobile ? 'checkout-order-item-name--mobile' : 'font-medium text-sm mb-1'}>
                {item.brand} {item.name}
              </h3>
              <p className={isMobile ? 'checkout-order-item-size--mobile' : 'text-sm text-gray-600 mb-2'}>
                Размер: {item.size}
              </p>
              
              {/* Количество и цена */}
              <div className="flex items-center justify-between">
                <div className={isMobile ? 'checkout-quantity-controls--mobile' : 'flex items-center gap-3 bg-gray-100 px-3 py-1 rounded'}>
                  <button 
                    type="button"
                    className={isMobile ? 'checkout-quantity-btn--mobile' : 'checkout-quantity-btn'}
                    onClick={() => {/* логика уменьшения количества */}}
                  >
                    −
                  </button>
                  <span className={isMobile ? 'checkout-quantity-number--mobile' : 'checkout-quantity-number'}>
                    {item.quantity}
                  </span>
                  <button 
                    type="button"
                    className={isMobile ? 'checkout-quantity-btn--mobile' : 'checkout-quantity-btn'}
                    onClick={() => {/* логика увеличения количества */}}
                  >
                    +
                  </button>
                </div>
                <span className={isMobile ? 'checkout-order-item-price--mobile' : 'font-medium'}>
                  {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Промокод */}
      <div className={`checkout-promo-container ${isMobile ? 'mb-6' : 'mb-8'}`}>
        <input 
          type="text" 
          placeholder="Промокод"
          className={`checkout-promo-input ${isMobile ? 'checkout-promo-input--mobile' : ''}`}
        />
        <button 
          type="button"
          className={`checkout-promo-btn ${isMobile ? 'checkout-promo-btn--mobile' : ''}`}
        >
          Применить
        </button>
      </div>

      {/* Сводка по стоимости */}
      <div className={`space-y-3 ${isMobile ? 'mb-6' : 'mb-8'} pb-6 border-b border-gray-200`}>
        {/* Стоимость товаров */}
        <div className="flex justify-between items-center">
          <span className={isMobile ? 'text-sm' : 'text-base'}>Товары ({items.length})</span>
          <span className={isMobile ? 'text-sm font-medium' : 'text-base font-medium'}>
            {subtotal.toLocaleString('ru-RU')} ₽
          </span>
        </div>
        
        {/* Доставка */}
        <div className="flex justify-between items-center">
          <span className={isMobile ? 'text-sm' : 'text-base'}>Доставка</span>
          <span className={isMobile ? 'text-sm font-medium' : 'text-base font-medium'}>
            {deliveryFee === 0 ? 'Бесплатно' : `${deliveryFee.toLocaleString('ru-RU')} ₽`}
          </span>
        </div>
        
        {/* Итого */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
          <span className={`checkout-summary-total ${isMobile ? 'text-[18px]' : ''}`}>
            <span>ИТОГО</span>
          </span>
          <span className={`checkout-summary-total ${isMobile ? 'text-[18px]' : ''}`}>
            <span>{total.toLocaleString('ru-RU')} ₽</span>
          </span>
        </div>
      </div>

      {/* Кнопка оформления заказа - только на мобиле */}
      {isMobile && (
        <button
          type="button"
          onClick={handleSubmitOrder}
          disabled={isSubmitting}
          className="w-full bg-black text-white py-4 text-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'ОФОРМЛЯЕМ ЗАКАЗ...' : 'ОФОРМИТЬ ЗАКАЗ'}
        </button>
      )}

      {/* Согласие с условиями - на мобиле после кнопки */}
      {isMobile && (
        <div className="text-sm text-gray-600 leading-5 mt-4">
          Оформляя заказ, Вы подтверждаете согласие с{' '}
          <a href="/terms" className="underline hover:no-underline">
            Пользовательским соглашением
          </a>
          ,{' '}
          <a href="/privacy" className="underline hover:no-underline">
            Политикой конфиденциальности
          </a>{' '}
          и{' '}
          <a href="/offer" className="underline hover:no-underline">
            Договором оферты
          </a>
          .
        </div>
      )}

      {/* Кнопка оформления заказа - только на десктопе */}
      {!isMobile && (
        <button
          type="button"
          onClick={handleSubmitOrder}
          disabled={isSubmitting}
          className="checkout-order-btn"
        >
          {isSubmitting ? 'ОФОРМЛЯЕМ ЗАКАЗ...' : 'ОФОРМИТЬ ЗАКАЗ'}
        </button>
      )}

      {/* Согласие с условиями - только на десктопе и в самом низу */}
      {!isMobile && (
        <div className="checkout-terms-text mt-6">
          Оформляя заказ, Вы подтверждаете согласие с{' '}
          <a href="/terms" className="underline hover:no-underline">
            Пользовательским соглашением
          </a>
          ,{' '}
          <a href="/privacy" className="underline hover:no-underline">
            Политикой конфиденциальности
          </a>{' '}
          и{' '}
          <a href="/offer" className="underline hover:no-underline">
            Договором оферты
          </a>
          .
        </div>
      )}
    </div>
  );
};

export default OrderSummary;