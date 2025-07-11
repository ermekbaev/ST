'use client';

import React, { useState } from 'react';
import OrderItem from './OrderItem';
import PromoCode from './PromoCode';

interface OrderSummaryProps {
  checkout: any; // Заменим на правильный тип
  isMobile?: boolean;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ checkout, isMobile = false }) => {
  const { 
    items, 
    subtotal, 
    deliveryPrice, 
    promoDiscount, 
    total, 
    form,
    isSubmitting,
    applyPromoCode 
  } = checkout;

  return (
    <div className="space-y-6">
      {/* Срок доставки */}
      <div className="text-[17px] leading-[23px] font-normal text-black">
        Ориентировочный срок доставки по этим товарам: 16-21 дней
      </div>

      {/* Список товаров */}
      <div className="space-y-4">
        {items.map((item: any) => (
          <OrderItem key={item.article} item={item} />
        ))}
      </div>

      {/* Промокод */}
      <PromoCode onApply={applyPromoCode} />

      {/* Расчет стоимости */}
      <div className="space-y-3 pt-4">
        <div className="flex justify-between text-[20px] leading-[27px] text-[#595047]">
          <span>Общая стоимость</span>
          <span>{subtotal.toLocaleString('ru-RU')} ₽</span>
        </div>
        
        <div className="flex justify-between text-[20px] leading-[27px] text-[#595047]">
          <span>Доставка</span>
          <span>{deliveryPrice.toLocaleString('ru-RU')} ₽</span>
        </div>

        {promoDiscount > 0 && (
          <div className="flex justify-between text-[20px] leading-[27px] text-green-600">
            <span>Скидка</span>
            <span>-{promoDiscount.toLocaleString('ru-RU')} ₽</span>
          </div>
        )}

        <div className="border-t border-gray-300 pt-3">
          <div className="flex justify-between checkout-summary-total">
            <span>ИТОГО</span>
            <span>{total.toLocaleString('ru-RU')} ₽</span>
          </div>
        </div>
      </div>

      {/* Кнопка оформления заказа - только на десктопе */}
      {!isMobile && (
        <>
          <button
            type="submit"
            form="checkout-form"
            disabled={isSubmitting}
            className="checkout-order-btn"
          >
            {isSubmitting ? 'ОФОРМЛЯЕМ ЗАКАЗ...' : 'ОФОРМИТЬ ЗАКАЗ'}
          </button>

          {/* Согласие с условиями */}
          <div className="checkout-terms-text">
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
        </>
      )}
    </div>
  );
};

export default OrderSummary;