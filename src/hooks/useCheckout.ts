import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation'; 
import { useCart } from '@/contexts/CartContext';
import { useDeliverySettings } from './useDeliverySettings';
import { createPayment, formatCartItemsForPayment } from '@/services/paymentService'; // 🔥 ДОБАВЛЕНО: импорт сервиса ЮKassa
import { CheckoutFormData, AppliedPromoCode, DeliveryMethod, PaymentMethod } from '@/types/checkout';

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
  const router = useRouter(); 
  const { items, clearCart } = useCart();
  const { deliveryOptions, paymentOptions, promoCodes, generalSettings, loading } = useDeliverySettings();
  const [appliedPromoCode, setAppliedPromoCode] = useState<AppliedPromoCode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false); 

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

  const baseCalculations = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return { subtotal };
  }, [items]);

  const calculateDeliveryPrice = useCallback((deliveryId: string) => {
    const selectedDelivery = deliveryOptions.find(option => option.id === deliveryId);
    let deliveryPrice = selectedDelivery?.price || 0;
    
    if (baseCalculations.subtotal >= generalSettings.minOrderFreeDelivery && deliveryPrice > 0) {
      deliveryPrice = 0;
    }
    
    return deliveryPrice;
  }, [deliveryOptions, baseCalculations.subtotal, generalSettings.minOrderFreeDelivery]);

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

  const [calculations, setCalculations] = useState(() => calculateTotals());

  useEffect(() => {
    setCalculations(calculateTotals());
  }, [calculateTotals]);

  const selectedDeliveryMethod = form.watch('deliveryMethod');
  useEffect(() => {
    setCalculations(calculateTotals(selectedDeliveryMethod));
  }, [selectedDeliveryMethod, calculateTotals]);

  const applyPromoCode = useCallback((code: string): boolean => {
    const foundPromo = promoCodes.find(promo => promo.code === code.toUpperCase());
    
    if (!foundPromo) {
      return false;
    }
    
    const currentDeliveryMethod = form.getValues('deliveryMethod');
    const appliedDiscount = calculatePromoDiscount(currentDeliveryMethod);
    
    setAppliedPromoCode({
      ...foundPromo,
      appliedDiscount
    });
    
    setTimeout(() => setCalculations(calculateTotals()), 0);
    
    return true;
  }, [promoCodes, form, calculatePromoDiscount, calculateTotals]);

  const removePromoCode = useCallback(() => {
    setAppliedPromoCode(null);
    setTimeout(() => setCalculations(calculateTotals()), 0);
  }, [calculateTotals]);

  const createOrderInStrapi = useCallback(async (orderData: CreateOrderData): Promise<CreateOrderResponse> => {
    try {

      const userToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(userToken ? { Authorization: `Bearer ${userToken}` } : {})
      };

      if (userToken) {
        headers['Authorization'] = `Bearer ${userToken}`;
      } else {
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (response.ok) {
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

  const processPayment = useCallback(async (orderData: CreateOrderData, orderResponse: CreateOrderResponse) => {
    if (orderData.paymentMethod === 'card' && orderResponse.orderId) {
      
      setIsProcessingPayment(true);
      
      try {
        const paymentData = {
          amount: orderData.totalAmount,
          orderId: orderResponse.orderId,
          customerEmail: orderData.customerInfo.email,
          customerPhone: orderData.customerInfo.phone,
          description: `Оплата заказа #${orderResponse.orderNumber || orderResponse.orderId} в Tigr Shop`,
          returnUrl: `${window.location.origin}/orders/${orderResponse.orderId}/success`,
          items: formatCartItemsForPayment(items) 
        };

        const paymentResponse = await createPayment(paymentData);
        
        if (paymentResponse.success && paymentResponse.confirmationUrl) {
          clearCart();
          
          window.location.href = paymentResponse.confirmationUrl;
          return;
          
        } else {
          console.error('❌ Ошибка создания платежа:', paymentResponse.error);
          throw new Error(paymentResponse.error || 'Ошибка создания платежа');
        }

      } catch (error) {
        console.error('❌ Ошибка обработки платежа:', error);
        setIsProcessingPayment(false);
        throw error;
      }
    } else {
      clearCart();
      router.push(`/orders/${orderResponse.orderId}/success`);
    }
  }, [items, clearCart, router]);

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

const submitOrder = useCallback(async (data: CheckoutFormData) => {
  if (isSubmitting || isProcessingPayment) return;

  try {
    setIsSubmitting(true);
    
    const finalCalculations = calculateTotals(data.deliveryMethod);
    
    if (!items || items.length === 0) {
      throw new Error('Корзина пуста');
    }

    if (finalCalculations.total <= 0) {
      throw new Error('Неверная сумма заказа');
    }

    const orderData = formatOrderDataForAPI(data, finalCalculations);
    
    const orderResponse = await createOrderInStrapi(orderData);
    
    if (!orderResponse.success) {
      throw new Error(orderResponse.error || 'Ошибка создания заказа');
    }

    await processPayment(orderData, orderResponse);
    
  } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      console.error('❌ Ошибка при оформлении заказа:', errorMessage);
      alert(`Ошибка при оформлении заказа: ${errorMessage}`);
      
      setIsSubmitting(false);
      setIsProcessingPayment(false);
    }
  }, [isSubmitting, isProcessingPayment, items, calculateTotals, formatOrderDataForAPI, createOrderInStrapi, processPayment]);

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
    isProcessingPayment, 
    loading,
    generalSettings
  };
};