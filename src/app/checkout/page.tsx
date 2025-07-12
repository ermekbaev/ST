// src/app/checkout/page.tsx (или где у вас страница checkout)
'use client';

import React from 'react';
import { useCheckout } from '@/hooks/useCheckout';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CheckoutForm from '@/components/Checkout/CheckoutForm';
import OrderSummary from '@/components/Checkout/OrderSummary';
import CheckoutDebug from '@/components/debug/CheckoutDebug';

// В вашу страницу checkout добавьте:



const CheckoutPage: React.FC = () => {
  const { items } = useCart();
  const router = useRouter();
  const checkout = useCheckout(); // ✅ Теперь возвращает все данные из API
  const [isLoading, setIsLoading] = useState(true);

  // В JSX:
{process.env.NODE_ENV === 'development' && (
  <CheckoutDebug checkout={checkout} />
)}

  // Даем время на загрузку корзины и настроек доставки
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Редирект только после загрузки
  useEffect(() => {
    if (!isLoading && items.length === 0) {
      router.push('/');
    }
  }, [items, router, isLoading]);

  // Показываем лоадер пока идет загрузка корзины или настроек
  if (isLoading || checkout.loading) {
    return (
      <div className="min-h-screen  lg:bg-[#E5DDD4] bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl">
            {checkout.loading ? 'Загрузка настроек доставки...' : 'Загрузка...'}
          </div>
        </div>
      </div>
    );
  }

  // Если корзина пуста после загрузки
  if (items.length === 0) {
    return (
      <div className="min-h-screen  lg:bg-[#E5DDD4] bg-white flex items-center justify-center">
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
    <div className="min-h-screen  lg:bg-[#E5DDD4] bg-white">
      {/* Основной контент */}
      <main className="min-h-screen">
        {/* Desktop Layout - 2 колонки */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-2 min-h-screen">
            {/* Левая колонка - Форма */}
            <div className="bg-[#E5DDD4] pl-[70px] pr-[20px] py-8">
              <CheckoutForm checkout={checkout} />
            </div>
                     
            {/* Правая колонка - Сводка заказа */}
            <div className="bg-white pl-[20px] pr-[70px] py-8">
              <OrderSummary checkout={checkout} />
            </div>
          </div>
        </div>

        {/* Mobile Layout - 1 колонка с белым фоном */}
        <div className="lg:hidden bg-white min-h-screen">
          {/* Форма сверху */}
          <div className="px-[10px] py-6 space-y-6">
            <CheckoutForm checkout={checkout} isMobile={true} />
          </div>
                   
          {/* Белый блок снизу */}
          <div className="bg-white px-[10px] py-6">
            <OrderSummary checkout={checkout} isMobile={true} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;