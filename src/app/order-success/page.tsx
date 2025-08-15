'use client';

import SuccessHero from '@/components/OrderSuccess/SuccessHero';
import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';

const OrderSuccessContent: React.FC = () => {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  
  const orderNumber = searchParams.get('orderNumber') || undefined;
  const [paymentId, setPaymentId] = useState<string | undefined>(undefined);
  const [statusSynced, setStatusSynced] = useState(false);
  
  useEffect(() => {
    const pendingPaymentId = localStorage.getItem('pendingPaymentId');
    const pendingOrderId = localStorage.getItem('pendingOrderId');
    
    if (pendingPaymentId) {
      setPaymentId(pendingPaymentId);
      
      clearCart();
      localStorage.removeItem('pendingPaymentId');
      localStorage.removeItem('pendingOrderId');
      
      if (orderNumber && !statusSynced) {
        syncPaymentStatus(pendingPaymentId, orderNumber);
      }
    } else {
      console.log('ℹ️ PaymentId не найден в localStorage - заказ без онлайн оплаты или localStorage пуст');
    }
  }, [clearCart, orderNumber, statusSynced]);

  const syncPaymentStatus = async (paymentId: string, orderNumber: string) => {
    try {
      console.log('🔄 Синхронизируем статус платежа с ЮKassa...');
      setStatusSynced(true);

      const response = await fetch('/api/payments/sync-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          orderNumber 
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Статус платежа синхронизирован:', result.payment);
        
        if (result.payment.updated) {
          console.log('🎉 Статус в Strapi обновлен на paid!');
        }
      } else {
        console.error('❌ Ошибка синхронизации:', result.error);
      }
    } catch (error) {
      console.error('❌ Сетевая ошибка синхронизации:', error);
    }
  };

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