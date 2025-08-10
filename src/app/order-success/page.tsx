// src/app/order-success/page.tsx - ОБНОВЛЕННЫЙ С ПРОВЕРКОЙ НЕЗАВЕРШЕННЫХ ПЛАТЕЖЕЙ
'use client';

import SuccessHero from '@/components/OrderSuccess/SuccessHero';
import React, { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext'; // 🔥 ДОБАВЛЕНО

// Компонент который использует useSearchParams
const OrderSuccessContent: React.FC = () => {
  const searchParams = useSearchParams();
  const { clearCart } = useCart(); // 🔥 ДОБАВЛЕНО
  
  const orderNumber = searchParams.get('orderNumber') || undefined;
  const paymentId = searchParams.get('paymentId') || undefined;
  
  // 🔥 ДОБАВЛЕНО: Проверяем localStorage на незавершенные платежи
  useEffect(() => {
    const pendingPaymentId = localStorage.getItem('pendingPaymentId');
    const pendingOrderId = localStorage.getItem('pendingOrderId');
    
    // Если есть успешный платеж, очищаем корзину и localStorage
    if (paymentId && paymentId === pendingPaymentId) {
      console.log('✅ Успешный возврат с ЮKassa, очищаем корзину');
      clearCart();
      localStorage.removeItem('pendingPaymentId');
      localStorage.removeItem('pendingOrderId');
    }
    
    // Если пользователь вернулся без paymentId, но есть pending - возможно отмена
    if (!paymentId && pendingPaymentId) {
      console.log('⚠️ Возврат без paymentId - возможно платеж отменен');
      // НЕ очищаем корзину - пользователь может попробовать снова
    }
  }, [paymentId, clearCart]);

  console.log('📄 Страница успеха загружена:', {
    orderNumber,
    paymentId,
    hasPayment: !!paymentId
  });

  return <SuccessHero orderNumber={orderNumber} paymentId={paymentId} />;
};

// Главный компонент с Suspense
const OrderSuccessPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="font-product text-gray-600">Проверяем статус заказа...</p>
          </div>
        </div>
      }>
        <OrderSuccessContent />
      </Suspense>
    </div>
  );
};

export default OrderSuccessPage;