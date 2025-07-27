// src/app/checkout/page.tsx - ИСПРАВЛЕН: БЕЗ КОНФЛИКТА РЕДИРЕКТОВ
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import NewCheckoutForm from '@/components/Checkout/newChekoutForm';
import NewOrderSummary from '@/components/Checkout/newCheckoutSummary';

const CheckoutPage: React.FC = () => {
  const { items, clearCart } = useCart();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false); // ✅ ДОБАВИЛИ ФЛАГ
  
  // ✅ ОБЩЕЕ СОСТОЯНИЕ ДЛЯ СИНХРОНИЗАЦИИ КОМПОНЕНТОВ
  const [selectedDelivery, setSelectedDelivery] = useState('store_pickup');
  const [selectedPayment, setSelectedPayment] = useState('card');

  // Загрузка данных
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // ✅ ИСПРАВЛЕН: Редирект только если корзина пуста И заказ НЕ завершен
  useEffect(() => {
    if (!isLoading && items.length === 0 && !orderCompleted && !isProcessing) {
      console.log('🔄 Корзина пуста, перенаправляем на главную (но НЕ после завершения заказа)');
      router.push('/');
    }
  }, [items, router, isLoading, orderCompleted, isProcessing]);

  // ОБРАБОТЧИК ОТПРАВКИ ЗАКАЗА
  const handleOrderSubmit = async (orderData: any) => {
    if (isProcessing) return;
    
    console.log('🚀 НАЧИНАЕМ ОБРАБОТКУ ЗАКАЗА');
    setIsProcessing(true);
    
    try {
      // Валидация
      if (!orderData.firstName?.trim() || !orderData.phone?.trim()) {
        throw new Error('Заполните имя и телефон');
      }

      if (items.length === 0) {
        throw new Error('Корзина пуста');
      }

      // Подготавливаем данные
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
        paymentMethod: selectedPayment,
        deliveryAddress: orderData.city && orderData.address 
          ? `${orderData.city.trim()}, ${orderData.address.trim()}`
          : '',
        notes: orderData.notes?.trim() || '',
      };

      console.log('📋 Отправляем в API:', orderPayload);

      // Отправляем в API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Ошибка создания заказа');
      }

      console.log('✅ Заказ создан:', result.orderNumber);

      // ✅ КРИТИЧНО: Сначала устанавливаем флаг, ПОТОМ очищаем корзину
      setOrderCompleted(true);
      
      // Небольшая задержка чтобы флаг успел установиться
      setTimeout(() => {
        clearCart();
        
        // Еще одна задержка перед перенаправлением
        setTimeout(() => {
          const successUrl = `/order-success?orderNumber=${result.orderNumber}&paymentMethod=${selectedPayment}`;
          
          if (selectedPayment === 'cash_vladivostok') {
            console.log('🎯 Перенаправляем на:', successUrl + '&type=cash');
            router.push(successUrl + '&type=cash');
          } else {
            console.log('🎯 Перенаправляем на:', successUrl + '&type=online_pending');
            router.push(successUrl + '&type=online_pending');
          }
        }, 100);
      }, 100);

    } catch (error) {
      console.error('❌ Ошибка при оформлении заказа:', error);
      
      let errorMessage = 'Произошла ошибка при оформлении заказа.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert(`Ошибка: ${errorMessage}\n\nПопробуйте еще раз или свяжитесь с нами:\n📞 Телефон: +7 (xxx) xxx-xx-xx\n📧 Email: tigran200615@gmail.com`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Вычисление общей суммы
  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let deliveryCost = 0;
    switch (selectedDelivery) {
      case 'cdek_pickup':
        deliveryCost = 300;
        break;
      case 'cdek_courier':
        deliveryCost = 500;
        break;
      case 'courier_ts':
        deliveryCost = 0;
        break;
      case 'store_pickup':
      default:
        deliveryCost = 0;
    }

    return subtotal + deliveryCost;
  };

  // Показываем загрузчик
  if (isLoading) {
    return (
      <div className="min-h-screen lg:bg-[#E5DDD4] bg-white flex items-center justify-center">
        <div className="text-xl">Загрузка...</div>
      </div>
    );
  }

  // ✅ ИСПРАВЛЕН: Показываем "корзина пуста" только если заказ НЕ завершается
  if (items.length === 0 && !orderCompleted && !isProcessing) {
    return (
      <div className="min-h-screen lg:bg-[#E5DDD4] bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Корзина пуста</h2>
          <p className="text-gray-600 mb-6">Добавьте товары в корзину для оформления заказа</p>
          <button
            onClick={() => router.push('/')}
            className="bg-black text-white px-6 py-3 font-medium hover:bg-gray-800 transition-colors"
          >
            Вернуться к покупкам
          </button>
        </div>
      </div>
    );
  }

  // Преобразуем товары корзины в нужный формат
  const cartItems = items.map(item => ({
    id: item.id || item.article || '',
    name: item.name || item.title || '',
    price: item.price || 0,
    quantity: item.quantity || 1,
    image: item.image || item.photo || item.images?.[0] || '',
    photo: item.photo || item.image || '',
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
                isProcessing={isProcessing}
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
                isProcessing={isProcessing}
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
              isProcessing={isProcessing}
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
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;