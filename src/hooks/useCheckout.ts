// src/hooks/useCheckout.ts - ОБНОВЛЕННАЯ ВЕРСИЯ С ИНТЕГРАЦИЕЙ STRAPI
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useCart } from '@/contexts/CartContext';
import { useDeliverySettings } from './useDeliverySettings';
import { CheckoutFormData, AppliedPromoCode, DeliveryMethod, PaymentMethod } from '@/types/checkout';

// ✅ ДОБАВЛЯЕМ ИНТЕРФЕЙСЫ ДЛЯ API
interface OrderItem {
  productId: string;
  productName: string;
  size: string;
  quantity: number;
  priceAtTime: number;
}

interface CreateOrderData {
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  deliveryMethod: string;
  paymentMethod: string;
  deliveryAddress?: string;
  notes?: string;
}

interface CreateOrderResponse {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  error?: string;
  details?: string;
}

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

// ✅ ИСПРАВЛЕННАЯ ФУНКЦИЯ ОТПРАВКИ В STRAPI API - ЗАМЕНИТЕ НА ЭТУ
const createOrderInStrapi = useCallback(async (orderData: CreateOrderData): Promise<CreateOrderResponse> => {
  try {
    console.log('🔄 Отправляем заказ в Strapi API:', orderData);

    // ✅ ДОБАВЛЕНО: Получаем токен пользователя
    const userToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    // ✅ ДОБАВЛЕНО: Отладочная информация
    console.log('🔍 Отладка токена пользователя:', {
      hasUserToken: !!userToken,
      tokenPreview: userToken ? `${userToken.substring(0, 20)}...` : 'НЕТ ТОКЕНА'
    });

    // ✅ ИСПРАВЛЕНО: Формируем заголовки с токеном авторизации
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // ✅ ДОБАВЛЕНО: Добавляем токен в заголовки если пользователь авторизован
    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
      console.log('✅ Токен добавлен в заголовки запроса');
    } else {
      console.log('⚠️ ТОКЕН НЕ НАЙДЕН - заказ будет создан как гостевой');
    }

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers,
      body: JSON.stringify(orderData)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Заказ успешно создан в Strapi:', data);
      return {
        success: true,
        orderId: data.orderId,
        orderNumber: data.orderNumber
      };
    } else {
      console.error('❌ Ошибка создания заказа в Strapi:', data);
      return {
        success: false,
        error: data.error || 'Ошибка создания заказа',
        details: data.details
      };
    }

  } catch (error) {
    console.error('❌ Ошибка сети при отправке в Strapi:', error);
    return {
      success: false,
      error: 'Ошибка подключения к серверу',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    };
  }
}, []);

  // ✅ ПРЕОБРАЗОВАНИЕ ДАННЫХ ИЗ ФОРМЫ В ФОРМАТ API
  const formatOrderDataForAPI = useCallback((formData: CheckoutFormData, calculations: any): CreateOrderData => {
    return {
      customerInfo: {
        name: `${formData.firstName} ${formData.lastName}`.trim() || formData.firstName,
        phone: formData.phone,
        email: formData.email || undefined,
      },
      items: items.map(item => ({
        productId: item.id || item.article || 'UNKNOWN',
        productName: item.name || `${item.brand} ${item.name}`.trim() || 'Товар без названия',
        size: item.size || 'ONE SIZE',
        quantity: item.quantity || 1,
        priceAtTime: item.price || 0
      })),
      totalAmount: calculations.total,
      deliveryMethod: formData.deliveryMethod,
      paymentMethod: formData.paymentMethod,
      deliveryAddress: formData.address ? 
        `${formData.address}, ${formData.city}, ${formData.region} ${formData.postalCode}`.trim() : 
        '',
      notes: appliedPromoCode ? 
        `Промокод: ${appliedPromoCode.code} (-${appliedPromoCode.appliedDiscount}₽)` : 
        ''
    };
  }, [items, appliedPromoCode]);

  // ✅ ОБНОВЛЕННАЯ ОТПРАВКА ЗАКАЗА С ИНТЕГРАЦИЕЙ STRAPI
  const submitOrder = useCallback(async (data: CheckoutFormData) => {
    try {
      setIsSubmitting(true);
      
      const finalCalculations = calculateTotals(data.deliveryMethod);
      
      console.log('📦 Начинаем оформление заказа...');
      console.log('📊 Итоговые расчеты:', finalCalculations);
      
      // Валидация корзины
      if (!items || items.length === 0) {
        throw new Error('Корзина пуста');
      }

      if (finalCalculations.total <= 0) {
        throw new Error('Неверная сумма заказа');
      }

      // Преобразуем данные для API
      const orderData = formatOrderDataForAPI(data, finalCalculations);
      
      // Отправляем в Strapi через новый API
      const result = await createOrderInStrapi(orderData);
      
      if (result.success) {
        console.log('✅ Заказ успешно создан!', result);
        
        // Очищаем корзину после успешного заказа
        clearCart();
        
        // Перенаправляем на страницу успеха с номером заказа из Strapi
        window.location.href = `/order-success?orderNumber=${result.orderNumber}`;
        
      } else {
        throw new Error(result.error || 'Ошибка создания заказа');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      console.error('❌ Ошибка при оформлении заказа:', errorMessage);
      alert(`Ошибка при оформлении заказа: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [items, calculateTotals, clearCart, formatOrderDataForAPI, createOrderInStrapi]);

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