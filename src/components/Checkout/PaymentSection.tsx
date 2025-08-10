// src/components/Checkout/PaymentSection.tsx - БЕЗ ФОЛЛБЭКА
'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';

interface PaymentOption {
  id: string;
  name: string;
  description?: string;
}

interface PaymentSectionProps {
  form: UseFormReturn<any>;
  isMobile?: boolean;
  paymentOptions?: PaymentOption[];
}

const PaymentSection: React.FC<PaymentSectionProps> = ({ 
  form, 
  isMobile = false, 
  paymentOptions = [] 
}) => {
  const { register, watch, setValue } = form;
  
  // 🔥 УБРАЛИ ФОЛЛБЭК - используем только данные из API
  const options = paymentOptions;
  const selectedPayment = watch('paymentMethod');

  const handlePaymentChange = (optionId: string) => {
    setValue('paymentMethod', optionId, { shouldValidate: true });
  };

  // Если нет опций - показываем загрузку
  if (!options || options.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className={isMobile ? 'checkout-section-title--mobile' : 'checkout-section-title'}>
          СПОСОБ ОПЛАТЫ
        </h2>
        <div className="text-center py-4">
          <p className="text-gray-500">Загружаем способы оплаты...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок секции */}
      <h2 className={isMobile ? 'checkout-section-title--mobile' : 'checkout-section-title'}>
        СПОСОБ ОПЛАТЫ
      </h2>

      {/* Опции оплаты */}
      <div className="checkout-checkbox-group">
        {options.map((option) => (
          <label 
            key={option.id} 
            className="checkout-checkbox-item"
            onClick={() => handlePaymentChange(option.id)}
          >
            <input
              type="radio"
              {...register('paymentMethod')}
              value={option.id}
              className="sr-only"
              onChange={() => handlePaymentChange(option.id)}
            />
            <div 
              className={`checkout-checkbox ${selectedPayment === option.id ? 'checkout-checkbox--checked' : ''}`} 
            />
            <span className={`checkout-checkbox-label ${isMobile ? 'checkout-checkbox-label--mobile' : ''}`}>
              {option.name}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default PaymentSection;