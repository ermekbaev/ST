// src/components/Checkout/NewOrderSummary.tsx
'use client';

import React, { useState, useMemo, useCallback } from 'react';
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

interface NewOrderSummaryProps {
  cartItems: CartItem[];
  onSubmit: (data: any) => void;
  selectedDelivery: string;
  selectedPayment: string;
  isMobile?: boolean;
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

const PROMO_CODES: Record<string, { type: 'amount' | 'percentage' | 'free_shipping'; discount: number }> = {
  'SAVE10': { type: 'percentage', discount: 10 },
  'FREESHIP': { type: 'free_shipping', discount: 0 },
  'SAVE500': { type: 'amount', discount: 500 }
};

const MIN_ORDER_FREE_DELIVERY = 5000;

// ============================================================================
// ОСНОВНОЙ КОМПОНЕНТ
// ============================================================================

const NewOrderSummary: React.FC<NewOrderSummaryProps> = ({ 
  cartItems, 
  onSubmit, 
  selectedDelivery,
  selectedPayment,
  isMobile = false 
}) => {
  // ============================================================================
  // КОНТЕКСТ КОРЗИНЫ ДЛЯ УПРАВЛЕНИЯ ТОВАРАМИ
  // ============================================================================
  
  const { updateQuantity, removeFromCart } = useCart();

  // ============================================================================
  // СОСТОЯНИЕ
  // ============================================================================
  
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  // РАСЧЕТЫ ЦЕНЫ
  // ============================================================================
  
  const calculations = useMemo(() => {
    // Базовая стоимость товаров
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Стоимость доставки
    const selectedDeliveryOption = DELIVERY_OPTIONS.find(opt => opt.id === selectedDelivery);
    let deliveryPrice = selectedDeliveryOption?.price || 0;
    
    // Бесплатная доставка при достижении минимума
    if (subtotal >= MIN_ORDER_FREE_DELIVERY && deliveryPrice > 0) {
      deliveryPrice = 0;
    }
    
    // Применение промокода
    let promoDiscount = 0;
    if (appliedPromo && PROMO_CODES[appliedPromo]) {
      const promo = PROMO_CODES[appliedPromo];
      switch (promo.type) {
        case 'amount':
          promoDiscount = Math.min(promo.discount, subtotal);
          break;
        case 'percentage':
          promoDiscount = Math.floor(subtotal * (promo.discount / 100));
          break;
        case 'free_shipping':
          promoDiscount = selectedDeliveryOption?.price || 0;
          deliveryPrice = 0;
          break;
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
  // ОБРАБОТЧИКИ СОБЫТИЙ
  // ============================================================================
  
  const handleApplyPromo = useCallback(() => {
    const code = promoInput.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setAppliedPromo(code);
    } else {
      alert('Промокод не найден');
    }
  }, [promoInput]);

  const handleRemovePromo = useCallback(() => {
    setAppliedPromo(null);
    setPromoInput('');
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      // Получаем данные формы из DOM (костыль, но работает)
      const form = document.getElementById('checkout-form') as HTMLFormElement;
      if (form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        await onSubmit({
          ...data,
          deliveryMethod: selectedDelivery,
          paymentMethod: selectedPayment,
          total: calculations.total
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, selectedDelivery, selectedPayment, calculations.total]);

  // ============================================================================
  // УДАЛЯЕМ ОТСЛЕЖИВАНИЕ ИЗМЕНЕНИЙ В ФОРМЕ (теперь используем props)
  // ============================================================================

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
                
                {/* Название товара */}
                <h4 className={`checkout-order-item-name ${
                  isMobile ? 'checkout-order-item-name--mobile' : ''
                }`}>
                  {item.name}
                </h4>
                
                {/* Размер (если есть) */}
                {item.size && (
                  <p className={`checkout-order-item-size ${
                    isMobile ? 'checkout-order-item-size--mobile' : ''
                  }`}>
                    Размер: {item.size}
                  </p>
                )}

                {/* КОНТРОЛЫ И ЦЕНА */}
                <div className={`checkout-order-item-controls ${
                  isMobile ? 'checkout-order-item-controls--mobile' : ''
                }`}>
                  
                  {/* КОНТРОЛЫ КОЛИЧЕСТВА */}
                  {!isMobile ? (
                    // Десктопная версия контролов
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
                    // Мобильная версия контролов
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
                  
                  {/* КНОПКА УДАЛЕНИЯ (только на мобиле) */}
                  {isMobile && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item)}
                      className="checkout-remove-btn--mobile"
                    >
                      ✕
                    </button>
                  )}
                  
                  {/* ЦЕНА ТОВАРА */}
                  <span className={`checkout-order-item-price ${
                    isMobile ? 'checkout-order-item-price--mobile' : ''
                  }`}>
                    {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                  </span>
                </div>

                {/* КНОПКА УДАЛЕНИЯ (только на десктопе) */}
                {/* {!isMobile && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item)}
                    className="text-red-500 hover:text-red-700 text-sm mt-2 transition-colors"
                  >
                    ✕ Удалить
                  </button>
                )} */}
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
        {!appliedPromo ? (
          <div className="checkout-promo-container">
            <input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              placeholder="Введите промокод"
              className="checkout-promo-input"
            />
            <button
              type="button"
              onClick={handleApplyPromo}
              className="checkout-promo-btn"
              disabled={!promoInput.trim()}
            >
              Применить
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
            <span className="text-green-700 font-medium">
              ✓ Промокод {appliedPromo} применен
            </span>
            <button
              type="button"
              onClick={handleRemovePromo}
              className="text-red-600 hover:text-red-800"
            >
              Удалить
            </button>
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
            <span>Скидка:</span>
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

      {/* КНОПКА ОФОРМЛЕНИЯ ЗАКАЗА - на мобиле */}
      {isMobile && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-black text-white py-4 text-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'ОФОРМЛЯЕМ ЗАКАЗ...' : 'ОФОРМИТЬ ЗАКАЗ'}
        </button>
      )}

      {/* СОГЛАСИЕ С УСЛОВИЯМИ - на мобиле после кнопки */}
      {isMobile && (
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
      )}

      {/* КНОПКА ОФОРМЛЕНИЯ ЗАКАЗА - только на десктопе */}
      {!isMobile && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="checkout-order-btn"
        >
          {isSubmitting ? 'ОФОРМЛЯЕМ ЗАКАЗ...' : 'ОФОРМИТЬ ЗАКАЗ'}
        </button>
      )}

      {/* СОГЛАСИЕ С УСЛОВИЯМИ - только на десктопе и в самом низу */}
      {!isMobile && (
        <div className="checkout-terms-text">
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
      )}
    </div>
  );
};

export default NewOrderSummary;