// ============================================================================
// ИЗОЛИРОВАННАЯ ФОРМА ЧЕКАУТА БЕЗ КОНФЛИКТОВ
// ============================================================================

// src/components/Checkout/IsolatedCheckoutForm.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  region: string;
  city: string;
  address: string;
  postalCode: string;
  recipientFirstName: string;
  recipientLastName: string;
  recipientPhone: string;
  deliveryMethod: string;
  paymentMethod: string;
}

interface IsolatedCheckoutFormProps {
  onSubmit: (data: FormData) => void;
  isMobile?: boolean;
}

const IsolatedCheckoutForm: React.FC<IsolatedCheckoutFormProps> = ({ 
  onSubmit, 
  isMobile = false 
}) => {
  const [submitting, setSubmitting] = useState(false);
  
  // ✅ ИЗОЛИРОВАННАЯ ФОРМА - НЕ ЗАВИСИТ ОТ ВНЕШНИХ ХУКОВ
  const form = useForm<FormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      region: '',
      city: '',
      address: '',
      postalCode: '',
      recipientFirstName: '',
      recipientLastName: '',
      recipientPhone: '',
      deliveryMethod: 'store_pickup',
      paymentMethod: 'card',
    },
    mode: 'onChange'
  });

  const { register, watch, setValue, handleSubmit, formState: { errors } } = form;

  // ✅ ПРОСТЫЕ ОБРАБОТЧИКИ БЕЗ ЛИШНЕЙ ЛОГИКИ
  const handleDeliveryChange = useCallback((optionId: string) => {
    setValue('deliveryMethod', optionId);
  }, [setValue]);

  const handlePaymentChange = useCallback((optionId: string) => {
    setValue('paymentMethod', optionId);
  }, [setValue]);

  // ✅ ОБРАБОТЧИК ОТПРАВКИ
  const onFormSubmit = useCallback(async (data: FormData) => {
    setSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setSubmitting(false);
    }
  }, [onSubmit]);

  const selectedDelivery = watch('deliveryMethod');
  const selectedPayment = watch('paymentMethod');

  // Опции доставки и оплаты
  const deliveryOptions = [
    { id: 'store_pickup', name: 'Доставить в магазин TS', price: 0 },
    { id: 'courier_ts', name: 'Доставка курьером TS', price: 0 },
    { id: 'cdek_pickup', name: 'СДЭК - доставка до пункта выдачи', price: 300 },
    { id: 'cdek_courier', name: 'СДЭК - доставка курьером', price: 500 }
  ];

  const paymentOptions = [
    { id: 'card', name: 'Оплата картой (МИР, VISA, MasterCard)' },
    { id: 'cash_vladivostok', name: 'Оплата наличными в городе Владивосток' }
  ];

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      
      {/* ========== ЛИЧНЫЕ ДАННЫЕ ========== */}
      <div className="space-y-6">
        <h2 className={isMobile ? 'checkout-section-title--mobile' : 'checkout-section-title'}>
          ЛИЧНЫЕ ДАННЫЕ
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <input
                {...register('firstName', { required: 'Введите имя' })}
                placeholder="Имя, фамилия"
                className={`checkout-input ${isMobile ? 'checkout-input--mobile' : ''}`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
              )}
            </div>
            
            <div>
              <input
                {...register('phone', { required: 'Введите телефон' })}
                placeholder="Телефон"
                className={`checkout-input ${isMobile ? 'checkout-input--mobile' : ''}`}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div>
            <input
              {...register('email', { required: 'Введите email' })}
              type="email"
              placeholder="E-mail"
              className={`checkout-input ${isMobile ? 'checkout-input--mobile' : ''}`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <input
              {...register('city', { required: 'Введите город' })}
              placeholder="Город"
              className={`checkout-input ${isMobile ? 'checkout-input--mobile' : ''}`}
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* ========== СПОСОБ ДОСТАВКИ ========== */}
      <div className="space-y-6">
        <h2 className={isMobile ? 'checkout-section-title--mobile' : 'checkout-section-title'}>
          СПОСОБ ДОСТАВКИ
        </h2>

        <div className="space-y-3">
          {deliveryOptions.map((option) => (
            <div 
              key={option.id}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleDeliveryChange(option.id)}
            >
              {/* Кастомный радиобаттон */}
              <div className={`w-5 h-5 border-2 border-gray-400 rounded-full flex items-center justify-center ${
                selectedDelivery === option.id ? 'bg-blue-500 border-blue-500' : 'bg-white'
              }`}>
                {selectedDelivery === option.id && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
              
              {/* Скрытый input для формы */}
              <input
                type="radio"
                {...register('deliveryMethod')}
                value={option.id}
                className="sr-only"
                tabIndex={-1}
              />
              
              <span className="flex-1 text-gray-800">
                {option.name}
                {option.price > 0 && ` (+${option.price} ₽)`}
              </span>
              
              {selectedDelivery === option.id && (
                <span className="text-green-600 text-sm font-medium">✓</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ========== АДРЕС ДОСТАВКИ ========== */}
      <div className="space-y-6">
        <h2 className={isMobile ? 'checkout-section-title--mobile' : 'checkout-section-title'}>
          АДРЕС ДОСТАВКИ
        </h2>

        <div className="space-y-4">
          <div>
            <input
              {...register('address', { required: 'Введите адрес' })}
              placeholder="Адрес"
              className={`checkout-input ${isMobile ? 'checkout-input--mobile' : ''}`}
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <input
                {...register('region')}
                placeholder="Регион"
                className={`checkout-input ${isMobile ? 'checkout-input--mobile' : ''}`}
              />
            </div>
            
            <div>
              <input
                {...register('postalCode')}
                placeholder="Индекс"
                className={`checkout-input ${isMobile ? 'checkout-input--mobile' : ''}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========== ПОЛУЧАТЕЛЬ ========== */}
      <div className="space-y-6">
        <h2 className={isMobile ? 'checkout-section-title--mobile' : 'checkout-section-title'}>
          ПОЛУЧАТЕЛЬ
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <input
                {...register('recipientFirstName')}
                placeholder="Имя, фамилия"
                className={`checkout-input ${isMobile ? 'checkout-input--mobile' : ''}`}
              />
            </div>
            
            <div>
              <input
                {...register('recipientPhone')}
                placeholder="Телефон"
                className={`checkout-input ${isMobile ? 'checkout-input--mobile' : ''}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========== СПОСОБ ОПЛАТЫ ========== */}
      <div className="space-y-6">
        <h2 className={isMobile ? 'checkout-section-title--mobile' : 'checkout-section-title'}>
          СПОСОБ ОПЛАТЫ
        </h2>

        <div className="space-y-3">
          {paymentOptions.map((option) => (
            <div 
              key={option.id}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handlePaymentChange(option.id)}
            >
              {/* Кастомный радиобаттон */}
              <div className={`w-5 h-5 border-2 border-gray-400 rounded-full flex items-center justify-center ${
                selectedPayment === option.id ? 'bg-blue-500 border-blue-500' : 'bg-white'
              }`}>
                {selectedPayment === option.id && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
              
              {/* Скрытый input для формы */}
              <input
                type="radio"
                {...register('paymentMethod')}
                value={option.id}
                className="sr-only"
                tabIndex={-1}
              />
              
              <span className="flex-1 text-gray-800">
                {option.name}
              </span>
              
              {selectedPayment === option.id && (
                <span className="text-green-600 text-sm font-medium">✓</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ========== КНОПКА ОТПРАВКИ ========== */}
      <div className="pt-6">
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-black text-white py-4 px-6 text-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'ОФОРМЛЯЕМ ЗАКАЗ...' : 'ОФОРМИТЬ ЗАКАЗ'}
        </button>
      </div>

      {/* Согласие с условиями */}
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
    </form>
  );
};

export default IsolatedCheckoutForm;