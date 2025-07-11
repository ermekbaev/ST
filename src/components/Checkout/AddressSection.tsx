'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CheckoutFormData } from '@/types/checkout';

interface AddressSectionProps {
  form: UseFormReturn<CheckoutFormData>;
  isMobile?: boolean;
}

const AddressSection: React.FC<AddressSectionProps> = ({ form, isMobile = false }) => {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-6">
      {/* Заголовок секции */}
      <h2 className={isMobile ? 'checkout-section-title--mobile' : 'checkout-section-title'}>
        АДРЕС ДОСТАВКИ
      </h2>

      {/* Поля адреса */}
      <div className="space-y-4">
        {/* Первая строка: Адрес (на всю ширину) */}
        <div>
          <input
            {...register('address')}
            placeholder="Адрес"
            className={`checkout-input ${isMobile ? 'checkout-input--mobile' : ''}`}
          />
          {errors.address && (
            <p className={`checkout-error ${isMobile ? 'checkout-error--mobile' : ''}`}>
              {errors.address.message}
            </p>
          )}
        </div>

        {/* Вторая строка: Регион + Индекс */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <input
              {...register('region')}
              placeholder="Регион"
              className={`checkout-input ${isMobile ? 'checkout-input--mobile' : ''}`}
            />
            {errors.region && (
              <p className={`checkout-error ${isMobile ? 'checkout-error--mobile' : ''}`}>
                {errors.region.message}
              </p>
            )}
          </div>
          
          <div>
            <input
              {...register('postalCode')}
              placeholder="Индекс"
              className={`checkout-input ${isMobile ? 'checkout-input--mobile' : ''}`}
            />
            {errors.postalCode && (
              <p className={`checkout-error ${isMobile ? 'checkout-error--mobile' : ''}`}>
                {errors.postalCode.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressSection;