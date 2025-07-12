'use client';

import React from 'react';
import PersonalDataSection from './PersonalDataSection';
import DeliverySection from './DeliverySection';
import AddressSection from './AddressSection';
import RecipientSection from './RecipientSection';
import PaymentSection from './PaymentSection';

interface CheckoutFormProps {
  checkout: any; // Заменим на правильный тип когда создадим хук
  isMobile?: boolean;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ checkout, isMobile = false }) => {
  const { form, submitOrder, isSubmitting } = checkout;

  return (
    <form 
        id={isMobile ? 'checkout-form-mobile' : 'checkout-form'}
        onSubmit={form.handleSubmit(submitOrder)} 
        className="space-y-8"
    >
      {/* Личные данные */}
      <PersonalDataSection form={form} isMobile={isMobile} />
      
      {/* Способ доставки */}
      <DeliverySection form={form} isMobile={isMobile} />
      
      {/* Адрес доставки */}
      <AddressSection form={form} isMobile={isMobile} />
      
      {/* Получатель */}
      <RecipientSection form={form} isMobile={isMobile} />
      
      {/* Способ оплаты */}
      <PaymentSection form={form} isMobile={isMobile} />

      {/* Согласие с условиями - только на мобиле, на десктопе в OrderSummary */}
      {isMobile && (
        <div className="text-sm text-gray-600 leading-5">
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

      {/* Кнопка оформления на мобиле */}
      {isMobile && (
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-black text-white py-4 text-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'ОФОРМЛЯЕМ ЗАКАЗ...' : 'ОФОРМИТЬ ЗАКАЗ'}
        </button>
      )}
    </form>
  );
};

export default CheckoutForm;