'use client';

import SuccessHero from '@/components/OrderSuccess/SuccessHero';
import React from 'react';

interface OrderSuccessPageProps {
  orderNumber?: string;
}

const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ orderNumber }) => {
  return (
    <div className="min-h-screen bg-white">
      <SuccessHero orderNumber={orderNumber} />
    </div>
  );
};

export default OrderSuccessPage;