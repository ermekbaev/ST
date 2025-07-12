// src/hooks/useCheckout.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ
import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useCart } from '@/contexts/CartContext';
import { useDeliverySettings } from './useDeliverySettings';
import { CheckoutFormData, AppliedPromoCode, DeliveryMethod, PaymentMethod } from '@/types/checkout';

export const useCheckout = () => {
  const { items, clearCart } = useCart();
  const { deliveryOptions, paymentOptions, promoCodes, generalSettings, loading } = useDeliverySettings();
  const [appliedPromoCode, setAppliedPromoCode] = useState<AppliedPromoCode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CheckoutFormData>({
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
      deliveryMethod: 'store_pickup' as DeliveryMethod,
      paymentMethod: 'card' as PaymentMethod,
    }
  });

  const selectedDeliveryMethod = form.watch('deliveryMethod');

  // 🔧 ИСПРАВЛЕННЫЙ расчет стоимости
  const calculations = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // 🔍 Находим выбранный способ доставки
    const selectedDelivery = deliveryOptions.find(option => option.id === selectedDeliveryMethod);
    let deliveryPrice = selectedDelivery?.price || 0;
    
    console.log('🚚 Расчет доставки:', {
      selectedDeliveryMethod,
      selectedDelivery,
      deliveryPrice,
      deliveryOptions: deliveryOptions.length
    });
    
    // Бесплатная доставка при достижении минимальной суммы
    const originalDeliveryPrice = deliveryPrice;
    if (subtotal >= generalSettings.minOrderFreeDelivery && deliveryPrice > 0) {
      deliveryPrice = 0;
      console.log('✅ Бесплатная доставка активирована (сумма >= ' + generalSettings.minOrderFreeDelivery + ')');
    }
    
    let promoDiscount = 0;
    
    if (appliedPromoCode) {
      switch (appliedPromoCode.type) {
        case 'amount':
          promoDiscount = Math.min(appliedPromoCode.discount, subtotal);
          break;
        case 'percentage':
          promoDiscount = Math.floor(subtotal * (appliedPromoCode.discount / 100));
          break;
        case 'free_shipping':
          if (originalDeliveryPrice > 0) {
            promoDiscount = originalDeliveryPrice;
            deliveryPrice = 0;
          }
          break;
      }
    }
    
    const total = subtotal + deliveryPrice - promoDiscount;
    
    console.log('💰 Итоговый расчет:', {
      subtotal,
      deliveryPrice,
      promoDiscount,
      total,
      appliedPromoCode: appliedPromoCode?.code
    });
    
    return {
      subtotal,
      deliveryPrice,
      promoDiscount,
      total: Math.max(0, total),
      estimatedDelivery: generalSettings.deliveryTimeGeneral
    };
  }, [items, selectedDeliveryMethod, appliedPromoCode, deliveryOptions, generalSettings]);

  // Применение промокода
  const applyPromoCode = (code: string): boolean => {
    const foundPromo = promoCodes.find(promo => promo.code === code.toUpperCase());
    
    if (!foundPromo) {
      console.log('❌ Промокод не найден:', code);
      return false;
    }
    
    let appliedDiscount = 0;
    
    switch (foundPromo.type) {
      case 'amount':
        appliedDiscount = Math.min(foundPromo.discount, calculations.subtotal);
        break;
      case 'percentage':
        appliedDiscount = Math.floor(calculations.subtotal * (foundPromo.discount / 100));
        break;
      case 'free_shipping':
        const selectedDelivery = deliveryOptions.find(option => option.id === selectedDeliveryMethod);
        appliedDiscount = selectedDelivery?.price || 0;
        break;
    }
    
    setAppliedPromoCode({
      ...foundPromo,
      appliedDiscount
    });
    
    console.log('✅ Промокод применен:', foundPromo.code, appliedDiscount);
    return true;
  };

  // Удаление промокода
  const removePromoCode = () => {
    setAppliedPromoCode(null);
    console.log('🗑️ Промокод удален');
  };

  // 🔧 ДОБАВЛЯЕМ useEffect для отладки изменений способа доставки
  useEffect(() => {
    console.log('🔄 Способ доставки изменен:', selectedDeliveryMethod);
    console.log('📦 Доступные способы доставки:', deliveryOptions);
  }, [selectedDeliveryMethod, deliveryOptions]);

  // Отправка заказа
  const submitOrder = async (data: CheckoutFormData) => {
    try {
      setIsSubmitting(true);
      
      const orderData = {
        ...data,
        items,
        calculations,
        appliedPromoCode,
        timestamp: new Date().toISOString()
      };
      
      console.log('📦 Отправка заказа:', orderData);
      
      // Имитация отправки
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Очищаем корзину после успешного заказа
      clearCart();
      
      // Перенаправляем на страницу успеха
      window.location.href = '/order-success';
      
    } catch (error) {
      console.error('❌ Ошибка при оформлении заказа:', error);
      alert('Ошибка при оформлении заказа. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    items,
    deliveryOptions,
    paymentOptions,
    promoCodes,
    appliedPromoCode,
    removePromoCode,
    ...calculations,
    applyPromoCode,
    submitOrder,
    isSubmitting,
    loading,
    generalSettings
  };
};