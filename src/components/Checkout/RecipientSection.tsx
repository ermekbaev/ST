'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CheckoutFormData } from '@/types/checkout';

interface RecipientSectionProps {
  form: UseFormReturn<CheckoutFormData>;
  isMobile?: boolean;
}

const RecipientSection: React.FC<RecipientSectionProps> = ({ form, isMobile = false }) => {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-6">
      {/* Заголовок секции */}
      <h2 className={isMobile ? 'checkout-section-title--mobile' : 'checkout-section-title'}>
        ПОЛУЧАТЕЛЬ
      </h2>

      {/* Поля получателя */}
      <div className="space-y-4">
        {/* Первая строка: Имя, фамилия + Телефон */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <input
              {...register('recipientFirstName')}
              placeholder="Имя, фамилия"
              className={`checkout-input ${isMobile ? 'checkout-input--mobile' : ''}`}
            />
            {errors.recipientFirstName && (
              <p className={`checkout-error ${isMobile ? 'checkout-error--mobile' : ''}`}>
                {errors.recipientFirstName.message}
              </p>
            )}
          </div>
          
          <div>
            <input
              {...register('recipientPhone')}
              placeholder="Телефон"
              className={`checkout-input ${isMobile ? 'checkout-input--mobile' : ''}`}
            />
            {errors.recipientPhone && (
              <p className={`checkout-error ${isMobile ? 'checkout-error--mobile' : ''}`}>
                {errors.recipientPhone.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipientSection;
