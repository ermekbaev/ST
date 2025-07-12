'use client';

import React from 'react';
import PersonalDataSection from './PersonalDataSection';
import DeliverySection from './DeliverySection';
import AddressSection from './AddressSection';
import RecipientSection from './RecipientSection';
import PaymentSection from './PaymentSection';

interface CheckoutFormProps {
  checkout: any; // Данные из useCheckout с API
  isMobile?: boolean;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ checkout, isMobile = false }) => {
  const { form, submitOrder, isSubmitting, deliveryOptions, paymentOptions } = checkout;

  return (
    <form onSubmit={form.handleSubmit(submitOrder)} className="space-y-8" id="checkout-form">
      {/* Личные данные */}
      <PersonalDataSection form={form} isMobile={isMobile} />
      
      {/* Способ доставки - ТЕПЕРЬ С ДАННЫМИ ИЗ API */}
      <DeliverySection 
        form={form} 
        isMobile={isMobile}
        deliveryOptions={deliveryOptions} // ✅ Передаем данные из API
      />
      
      {/* Адрес доставки */}
      <AddressSection form={form} isMobile={isMobile} />
      
      {/* Получатель */}
      <RecipientSection form={form} isMobile={isMobile} />
      
      {/* Способ оплаты - ТЕПЕРЬ С ДАННЫМИ ИЗ API */}
      <PaymentSection 
        form={form} 
        isMobile={isMobile}
        paymentOptions={paymentOptions} // ✅ Передаем данные из API
      />

      {/* Кнопка и согласие перенесены в OrderSummary для правильного порядка */}
    </form>
  );
};

export default CheckoutForm;