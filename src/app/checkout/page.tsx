'use client';

import React from 'react';
import { useCheckout } from '@/hooks/useCheckout';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CheckoutForm from '@/components/Checkout/CheckoutForm';
import OrderSummary from '@/components/Checkout/OrderSummary';

const CheckoutPage: React.FC = () => {
  const { items } = useCart();
  const router = useRouter();
  const checkout = useCheckout();
  const [isLoading, setIsLoading] = useState(true);

  // Даем время на загрузку корзины
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100); // Небольшая задержка для загрузки состояния

    return () => clearTimeout(timer);
  }, []);

  // Редирект только после загрузки
  useEffect(() => {
    if (!isLoading && items.length === 0) {
      router.push('/');
    }
  }, [items, router, isLoading]);

  // Показываем лоадер пока идет загрузка
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E5DDD4] flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl">Загрузка...</div>
        </div>
      </div>
    );
  }

  // Если корзина пуста после загрузки
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#E5DDD4] flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-[#E5DDD4]">
      {/* Основной контент */}
      <main className="min-h-screen">
        {/* Desktop Layout - 2 колонки */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-2 min-h-screen">
            {/* Левая колонка - Форма */}
            <div className="bg-[#E5DDD4] pl-[70px] pr-[20px] pt-8 pb-36">
              <CheckoutForm checkout={checkout} />
            </div>
            
            {/* Правая колонка - Сводка заказа */}
            <div className="bg-white pl-[20px] pr-[70px] py-8">
              <OrderSummary checkout={checkout} />
            </div>
          </div>
        </div>

        {/* Mobile Layout - 1 колонка */}
        <div className="lg:hidden">
          <div className="px-4 py-6 space-y-8">
            {/* Сводка заказа сверху на мобиле */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <OrderSummary checkout={checkout} isMobile />
            </div>
            
            {/* Форма снизу на мобиле */}
            <div className="bg-[#E5DDD4] p-6 rounded-lg">
              <CheckoutForm checkout={checkout} isMobile />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;