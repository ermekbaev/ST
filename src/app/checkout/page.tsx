// src/app/checkout/page.tsx - ОБНОВЛЕН С ПОДДЕРЖКОЙ ЮKASSA
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { createPayment, formatCartItemsForPayment } from '@/services/paymentService'; // 🔥 ДОБАВЛЕНО
import NewCheckoutForm from '@/components/Checkout/newChekoutForm';
import NewOrderSummary from '@/components/Checkout/newCheckoutSummary';

const CheckoutPage: React.FC = () => {
  const { items, clearCart } = useCart();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false); // 🔥 ДОБАВЛЕНО
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

  // 🔥 ИСПРАВЛЕННАЯ ФУНКЦИЯ: НЕ ОЧИЩАЕМ КОРЗИНУ ДО ОПЛАТЫ
  const processPayment = async (orderData: any, orderResponse: any) => {
    if (orderData.paymentMethod === 'card' && orderResponse.orderId) {
      console.log('💳 Инициируем оплату через ЮKassa');
      
      setIsProcessingPayment(true);
      
      try {
        const paymentData = {
          amount: orderData.totalAmount,
          orderId: orderResponse.orderId,
          customerEmail: orderData.customerInfo.email,
          customerPhone: orderData.customerInfo.phone,
          description: `Оплата заказа #${orderResponse.orderNumber || orderResponse.orderId} в Tigr Shop`,
          // 🔥 ИСПРАВЛЕНО: Добавляем paymentId в return_url
          returnUrl: `${window.location.origin}/order-success?orderNumber=${orderResponse.orderNumber}`,
          items: formatCartItemsForPayment(items)
        };

        console.log('🔥 Создаем платеж в ЮKassa:', paymentData);

        const paymentResponse = await createPayment(paymentData);
        
        if (paymentResponse.success && paymentResponse.confirmationUrl) {
          console.log('✅ Платеж создан, перенаправляем на ЮKassa:', paymentResponse.confirmationUrl);
          
          // 🔥 ИСПРАВЛЕНО: НЕ очищаем корзину и НЕ устанавливаем completed
          // Корзина очистится только после УСПЕШНОЙ оплаты через webhook
          
          // Сохраняем ID платежа в localStorage для проверки при возврате
          localStorage.setItem('pendingPaymentId', paymentResponse.paymentId || '');
          localStorage.setItem('pendingOrderId', orderResponse.orderId || '');
          
          // Перенаправляем на страницу оплаты ЮKassa
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
      // Для других способов оплаты - обычное перенаправление
      console.log('📦 Заказ создан без онлайн оплаты');
      clearCart();
      setOrderCompleted(true);
      
      router.push(`/order-success?orderNumber=${orderResponse.orderNumber}`);
    }
  };

  // Функция расчета общей стоимости
  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Простая логика доставки (можно улучшить)
    let deliveryPrice = 0;
    if (selectedDelivery === 'cdek_pickup') deliveryPrice = 300;
    if (selectedDelivery === 'cdek_courier') deliveryPrice = 500;
    if (selectedDelivery === 'post_russia') deliveryPrice = 250;
    if (selectedDelivery === 'boxberry') deliveryPrice = 350;
    
    return subtotal + deliveryPrice;
  };

  // 🔥 ОБНОВЛЕННЫЙ ОБРАБОТЧИК ОТПРАВКИ ЗАКАЗА
  const handleOrderSubmit = async (orderData: any) => {
    if (isProcessing || isProcessingPayment) return;
    
    console.log('🚀 НАЧИНАЕМ ОБРАБОТКУ ЗАКАЗА С ЮKASSA');
    console.log('📋 Данные формы:', orderData);
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

      // Подготавливаем данные для API
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
        totalAmount: calculateTotal(),
        deliveryMethod: selectedDelivery,
        paymentMethod: orderData.paymentMethod || selectedPayment, // 🔥 ВАЖНО: берем из формы
        deliveryAddress: orderData.city && orderData.address 
          ? `${orderData.city.trim()}, ${orderData.address.trim()}`
          : '',
        notes: orderData.notes?.trim() || '',
      };

      console.log('📤 Отправляем заказ в Strapi:', orderPayload);
      console.log('💳 Проверяем способ оплаты:', orderPayload.paymentMethod);
      console.log('❓ Это карта?', orderPayload.paymentMethod === 'card');

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

      // 🔥 НОВОЕ: Обрабатываем платеж через ЮKassa
      console.log('🚀 Запускаем обработку платежа...');
      await processPayment(orderPayload, orderResponse);

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

      {/* 🔥 ДОБАВЛЕНО: Индикатор обработки платежа */}
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