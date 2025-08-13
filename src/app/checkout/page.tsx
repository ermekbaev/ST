// src/app/checkout/page.tsx - ИСПРАВЛЕН ДЛЯ ПРОМОКОДОВ
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { createPayment, formatCartItemsForPayment } from '@/services/paymentService';
import NewCheckoutForm from '@/components/Checkout/newChekoutForm';
import NewOrderSummary from '@/components/Checkout/newCheckoutSummary';

const CheckoutPage: React.FC = () => {
  const { items, clearCart } = useCart();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  
  const [selectedDelivery, setSelectedDelivery] = useState('store_pickup');
  const [selectedPayment, setSelectedPayment] = useState('card');

  // Загрузка данных
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Редирект только если корзина пуста И заказ НЕ завершен
  useEffect(() => {
    if (!isLoading && items.length === 0 && !orderCompleted && !isProcessing && !isProcessingPayment) {
      console.log('🔄 Корзина пуста, перенаправляем на главную');
      router.push('/');
    }
  }, [items, router, isLoading, orderCompleted, isProcessing, isProcessingPayment]);

  // ✅ ИСПРАВЛЕННАЯ ФУНКЦИЯ: Использует финальную цену с промокодом
  const processPayment = async (orderData: any, orderResponse: any) => {
    if (orderData.paymentMethod === 'card' && orderResponse.orderId) {
      console.log('💳 Инициируем оплату через ЮKassa');
      console.log('💰 Финальная сумма для ЮKassa:', orderData.total);
      
      setIsProcessingPayment(true);
      
      try {
        const paymentData = {
          // ✅ КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: используем финальную цену С ПРОМОКОДОМ
          amount: orderData.total, // ← Это цена уже С промокодом!
          orderId: orderResponse.orderId,
          customerEmail: orderData.customerInfo.email,
          customerPhone: orderData.customerInfo.phone,
          description: `Оплата заказа #${orderResponse.orderNumber || orderResponse.orderId} в Tigr Shop`,
          returnUrl: `${window.location.origin}/order-success?orderNumber=${orderResponse.orderNumber}`,
          items: formatCartItemsForPayment(items)
        };

        console.log('🔥 Создаем платеж в ЮKassa на сумму:', paymentData.amount);

        const paymentResponse = await createPayment(paymentData);
        
        if (paymentResponse.success && paymentResponse.confirmationUrl) {
          console.log('✅ Платеж создан, перенаправляем на ЮKassa');
          
          // Сохраняем данные
          localStorage.setItem('pendingPaymentId', paymentResponse.paymentId || '');
          localStorage.setItem('pendingOrderId', orderResponse.orderId || '');
          localStorage.setItem('finalAmount', orderData.total.toString()); // Сохраняем финальную сумму
          
          // Перенаправляем на ЮKassa
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
      // Для других способов оплаты
      console.log('📦 Заказ создан без онлайн оплаты на сумму:', orderData.total);
      clearCart();
      setOrderCompleted(true);
      
      router.push(`/order-success?orderNumber=${orderResponse.orderNumber}`);
    }
  };

  // ✅ УДАЛИЛИ calculateTotal() - теперь цену передает NewOrderSummary

  // ✅ ОБНОВЛЕННЫЙ ОБРАБОТЧИК: Получает финальную цену от NewOrderSummary
  const handleOrderSubmit = async (orderData: any) => {
    if (isProcessing || isProcessingPayment) return;
    
    console.log('🚀 НАЧИНАЕМ ОБРАБОТКУ ЗАКАЗА');
    console.log('📋 Данные от NewOrderSummary:', orderData);
    console.log('💰 Финальная цена с промокодом:', orderData.total);
    console.log('💳 Способ оплаты:', orderData.paymentMethod || selectedPayment);
    
    setIsProcessing(true);
    
    try {
      // Валидация
      if (!orderData.firstName?.trim() || !orderData.phone?.trim()) {
        throw new Error('Заполните имя и телефон');
      }

      if (items.length === 0) {
        throw new Error('Корзина пуста');
      }

      // ✅ ИСПРАВЛЕНО: Используем финальную цену от NewOrderSummary
      const orderPayload = {
        customerInfo: {
          name: orderData.firstName.trim(),
          phone: orderData.phone.trim(),
          email: orderData.email?.trim() || '',
        },
        items: items.map(item => ({
          productId: item.id || item.article,
          productName: item.name || item.title,
          //@ts-ignore
          size: item.selectedSize || item.size,
          quantity: item.quantity,
          priceAtTime: item.price,
        })),
        // ✅ КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: используем финальную цену с промокодом
        totalAmount: orderData.total, // ← Цена С ПРОМОКОДОМ от NewOrderSummary!
        deliveryMethod: selectedDelivery,
        paymentMethod: orderData.paymentMethod || selectedPayment,
        deliveryAddress: orderData.city && orderData.address 
          ? `${orderData.city.trim()}, ${orderData.address.trim()}`
          : '',
        notes: orderData.notes?.trim() || '',
        
        // ✅ ДОПОЛНИТЕЛЬНО: Сохраняем данные о промокоде для отладки
        originalTotal: orderData.subtotal + (orderData.deliveryPrice || 0),
        promoDiscount: orderData.promoDiscount || 0,
        appliedPromoCode: orderData.appliedPromoCode || null
      };

      console.log('📤 Отправляем заказ в Strapi на сумму:', orderPayload.totalAmount);
      console.log('🎟️ Примененный промокод:', orderPayload.appliedPromoCode?.code || 'НЕТ');

      // Отправляем в API заказов
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(orderPayload)
      });

      const orderResponse = await response.json();

      if (!response.ok) {
        throw new Error(orderResponse.error || 'Ошибка создания заказа');
      }

      console.log('✅ Заказ создан в Strapi:', orderResponse);

      // ✅ ИСПРАВЛЕНО: Передаем orderData с финальной ценой
      console.log('🚀 Запускаем обработку платежа на сумму:', orderData.total);
      
      // Передаем объект с финальной ценой
      const paymentOrderData = {
        ...orderPayload,
        total: orderData.total, // ← Финальная цена для ЮKassa
        customerInfo: orderPayload.customerInfo,
        paymentMethod: orderPayload.paymentMethod
      };
      
      await processPayment(paymentOrderData, orderResponse);

    } catch (error: any) {
      console.error('❌ Ошибка при обработке заказа:', error);
      alert(`Ошибка: ${error.message}`);
      
      setIsProcessing(false);
      setIsProcessingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Загружаем страницу оформления...</p>
        </div>
      </div>
    );
  }

  // Карта товаров для компонентов
  const cartItems = items.map(item => ({
    id: item.id || item.article || '',
    name: item.name || item.title || 'Товар',
    price: item.price || 0,
    quantity: item.quantity || 1,
    image: item.images?.[0] || item.photo || item.image || '',
    size: item.size || '',
    article: item.article || item.id || ''
  }));

  return (
    <div className="min-h-screen lg:bg-[#E5DDD4] bg-white">
      {/* Основной контент */}
      <main className="min-h-screen">
        {/* Desktop Layout - 2 колонки */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-2 min-h-screen">
            {/* Левая колонка - Форма */}
            <div className="bg-[#E5DDD4] pl-[70px] pr-[20px] pt-8 pb-16">
              <NewCheckoutForm
                cartItems={cartItems}
                onSubmit={handleOrderSubmit}
                selectedDelivery={selectedDelivery}
                selectedPayment={selectedPayment}
                onDeliveryChange={setSelectedDelivery}
                onPaymentChange={setSelectedPayment}
                isMobile={false}
                isProcessing={isProcessing || isProcessingPayment}
              />
            </div>
                     
            {/* Правая колонка - Сводка заказа */}
            <div className="bg-white pl-[20px] pr-[70px] py-8">
              <NewOrderSummary
                cartItems={cartItems}
                onSubmit={handleOrderSubmit}
                selectedDelivery={selectedDelivery}
                selectedPayment={selectedPayment}
                isMobile={false}
                isProcessing={isProcessing || isProcessingPayment}
              />
            </div>
          </div>
        </div>

        {/* Mobile Layout - 1 колонка с белым фоном */}
        <div className="lg:hidden bg-white min-h-screen">
          {/* Форма сверху */}
          <div className="px-[10px] py-6 space-y-6">
            <NewCheckoutForm
              cartItems={cartItems}
              onSubmit={handleOrderSubmit}
              selectedDelivery={selectedDelivery}
              selectedPayment={selectedPayment}
              onDeliveryChange={setSelectedDelivery}
              onPaymentChange={setSelectedPayment}
              isMobile={true}
              isProcessing={isProcessing || isProcessingPayment}
            />
          </div>
                   
          {/* Белый блок снизу */}
          <div className="bg-white px-[10px] py-6">
            <NewOrderSummary
              cartItems={cartItems}
              onSubmit={handleOrderSubmit}
              selectedDelivery={selectedDelivery}
              selectedPayment={selectedPayment}
              isMobile={true}
              isProcessing={isProcessing || isProcessingPayment}
            />
          </div>
        </div>
      </main>

      {/* Индикатор обработки платежа */}
      {isProcessingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg text-center max-w-sm mx-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Создаем платеж</h3>
            <p className="text-gray-600">Сейчас перенаправим вас на страницу оплаты ЮKassa...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;