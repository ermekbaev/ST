'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CheckoutFormData } from '@/types/checkout';
import { useDeliveryOptions } from '@/hooks/useDeliveryOptions';

interface DeliverySectionProps {
  form: UseFormReturn<CheckoutFormData>;
  isMobile?: boolean;
}

const DeliverySection: React.FC<DeliverySectionProps> = ({ form, isMobile = false }) => {
  const { register, watch } = form;
  const { deliveryOptions } = useDeliveryOptions();
  const selectedDelivery = watch('deliveryMethod');

  return (
    <div className="space-y-6">
      {/* Заголовок секции */}
      <h2 className={isMobile ? 'checkout-section-title--mobile' : 'checkout-section-title'}>
        СПОСОБ ДОСТАВКИ
      </h2>

      {/* Опции доставки */}
      <div className="checkout-checkbox-group">
        {deliveryOptions.map((option) => (
          <label key={option.id} className="checkout-checkbox-item">
            <input
              type="radio"
              {...register('deliveryMethod')}
              value={option.id}
              className="sr-only"
            />
            <div className={`checkout-checkbox ${selectedDelivery === option.id ? 'checkout-checkbox--checked' : ''}`} />
            <span className={`checkout-checkbox-label ${isMobile ? 'checkout-checkbox-label--mobile' : ''}`}>
              {option.name}
              {option.price > 0 && ` (+${option.price.toLocaleString('ru-RU')} ₽)`}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default DeliverySection;