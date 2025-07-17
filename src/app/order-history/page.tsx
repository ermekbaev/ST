'use client'
import React from 'react';
import { Order } from '@/types/orders';
import OrderCard from '@/components/Orders/OrderCard';

// Моковые данные заказов
const mockOrders: Order[] = [
  {
    id: 'TS-127702',
    date: '25.04.2025',
    status: 'принят, ожидается оплата',
    total: '15 600 ₽',
    items: [
      {
        id: '1',
        productName: 'Название товара',
        quantity: 1,
        image: '/api/placeholder/98/50'
      }
    ],
    deliveryDetails: {
      name: 'Имя',
      address: 'Адрес адрес адрес адрес адрес адрес адрес адрес адрес',
      email: 'Почта почта'
    },
    deliveryMethod: 'Дата и время',
    paymentMethod: 'оплата картой',
    notes: '',
    orderTime: 'Дата и время',
    canPay: true
  },
  {
    id: 'TS-127702',
    date: '20.04.2025',
    status: 'принята оплата',
    total: '15 600 ₽',
    items: [
      {
        id: '2',
        productName: 'Название товара',
        quantity: 1,
        image: '/api/placeholder/98/50'
      }
    ],
    deliveryDetails: {
      name: 'Имя',
      address: 'Адрес адрес адрес адрес адрес адрес адрес адрес адрес',
      email: 'Почта почта'
    },
    deliveryMethod: 'Дата и время',
    paymentMethod: 'оплата картой',
    notes: '',
    orderTime: 'Дата и время',
    canPay: false
  }
];

const OrderHistoryPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Контейнер страницы с отступами по 20px */}
      <div className="px-5 lg:px-5 pb-8 lg:pb-12">
        
        {/* Заголовок с линией */}
        <div className="mb-8 pt-8">
          <div className="relative flex items-center">
            {/* Заголовок "ИСТОРИЯ ЗАКАЗОВ" */}
            <h1 className="order-history-page-title">
              ИСТОРИЯ ЗАКАЗОВ
            </h1>
            
            {/* Линия справа от заголовка - только на десктопе */}
            <div className="order-history-page-line"></div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="mt-[50px] lg:mt-[70px]">
          
          {/* Список заказов */}
          <div className="space-y-0">
            {mockOrders.map((order, index) => (
              <OrderCard key={`${order.id}-${index}`} order={order} index={index} />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderHistoryPage;