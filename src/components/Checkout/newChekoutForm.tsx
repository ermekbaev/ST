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
  isAuthenticated?: boolean;
  onAuthRequired?: () => void;
}

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


const NewCheckoutForm: React.FC<NewCheckoutFormProps> = ({
  cartItems,
  onSubmit,
  selectedDelivery,
  selectedPayment,
  onDeliveryChange,
  onPaymentChange,
  isMobile = false,
  isProcessing = false,
  getPromoData,
  isAuthenticated = false,
  onAuthRequired,
}) => {
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CheckoutFormData>({
    defaultValues: {
      firstName: '',
      email: '',
      phone: '+7',
      city: '',
      address: '',
      region: '',
      postalCode: '',
      recipientFirstName: '',
      recipientPhone: '+7',
      deliveryMethod: 'store_pickup',
      paymentMethod: 'card'
    },
    mode: 'onChange'
  });

  // Форматирование телефона в формат +7 XXX XXX-XX-XX
  const formatPhoneNumber = (digits: string): string => {
    let formatted = '+7';
    if (digits.length > 0) {
      formatted += ' ' + digits.slice(0, 3);
    }
    if (digits.length > 3) {
      formatted += ' ' + digits.slice(3, 6);
    }
    if (digits.length > 6) {
      formatted += '-' + digits.slice(6, 8);
    }
    if (digits.length > 8) {
      formatted += '-' + digits.slice(8, 10);
    }
    return formatted;
  };

  // Обработчик для полей телефона - форматирует в +7 XXX XXX-XX-XX
  const handlePhoneChange = (fieldName: 'phone' | 'recipientPhone') => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Извлекаем только цифры (убираем +7, пробелы, дефисы)
    let digits = value.replace(/\D/g, '');

    // Убираем лидирующую 7 или 8 если есть
    if (digits.startsWith('7')) {
      digits = digits.slice(1);
    } else if (digits.startsWith('8')) {
      digits = digits.slice(1);
    }

    // Ограничиваем 10 цифрами (без кода страны)
    digits = digits.slice(0, 10);

    const formatted = formatPhoneNumber(digits);
    setValue(fieldName, formatted, { shouldValidate: true });
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    const selectionStart = input.selectionStart || 0;

    // Блокируем удаление +7
    if ((e.key === 'Backspace' && selectionStart <= 2) ||
        (e.key === 'Delete' && selectionStart < 2) ||
        e.key === '+') {
      e.preventDefault();
    }
  };

  const { register, watch, setValue, handleSubmit, formState: { errors } } = form;

  React.useEffect(() => {
    setValue('deliveryMethod', selectedDelivery);
    setValue('paymentMethod', selectedPayment);
  }, [selectedDelivery, selectedPayment, setValue]);

  const watchedDelivery = watch('deliveryMethod');
  const watchedPayment = watch('paymentMethod');

  const handleDeliveryChange = useCallback((deliveryId: string) => {
    setValue('deliveryMethod', deliveryId, { shouldValidate: true });
    onDeliveryChange(deliveryId); 
  }, [setValue, onDeliveryChange]);

  const handlePaymentChange = useCallback((paymentId: string) => {
    setValue('paymentMethod', paymentId, { shouldValidate: true });
    onPaymentChange(paymentId); 
  }, [setValue, onPaymentChange]);

  const onFormSubmit = useCallback(async (data: CheckoutFormData) => {
    if (isSubmitting || isProcessing) return;
    
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

  const renderPhoneInput = (
    name: 'phone' | 'recipientPhone',
    placeholder: string
  ) => (
    <div>
      <input
        {...register(name, {
          required: `${placeholder} обязательно для заполнения`,
        })}
        type="tel"
        placeholder={placeholder}
        onChange={handlePhoneChange(name)}
        onKeyDown={handlePhoneKeyDown}
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

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8" id="checkout-form">
      
      <div className="space-y-6">
        <h2 className={isMobile ? 'checkout-section-title--mobile' : 'checkout-section-title'}>
          ЛИЧНЫЕ ДАННЫЕ
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {renderInput('firstName', 'Имя, фамилия')}
            {renderPhoneInput('phone', 'Телефон')}
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
          {renderPhoneInput('recipientPhone', 'Телефон')}
        </div>
      </div>

      {/* СПОСОБ ОПЛАТЫ - ТОЧНО КАК БЫЛО */}
      <div className="space-y-6">
        <h2 className={isMobile ? 'checkout-section-title--mobile' : 'checkout-section-title'}>
          СПОСОБ ОПЛАТЫ
        </h2>
        {renderPaymentOptions()}
      </div>

      {/* КНОПКА ТОЛЬКО ДЛЯ МОБИЛЬНЫХ */}
      {isMobile && (
        <div className="space-y-4">
          {/* Предупреждение для неавторизованных пользователей */}
          {!isAuthenticated && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-amber-800 font-medium text-sm">Для оформления заказа необходима регистрация</p>
                  <p className="text-amber-700 text-xs mt-1">Зарегистрируйтесь, чтобы отслеживать заказы</p>
                </div>
              </div>
            </div>
          )}

          {isAuthenticated ? (
            <button
              type="submit"
              disabled={isSubmitting || isProcessing}
              className="w-full bg-black text-white py-4 text-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || isProcessing ? 'ОФОРМЛЯЕМ ЗАКАЗ...' : 'ОФОРМИТЬ ЗАКАЗ'}
            </button>
          ) : (
            <button
              type="button"
              onClick={onAuthRequired}
              className="w-full bg-amber-600 text-white py-4 text-lg font-medium hover:bg-amber-700 transition-colors"
            >
              ВОЙТИ ИЛИ ЗАРЕГИСТРИРОВАТЬСЯ
            </button>
          )}

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