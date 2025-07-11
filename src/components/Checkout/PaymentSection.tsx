'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CheckoutFormData } from '@/types/checkout';
import { useDeliveryOptions } from '@/hooks/useDeliveryOptions';

interface PaymentSectionProps {
  form: UseFormReturn<CheckoutFormData>;
  isMobile?: boolean;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({ form, isMobile = false }) => {
  const { register, watch } = form;
  const { paymentOptions } = useDeliveryOptions();
  const selectedPayment = watch('paymentMethod');

  return (
    <div className="space-y-6">
      {/* Заголовок секции */}
      <h2 className={isMobile ? 'checkout-section-title--mobile' : 'checkout-section-title'}>
        СПОСОБ ОПЛАТЫ
      </h2>

      {/* Опции оплаты */}
      <div className="checkout-checkbox-group">
        {paymentOptions.map((option) => (
          <label key={option.id} className="checkout-checkbox-item">
            <input
              type="radio"
              {...register('paymentMethod')}
              value={option.id}
              className="sr-only"
            />
            <div className={`checkout-checkbox ${selectedPayment === option.id ? 'checkout-checkbox--checked' : ''}`} />
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