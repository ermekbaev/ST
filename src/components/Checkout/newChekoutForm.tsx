'use client';

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';

interface CheckoutFormData {
  firstName: string;
  email: string;
  phone: string;
  city: string;

  address: string;
  region: string;
  postalCode: string;

  recipientFirstName: string;
  recipientPhone: string;

  deliveryMethod: string;
  paymentMethod: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
}

interface NewCheckoutFormProps {
  cartItems: CartItem[];
  onSubmit: (data: CheckoutFormData) => void;
  selectedDelivery: string;
  selectedPayment: string;
  onDeliveryChange: (deliveryId: string) => void;
  onPaymentChange: (paymentId: string) => void;
  isMobile?: boolean;
  isProcessing?: boolean;
  getPromoData?: () => any;
}

// ============================================================================
// КОНСТАНТЫ ДАННЫХ
// ============================================================================

const DELIVERY_OPTIONS = [
  { id: 'store_pickup', name: 'Доставить в магазин TS', price: 0 },
  { id: 'courier_ts', name: 'Доставка курьером TS', price: 0 },
  { id: 'cdek_pickup', name: 'СДЭК - доставка до пункта выдачи', price: 300 },
  { id: 'cdek_courier', name: 'СДЭК - доставка курьером', price: 500 }
];

const PAYMENT_OPTIONS = [
  { id: 'card', name: 'Оплата картой (МИР, VISA, MasterCard)' },
  { id: 'cash_vladivostok', name: 'Оплата наличными в городе Владивосток' }
];

// ============================================================================
// ОСНОВНОЙ КОМПОНЕНТ - ТОЛЬКО ФОРМА
// ============================================================================

const NewCheckoutForm: React.FC<NewCheckoutFormProps> = ({ 
  cartItems, 
  onSubmit, 
  selectedDelivery,
  selectedPayment,
  onDeliveryChange,
  onPaymentChange,
  isMobile = false,
  isProcessing = false,
  getPromoData, // ✅ ДОБАВЛЕНО
}) => {
  // ============================================================================
  // СОСТОЯНИЕ И ФОРМА
  // ============================================================================
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CheckoutFormData>({
    defaultValues: {
      firstName: '',
      email: '',
      phone: '',
      city: '',
      address: '',
      region: '',
      postalCode: '',
      recipientFirstName: '',
      recipientPhone: '',
      deliveryMethod: 'store_pickup',
      paymentMethod: 'card'
    },
    mode: 'onChange'
  });

  const { register, watch, setValue, handleSubmit, formState: { errors } } = form;

  // ============================================================================
  // СИНХРОНИЗАЦИЯ С РОДИТЕЛЬСКИМ КОМПОНЕНТОМ
  // ============================================================================
  
  React.useEffect(() => {
    setValue('deliveryMethod', selectedDelivery);
    setValue('paymentMethod', selectedPayment);
  }, [selectedDelivery, selectedPayment, setValue]);

  // ============================================================================
  // ОТСЛЕЖИВАНИЕ ЗНАЧЕНИЙ
  // ============================================================================
  
  const watchedDelivery = watch('deliveryMethod');
  const watchedPayment = watch('paymentMethod');

  // ============================================================================
  // ОБРАБОТЧИКИ СОБЫТИЙ
  // ============================================================================
  
  const handleDeliveryChange = useCallback((deliveryId: string) => {
    setValue('deliveryMethod', deliveryId, { shouldValidate: true });
    onDeliveryChange(deliveryId); // ✅ Уведомляем родительский компонент
  }, [setValue, onDeliveryChange]);

  const handlePaymentChange = useCallback((paymentId: string) => {
    setValue('paymentMethod', paymentId, { shouldValidate: true });
    onPaymentChange(paymentId); // ✅ Уведомляем родительский компонент
  }, [setValue, onPaymentChange]);

  const onFormSubmit = useCallback(async (data: CheckoutFormData) => {
    if (isSubmitting || isProcessing) return;
    
    console.log('🚀 NewCheckoutForm (react-hook-form): Отправка заказа');
    console.log('📋 Данные формы:', data);
    console.log('📱 Мобильная версия:', isMobile);
    
    setIsSubmitting(true);
    try {
      let promoData = null;
      if (getPromoData) {
        try {
          promoData = getPromoData();
        } catch (error) {
          console.warn('⚠️ Ошибка получения промокодов:', error);
        }
      } else {
        console.warn('⚠️ getPromoData не передана в форму');
      }
      
      const completeOrderData = {
        ...data,
        ...(promoData && {
          total: promoData.total,
          subtotal: promoData.subtotal,
          deliveryPrice: promoData.deliveryPrice,
          promoDiscount: promoData.promoDiscount,
          appliedPromoCode: promoData.appliedPromoCode
        })
      };
      
      await onSubmit(completeOrderData);
      
    } catch (error) {
      console.error('❌ Ошибка отправки формы:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, isSubmitting, isProcessing, getPromoData, isMobile]);

  // ============================================================================
  // РЕНДЕР КОМПОНЕНТОВ
  // ============================================================================

  const renderInput = (
    name: keyof CheckoutFormData, 
    placeholder: string, 
    type: string = 'text'
  ) => (
    <div>
      <input
        {...register(name, {
          required: `${placeholder} обязательно для заполнения`,
        })}
        type={type}
        placeholder={placeholder}
        className={`checkout-input ${isMobile ? 'checkout-input--mobile' : ''}`}
      />
      {errors[name] && (
        <p className={`checkout-error ${isMobile ? 'checkout-error--mobile' : ''}`}>
          {errors[name]?.message}
        </p>
      )}
    </div>
  );

  const renderDeliveryOptions = () => (
    <div className="checkout-checkbox-group">
      {DELIVERY_OPTIONS.map((option) => (
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
            tabIndex={-1}
          />
          <div 
            className={`checkout-checkbox ${
              selectedDelivery === option.id ? 'checkout-checkbox--checked' : ''
            }`} 
          />
          <span className={`checkout-checkbox-label ${
            isMobile ? 'checkout-checkbox-label--mobile' : ''
          }`}>
            {option.name}
            {option.price > 0 && ` (+${option.price} ₽)`}
          </span>
        </label>
      ))}
    </div>
  );

  const renderPaymentOptions = () => (
    <div className="checkout-checkbox-group">
      {PAYMENT_OPTIONS.map((option) => (
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
            tabIndex={-1}
          />
          <div 
            className={`checkout-checkbox ${
              selectedPayment === option.id ? 'checkout-checkbox--checked' : ''
            }`} 
          />
          <span className={`checkout-checkbox-label ${
            isMobile ? 'checkout-checkbox-label--mobile' : ''
          }`}>
            {option.name}
          </span>
        </label>
      ))}
    </div>
  );

  // ============================================================================
  // ОСНОВНОЙ РЕНДЕР - ТОЛЬКО ФОРМА
  // ============================================================================

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8" id="checkout-form">
      
      {/* ЛИЧНЫЕ ДАННЫЕ - ТОЧНО КАК БЫЛО */}
      <div className="space-y-6">
        <h2 className={isMobile ? 'checkout-section-title--mobile' : 'checkout-section-title'}>
          ЛИЧНЫЕ ДАННЫЕ
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {renderInput('firstName', 'Имя, фамилия')}
            {renderInput('phone', 'Телефон', 'tel')}
          </div>
          {renderInput('email', 'E-mail', 'email')}
          {renderInput('city', 'Город')}
        </div>
      </div>

      {/* СПОСОБ ДОСТАВКИ - ТОЧНО КАК БЫЛО */}
      <div className="space-y-6">
        <h2 className={isMobile ? 'checkout-section-title--mobile' : 'checkout-section-title'}>
          СПОСОБ ДОСТАВКИ
        </h2>
        {renderDeliveryOptions()}
      </div>

      {/* АДРЕС ДОСТАВКИ - ТОЧНО КАК БЫЛО */}
      <div className="space-y-6">
        <h2 className={isMobile ? 'checkout-section-title--mobile' : 'checkout-section-title'}>
          АДРЕС ДОСТАВКИ
        </h2>
        <div className="space-y-4">
          {renderInput('address', 'Адрес')}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {renderInput('region', 'Регион')}
            {renderInput('postalCode', 'Индекс')}
          </div>
        </div>
      </div>

      {/* ПОЛУЧАТЕЛЬ - ТОЧНО КАК БЫЛО */}
      <div className="space-y-6">
        <h2 className={isMobile ? 'checkout-section-title--mobile' : 'checkout-section-title'}>
          ПОЛУЧАТЕЛЬ
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {renderInput('recipientFirstName', 'Имя, фамилия')}
          {renderInput('recipientPhone', 'Телефон', 'tel')}
        </div>
      </div>

      {/* СПОСОБ ОПЛАТЫ - ТОЧНО КАК БЫЛО */}
      <div className="space-y-6">
        <h2 className={isMobile ? 'checkout-section-title--mobile' : 'checkout-section-title'}>
          СПОСОБ ОПЛАТЫ
        </h2>
        {renderPaymentOptions()}
      </div>

      {/* ✅ КНОПКА ТОЛЬКО ДЛЯ МОБИЛЬНЫХ (теперь с промокодами!) */}
      {isMobile && (
        <div className="space-y-4">
          <button
            type="submit"
            disabled={isSubmitting || isProcessing}
            className="w-full bg-black text-white py-4 text-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || isProcessing ? 'ОФОРМЛЯЕМ ЗАКАЗ...' : 'ОФОРМИТЬ ЗАКАЗ'}
          </button>
          
          {/* Согласие с условиями */}
          <div className="checkout-terms-text--mobile">
            Оформляя заказ, Вы подтверждаете согласие с Пользовательским соглашением, Политикой конфиденциальности и Договором оферты.
          </div>
        </div>
      )}

    </form>
  );
};

export default NewCheckoutForm;