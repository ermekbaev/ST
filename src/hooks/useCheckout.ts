// src/hooks/useCheckout.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ БЕЗ ЦИКЛИЧЕСКИХ ЗАВИСИМОСТЕЙ
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useCart } from '@/contexts/CartContext';
import { useDeliverySettings } from './useDeliverySettings';
import { CheckoutFormData, AppliedPromoCode, DeliveryMethod, PaymentMethod } from '@/types/checkout';

export const useCheckout = () => {
  const { items, clearCart } = useCart();
  const { deliveryOptions, paymentOptions, promoCodes, generalSettings, loading } = useDeliverySettings();
  const [appliedPromoCode, setAppliedPromoCode] = useState<AppliedPromoCode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ ФОРМА БЕЗ ЦИКЛИЧЕСКИХ ЗАВИСИМОСТЕЙ
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
    },
    mode: 'onChange'
  });

  // ✅ БАЗОВЫЕ РАСЧЕТЫ БЕЗ ЗАВИСИМОСТИ ОТ ФОРМЫ
  const baseCalculations = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return { subtotal };
  }, [items]);

  // ✅ ФУНКЦИЯ РАСЧЕТА ДОСТАВКИ
  const calculateDeliveryPrice = useCallback((deliveryId: string) => {
    const selectedDelivery = deliveryOptions.find(option => option.id === deliveryId);
    let deliveryPrice = selectedDelivery?.price || 0;
    
    // Бесплатная доставка при достижении минимальной суммы
    if (baseCalculations.subtotal >= generalSettings.minOrderFreeDelivery && deliveryPrice > 0) {
      deliveryPrice = 0;
    }
    
    return deliveryPrice;
  }, [deliveryOptions, baseCalculations.subtotal, generalSettings.minOrderFreeDelivery]);

  // ✅ ФУНКЦИЯ РАСЧЕТА СКИДКИ
  const calculatePromoDiscount = useCallback((deliveryId: string) => {
    if (!appliedPromoCode) return 0;
    
    const originalDeliveryPrice = deliveryOptions.find(opt => opt.id === deliveryId)?.price || 0;
    
    switch (appliedPromoCode.type) {
      case 'amount':
        return Math.min(appliedPromoCode.discount, baseCalculations.subtotal);
      case 'percentage':
        return Math.floor(baseCalculations.subtotal * (appliedPromoCode.discount / 100));
      case 'free_shipping':
        return originalDeliveryPrice > 0 ? originalDeliveryPrice : 0;
      default:
        return 0;
    }
  }, [appliedPromoCode, baseCalculations.subtotal, deliveryOptions]);

  // ✅ ОБЩАЯ ФУНКЦИЯ РАСЧЕТА
  const calculateTotals = useCallback((deliveryMethod?: string) => {
    const currentDeliveryMethod = deliveryMethod || form.getValues('deliveryMethod');
    const deliveryPrice = calculateDeliveryPrice(currentDeliveryMethod);
    const promoDiscount = calculatePromoDiscount(currentDeliveryMethod);
    const total = Math.max(0, baseCalculations.subtotal + deliveryPrice - promoDiscount);
    
    return {
      ...baseCalculations,
      deliveryPrice,
      promoDiscount,
      total,
      estimatedDelivery: generalSettings.deliveryTimeGeneral
    };
  }, [baseCalculations, calculateDeliveryPrice, calculatePromoDiscount, generalSettings.deliveryTimeGeneral, form]);

  // ✅ ТЕКУЩИЕ РАСЧЕТЫ БЕЗ ПРЯМОЙ ЗАВИСИМОСТИ ОТ form.watch
  const [calculations, setCalculations] = useState(() => calculateTotals());

  // ✅ ОБНОВЛЯЕМ РАСЧЕТЫ КОГДА МЕНЯЮТСЯ БАЗОВЫЕ ДАННЫЕ
  useEffect(() => {
    setCalculations(calculateTotals());
  }, [calculateTotals]);

  // ✅ СЛУШАЕМ ИЗМЕНЕНИЯ СПОСОБА ДОСТАВКИ ОТДЕЛЬНО
  const selectedDeliveryMethod = form.watch('deliveryMethod');
  useEffect(() => {
    setCalculations(calculateTotals(selectedDeliveryMethod));
  }, [selectedDeliveryMethod, calculateTotals]);

  // ✅ ПРИМЕНЕНИЕ ПРОМОКОДА
  const applyPromoCode = useCallback((code: string): boolean => {
    const foundPromo = promoCodes.find(promo => promo.code === code.toUpperCase());
    
    if (!foundPromo) {
      console.log('❌ Промокод не найден:', code);
      return false;
    }
    
    const currentDeliveryMethod = form.getValues('deliveryMethod');
    const appliedDiscount = calculatePromoDiscount(currentDeliveryMethod);
    
    setAppliedPromoCode({
      ...foundPromo,
      appliedDiscount
    });
    
    // Обновляем расчеты после применения промокода
    setTimeout(() => setCalculations(calculateTotals()), 0);
    
    console.log('✅ Промокод применен:', foundPromo.code, appliedDiscount);
    return true;
  }, [promoCodes, form, calculatePromoDiscount, calculateTotals]);

  // ✅ УДАЛЕНИЕ ПРОМОКОДА
  const removePromoCode = useCallback(() => {
    setAppliedPromoCode(null);
    setTimeout(() => setCalculations(calculateTotals()), 0);
    console.log('🗑️ Промокод удален');
  }, [calculateTotals]);

  // ✅ ОТПРАВКА ЗАКАЗА
  const submitOrder = useCallback(async (data: CheckoutFormData) => {
    try {
      setIsSubmitting(true);
      
      const finalCalculations = calculateTotals(data.deliveryMethod);
      
      const orderData = {
        ...data,
        items,
        calculations: finalCalculations,
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
  }, [items, calculateTotals, appliedPromoCode, clearCart]);

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