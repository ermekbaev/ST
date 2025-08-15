'use client';

import React, { useState, useMemo, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useCart } from '@/contexts/CartContext';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  photo?: string;
  size?: string;
  article?: string;
}

interface SimplePromoCode {
  id: number;
  code: string;
  title: string;
  discountType: 'percentage' | 'fixed_amount' | 'free_delivery';
  discountValue: number;
  minOrderAmount: number;
  isActive: boolean;
}

interface NewOrderSummaryProps {
  cartItems: CartItem[];
  onSubmit: (data: any) => void;
  selectedDelivery: string;
  selectedPayment: string;
  isMobile?: boolean;
  isProcessing?: boolean;
  getFormData?: () => any;
}

// ============================================================================
// КОНСТАНТЫ
// ============================================================================

const DELIVERY_OPTIONS = [
  { id: 'store_pickup', name: 'Доставить в магазин TS', price: 0 },
  { id: 'courier_ts', name: 'Доставка курьером TS', price: 0 },
  { id: 'cdek_pickup', name: 'СДЭК - доставка до пункта выдачи', price: 300 },
  { id: 'cdek_courier', name: 'СДЭК - доставка курьером', price: 500 }
];

const MIN_ORDER_FREE_DELIVERY = 5000;

// ============================================================================
// ОСНОВНОЙ КОМПОНЕНТ С forwardRef
// ============================================================================

const NewOrderSummary = forwardRef<any, NewOrderSummaryProps>(({ 
  cartItems, 
  onSubmit, 
  selectedDelivery,
  selectedPayment,
  isMobile = false,
  isProcessing = false,
  getFormData,
}, ref) => {
  // ============================================================================
  // КОНТЕКСТ КОРЗИНЫ
  // ============================================================================
  
  const { updateQuantity, removeFromCart } = useCart();

  // ============================================================================
  // СОСТОЯНИЕ ПРОМОКОДОВ
  // ============================================================================
  
  const [promoCodes, setPromoCodes] = useState<SimplePromoCode[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<SimplePromoCode | null>(null);
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isLoadingPromos, setIsLoadingPromos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================================================
  // ЗАГРУЗКА ПРОМОКОДОВ ИЗ API
  // ============================================================================
  
  useEffect(() => {
    const loadPromoCodes = async () => {
      try {
        setIsLoadingPromos(true);
        
        const response = await fetch('/api/promocodes');
        const result = await response.json();
        
        if (result.success) {
          setPromoCodes(result.promocodes || []);
          console.log(`✅ Загружено ${result.promocodes?.length || 0} промокодов`);
        } else {
          console.error('❌ Ошибка загрузки промокодов:', result.error);
          setPromoCodes([]);
        }
        
      } catch (error) {
        console.error('❌ Ошибка запроса промокодов:', error);
        setPromoCodes([]);
      } finally {
        setIsLoadingPromos(false);
      }
    };

    loadPromoCodes();
  }, []);

  // ============================================================================
  // ОБРАБОТЧИКИ КОЛИЧЕСТВА ТОВАРОВ
  // ============================================================================
  
  const handleQuantityChange = useCallback((item: CartItem, newQuantity: number) => {
    const itemKey = item.id || item.article || '';
    
    if (newQuantity <= 0) {
      removeFromCart(itemKey);
    } else {
      updateQuantity(itemKey, newQuantity);
    }
  }, [updateQuantity, removeFromCart]);

  const handleRemoveItem = useCallback((item: CartItem) => {
    const itemKey = item.id || item.article || '';
    removeFromCart(itemKey);
  }, [removeFromCart]);

  // ============================================================================
  // РАСЧЕТЫ ЦЕНЫ С ПРОМОКОДАМИ
  // ============================================================================
  
  const calculations = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const selectedDeliveryOption = DELIVERY_OPTIONS.find(opt => opt.id === selectedDelivery);
    let deliveryPrice = selectedDeliveryOption?.price || 0;
    
    if (subtotal >= MIN_ORDER_FREE_DELIVERY && deliveryPrice > 0) {
      deliveryPrice = 0;
    }
    
    let promoDiscount = 0;
    if (appliedPromo) {
      if (subtotal >= appliedPromo.minOrderAmount) {
        switch (appliedPromo.discountType) {
          case 'fixed_amount':
            promoDiscount = Math.min(appliedPromo.discountValue, subtotal);
            break;
          case 'percentage':
            promoDiscount = Math.floor(subtotal * (appliedPromo.discountValue / 100));
            break;
          case 'free_delivery':
            promoDiscount = selectedDeliveryOption?.price || 0;
            deliveryPrice = 0;
            break;
        }
      }
    }
    
    const total = subtotal + deliveryPrice - promoDiscount;
    
    return {
      subtotal,
      deliveryPrice,
      originalDeliveryPrice: selectedDeliveryOption?.price || 0,
      promoDiscount,
      total: Math.max(0, total),
      freeDeliveryAmount: Math.max(0, MIN_ORDER_FREE_DELIVERY - subtotal)
    };
  }, [cartItems, selectedDelivery, appliedPromo]);

  // ============================================================================
  // ОБРАБОТЧИКИ ПРОМОКОДОВ
  // ============================================================================
  
  const handleApplyPromo = useCallback(() => {
    const code = promoInput.trim().toUpperCase();
    setPromoError(null);
    
    if (!code) {
      setPromoError('Введите промокод');
      return;
    }
    
    const foundPromo = promoCodes.find(promo => promo.code === code);
    
    if (!foundPromo) {
      setPromoError('Промокод не найден');
      return;
    }
    
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (subtotal < foundPromo.minOrderAmount) {
      setPromoError(`Минимальная сумма заказа для этого промокода: ${foundPromo.minOrderAmount} ₽`);
      return;
    }
    
    setAppliedPromo(foundPromo);
    setPromoInput('');
    setPromoError(null);
    
    console.log('✅ Промокод применен:', foundPromo.code);
    
    fetch('/api/promocodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promoCodeId: foundPromo.id })
    }).catch(err => console.log('Ошибка обновления счетчика:', err));
    
  }, [promoInput, promoCodes, cartItems]);

  const handleRemovePromo = useCallback(() => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError(null);
    console.log('🗑️ Промокод удален');
  }, []);

  // ============================================================================
  // ФУНКЦИЯ СКАЧИВАНИЯ ДОКУМЕНТОВ
  // ============================================================================
  
  const handleDownloadDocument = (docType: 'terms' | 'privacy' | 'offer') => {
    const fileUrls = {
      terms: '/downloads/user-agreement.doc',
      privacy: '/downloads/privacy-policy.doc', 
      offer: '/downloads/public-offer.doc'
    };

    const fileNames = {
      terms: 'Пользовательское_соглашение.doc',
      privacy: 'Политика_конфиденциальности.doc',
      offer: 'Договор_оферты.doc'
    };

    const link = document.createElement('a');
    link.href = fileUrls[docType];
    link.download = fileNames[docType];
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFormDataFromDOM = useCallback(() => {
    
    const form = document.getElementById('checkout-form') as HTMLFormElement;
    if (!form) {
      console.error('❌ Форма checkout-form не найдена в DOM');
      console.log('🔍 Доступные формы:', document.querySelectorAll('form'));
      return {};
    }
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    const requiredFields = ['firstName', 'phone'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    return data;
  }, []);

  const getPromoCalculations = useCallback(() => {
    return {
      total: calculations.total,
      subtotal: calculations.subtotal,
      deliveryPrice: calculations.deliveryPrice,
      promoDiscount: calculations.promoDiscount,
      appliedPromoCode: appliedPromo ? {
        code: appliedPromo.code,
        discountAmount: calculations.promoDiscount,
        discountType: appliedPromo.discountType
      } : null
    };
  }, [calculations, appliedPromo]);

  useImperativeHandle(ref, () => ({
    getPromoCalculations
  }), [getPromoCalculations]);

  useEffect(() => {
    console.log('🎟️ NewOrderSummary: Промокоды изменились');
    console.log('💰 Текущие расчеты:', calculations);
    console.log('🏷️ Примененный промокод:', appliedPromo?.code || 'НЕТ');
  }, [calculations, appliedPromo]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || isProcessing) return;
    
    setIsSubmitting(true);
    try {
      let formData = {};
      
      if (getFormData) {
        formData = getFormData();
      } else {
        formData = getFormDataFromDOM();
      }
      
      console.log('📋 Данные формы:', formData);
      console.log('💰 Наши расчеты:', calculations);
      
      const completeOrderData = {
        ...formData,
        deliveryMethod: selectedDelivery,
        paymentMethod: selectedPayment,
        total: calculations.total,
        subtotal: calculations.subtotal,
        deliveryPrice: calculations.deliveryPrice,
        promoDiscount: calculations.promoDiscount,
        appliedPromoCode: appliedPromo ? {
          code: appliedPromo.code,
          discountAmount: calculations.promoDiscount,
          discountType: appliedPromo.discountType
        } : null
      };
      
      
      await onSubmit(completeOrderData);
      
    } catch (error) {
      console.error('❌ Ошибка отправки заказа:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, selectedDelivery, selectedPayment, calculations, getFormData, getFormDataFromDOM, isSubmitting, isProcessing, appliedPromo]);

  // ============================================================================
  // ОСНОВНОЙ РЕНДЕР
  // ============================================================================

  return (
    <div className="space-y-6">
      
      {/* ТОВАРЫ В ЗАКАЗЕ */}
      <div className="space-y-4">
        <h3 className={isMobile ? 'checkout-section-title--mobile' : 'checkout-section-title'}>
          ТОВАРЫ В ЗАКАЗЕ
        </h3>
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className={`checkout-order-item ${isMobile ? 'checkout-order-item--mobile' : ''}`}>
              
              {/* ИЗОБРАЖЕНИЕ ТОВАРА */}
              <div className={`checkout-order-item-image ${
                isMobile ? 'checkout-order-item-image--mobile' : ''
              } relative overflow-hidden`}>
                {item.image || item.photo ? (
                  <img 
                    src={item.image || item.photo} 
                    alt={item.name}
                    className="w-full h-full object-contain bg-white"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">Нет фото</span>
                  </div>
                )}
              </div>

              {/* ИНФОРМАЦИЯ О ТОВАРЕ */}
              <div className={`checkout-order-item-info ${isMobile ? 'checkout-order-item-info--mobile' : ''}`}>
                
                <h4 className={`checkout-order-item-name ${
                  isMobile ? 'checkout-order-item-name--mobile' : ''
                }`}>
                  {item.name}
                </h4>
                
                {item.size && (
                  <p className={`checkout-order-item-size ${
                    isMobile ? 'checkout-order-item-size--mobile' : ''
                  }`}>
                    Размер: {item.size}
                  </p>
                )}

                <div className={`checkout-order-item-controls ${
                  isMobile ? 'checkout-order-item-controls--mobile' : ''
                }`}>
                  
                  {/* КОНТРОЛЫ КОЛИЧЕСТВА */}
                  {!isMobile ? (
                    <div className="checkout-quantity-controls">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item, item.quantity - 1)}
                        className="checkout-quantity-btn"
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <span className="checkout-quantity-number">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item, item.quantity + 1)}
                        className="checkout-quantity-btn"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <div className="checkout-order-item-price-section--mobile">
                      <div className="checkout-quantity-controls--mobile">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item, item.quantity - 1)}
                          className="checkout-quantity-btn--mobile"
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span className="checkout-quantity-number--mobile">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item, item.quantity + 1)}
                          className="checkout-quantity-btn--mobile"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {isMobile && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item)}
                      className="checkout-remove-btn--mobile"
                    >
                      ✕
                    </button>
                  )}
                  
                  <span className={`checkout-order-item-price ${
                    isMobile ? 'checkout-order-item-price--mobile' : ''
                  }`}>
                    {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ПРОМОКОД */}
      <div className="space-y-4">
        <h3 className={isMobile ? 'checkout-section-title--mobile' : 'checkout-section-title'}>
          ПРОМОКОД
        </h3>
        
        {isLoadingPromos && (
          <div className="text-sm text-gray-500">Загружаем промокоды...</div>
        )}
        
        {!appliedPromo ? (
          <div className="space-y-3">
            <div className="checkout-promo-container">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleApplyPromo()}
                placeholder="Введите промокод"
                className="checkout-promo-input"
                disabled={isLoadingPromos}
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                className="checkout-promo-btn"
                disabled={!promoInput.trim() || isLoadingPromos}
              >
                ПРИМЕНИТЬ
              </button>
            </div>
            
            {promoError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                {promoError}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
              <div>
                <span className="text-green-700 font-medium">
                  ✓ Промокод {appliedPromo.code} применен
                </span>
                {appliedPromo.title && (
                  <div className="text-sm text-green-600">
                    {appliedPromo.title}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleRemovePromo}
                className="text-red-600 hover:text-red-800"
              >
                Удалить
              </button>
            </div>
            
            <div className="text-right">
              <span className="text-lg font-semibold text-green-600">
                -{calculations.promoDiscount} ₽
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ИТОГОВАЯ СТОИМОСТЬ */}
      <div className="space-y-3 p-4 bg-gray-50 rounded">
        <div className="flex justify-between text-black">
          <span>Товары:</span>
          <span>{calculations.subtotal.toLocaleString('ru-RU')} ₽</span>
        </div>
        
        <div className="flex justify-between text-black">
          <span>Доставка:</span>
          <span>
            {calculations.deliveryPrice === 0 && calculations.originalDeliveryPrice > 0 ? (
              <span>
                <span className="line-through text-gray-500">
                  {calculations.originalDeliveryPrice} ₽
                </span>
                <span className="text-green-600 ml-2">0 ₽</span>
              </span>
            ) : (
              `${calculations.deliveryPrice} ₽`
            )}
          </span>
        </div>

        {calculations.promoDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Скидка по промокоду:</span>
            <span>-{calculations.promoDiscount} ₽</span>
          </div>
        )}

        <div className="border-t pt-3">
          <div className={`flex justify-between text-lg font-bold ${
            isMobile ? 'checkout-summary-total text-[18px]' : 'checkout-summary-total'
          }`}>
            <span>ИТОГО</span>
            <span>{calculations.total.toLocaleString('ru-RU')} ₽</span>
          </div>
        </div>
      </div>

      {/* ✅ ИСПРАВЛЕНО: КНОПКА ТОЛЬКО НА ДЕСКТОПЕ */}
      {!isMobile && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || isProcessing}
          className="checkout-order-btn"
        >
          {isSubmitting || isProcessing ? 'ОФОРМЛЯЕМ ЗАКАЗ...' : 'ОФОРМИТЬ ЗАКАЗ'}
        </button>
      )}

      {/* ✅ ИСПРАВЛЕНО: СОГЛАСИЕ ТОЛЬКО НА ДЕСКТОПЕ */}
      {!isMobile && (
        <div className="checkout-terms-text">
          Оформляя заказ, Вы подтверждаете согласие с{' '}
          <button onClick={() => handleDownloadDocument('terms')} className="underline hover:no-underline cursor-pointer">
            Пользовательским соглашением
          </button>,{' '}
          <button onClick={() => handleDownloadDocument('privacy')} className="underline hover:no-underline cursor-pointer">
            Политикой конфиденциальности
          </button> и{' '}
          <button onClick={() => handleDownloadDocument('offer')} className="underline hover:no-underline cursor-pointer">
            Договором оферты
          </button>.
        </div>
      )}
    </div>
  );
});

// ✅ ДОБАВЛЕНО: Устанавливаем displayName для React DevTools
NewOrderSummary.displayName = 'NewOrderSummary';

export default NewOrderSummary;