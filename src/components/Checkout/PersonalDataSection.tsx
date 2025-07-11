'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CheckoutFormData } from '@/types/checkout';

interface PersonalDataSectionProps {
  form: UseFormReturn<CheckoutFormData>;
  isMobile?: boolean;
}

const PersonalDataSection: React.FC<PersonalDataSectionProps> = ({ form, isMobile = false }) => {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-6">
      {/* Заголовок секции */}
      <h2 className={isMobile ? 'checkout-section-title--mobile' : 'checkout-section-title'}>
        ЛИЧНЫЕ ДАННЫЕ
      </h2>

      {/* Поля ввода */}
      <div className="space-y-4">
        {/* Первая строка: Имя, фамилия + Телефон */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <input
              {...register('firstName')}
              placeholder="Имя, фамилия"
              className={`checkout-input ${isMobile ? 'checkout-input--mobile' : ''}`}
            />
            {errors.firstName && (
              <p className={`checkout-error ${isMobile ? 'checkout-error--mobile' : ''}`}>
                {errors.firstName.message}
              </p>
            )}
          </div>
          
          <div>
            <input
              {...register('phone')}
              placeholder="Телефон"
              className={`checkout-input ${isMobile ? 'checkout-input--mobile' : ''}`}
            />
            {errors.phone && (
              <p className={`checkout-error ${isMobile ? 'checkout-error--mobile' : ''}`}>
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>

        {/* Вторая строка: E-mail (на всю ширину) */}
        <div>
          <input
            {...register('email')}
            type="email"
            placeholder="E-mail"
            className={`checkout-input ${isMobile ? 'checkout-input--mobile' : ''}`}
          />
          {errors.email && (
            <p className={`checkout-error ${isMobile ? 'checkout-error--mobile' : ''}`}>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Третья строка: Город (на всю ширину) */}
        <div>
          <input
            {...register('city')}
            placeholder="Город"
            className={`checkout-input ${isMobile ? 'checkout-input--mobile' : ''}`}
          />
          {errors.city && (
            <p className={`checkout-error ${isMobile ? 'checkout-error--mobile' : ''}`}>
              {errors.city.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalDataSection;