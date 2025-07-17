// src/app/checkout/page.tsx
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

  // Редирект если корзина пуста
  useEffect(() => {
    if (!isLoading && items.length === 0) {
      router.push('/');
    }
  }, [items, router, isLoading]);

  // ✅ ПРОСТОЙ ОБРАБОТЧИК ОТПРАВКИ ЗАКАЗА
  const handleOrderSubmit = async (orderData: any) => {
    try {
      console.log('📦 Отправка заказа:', orderData);
      
      // Здесь будет API запрос к вашему серверу
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderData,
          deliveryMethod: selectedDelivery,
          paymentMethod: selectedPayment,
          cartItems: items,
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Заказ создан:', result);
        
        // Очищаем корзину и перенаправляем на страницу успеха
        clearCart();
        router.push(`/checkout/success?orderId=${result.orderId}`);
      } else {
        throw new Error('Ошибка при создании заказа');
      }
    } catch (error) {
      console.error('❌ Ошибка заказа:', error);
      alert('Произошла ошибка при оформлении заказа. Попробуйте еще раз.');
    }
  };

  // Показываем загрузчик
  if (isLoading) {
    return (
      <div className="min-h-screen lg:bg-[#E5DDD4] bg-white flex items-center justify-center">
        <div className="text-xl">Загрузка...</div>
      </div>
    );
  }

  // Если корзина пуста после загрузки
  if (items.length === 0) {
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
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;