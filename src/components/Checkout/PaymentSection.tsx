// src/components/Checkout/PaymentSection.tsx
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
  
  // Фоллбэк к стандартным опциям если не переданы или пустые
  const defaultOptions: PaymentOption[] = [
    { 
      id: 'card', 
      name: 'Оплата картой (МИР, VISA, MasterCard)',
      description: 'Онлайн оплата банковской картой'
    },
    { 
      id: 'cash_vladivostok', 
      name: 'Оплата наличными в городе Владивосток',
      description: 'Оплата наличными при получении'
    }
  ];

  // Используем API данные если есть, иначе фоллбэк
  const options = paymentOptions && paymentOptions.length > 0 ? paymentOptions : defaultOptions;
  const selectedPayment = watch('paymentMethod');

  const handlePaymentChange = (optionId: string) => {
    setValue('paymentMethod', optionId, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      {/* Заголовок секции */}
      <h2 className={isMobile ? 'checkout-section-title--mobile' : 'checkout-section-title'}>
        СПОСОБ ОПЛАТЫ
      </h2>

      {/* Отладочная информация (можно убрать в продакшене) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
          💳 Загружено способов оплаты: {options.length}
          {paymentOptions && paymentOptions.length > 0 ? ' (из API)' : ' (фоллбэк)'}
        </div>
      )}

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