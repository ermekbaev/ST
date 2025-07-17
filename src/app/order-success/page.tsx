'use client';

import SuccessHero from '@/components/OrderSuccess/SuccessHero';
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Компонент который использует useSearchParams
const OrderSuccessContent: React.FC = () => {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber') || undefined;

  return <SuccessHero orderNumber={orderNumber} />;
};

// Главный компонент с Suspense
const OrderSuccessPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <p className="font-product text-gray-600">Загрузка...</p>
          </div>
        </div>
      }>
        <OrderSuccessContent />
      </Suspense>
    </div>
  );
};

export default OrderSuccessPage;