'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';

interface DeliveryOption {
  id: string;
  name: string;
  price: number;
  estimatedDays?: string;
  description?: string;
}

interface DeliverySectionProps {
  form: UseFormReturn<any>;
  isMobile?: boolean;
  deliveryOptions?: DeliveryOption[];
}

const DeliverySection: React.FC<DeliverySectionProps> = ({ 
  form, 
  isMobile = false, 
  deliveryOptions = [] 
}) => {
  const { register, watch, setValue } = form;
  
  const defaultOptions: DeliveryOption[] = [
    { id: 'store_pickup', name: 'Доставить в магазин TS', price: 0, estimatedDays: '5-7 дней' },
    { id: 'courier_ts', name: 'Доставка курьером TS', price: 0, estimatedDays: '5-7 дней' },
    { id: 'cdek_pickup', name: 'СДЭК - доставка до пункта выдачи', price: 300, estimatedDays: '3-5 дней' },
    { id: 'cdek_courier', name: 'СДЭК - доставка курьером', price: 500, estimatedDays: '3-5 дней' },
    { id: 'post_russia', name: 'Почта России', price: 250, estimatedDays: '7-14 дней' },
    { id: 'boxberry', name: 'BoxBerry', price: 350, estimatedDays: '4-6 дней' }
  ];

  const options = deliveryOptions && deliveryOptions.length > 0 ? deliveryOptions : defaultOptions;
  const selectedDelivery = watch('deliveryMethod');

  const handleDeliveryChange = (optionId: string) => {
    setValue('deliveryMethod', optionId, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      {/* Заголовок секции */}
      <h2 className={isMobile ? 'checkout-section-title--mobile' : 'checkout-section-title'}>
        СПОСОБ ДОСТАВКИ
      </h2>

      {/* Опции доставки */}
      <div className="checkout-checkbox-group">
        {options.map((option) => (
          <label 
            key={option.id} 
            className="checkout-checkbox-item"
            onClick={() => handleDeliveryChange(option.id)}
          >
            <input
              type="radio"
              {...register('deliveryMethod')}
              value={option.id}
              className="sr-only"
              onChange={() => handleDeliveryChange(option.id)}
            />
            <div 
              className={`checkout-checkbox ${selectedDelivery === option.id ? 'checkout-checkbox--checked' : ''}`} 
            />
            <span className={`checkout-checkbox-label ${isMobile ? 'checkout-checkbox-label--mobile' : ''}`}>
              {option.name}
              {option.price > 0 && ` (+${option.price.toLocaleString('ru-RU')} ₽)`}
              {option.estimatedDays && ` • ${option.estimatedDays}`}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default DeliverySection;