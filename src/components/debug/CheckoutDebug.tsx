// components/Debug/CheckoutDebug.tsx
'use client';

import React from 'react';

interface CheckoutDebugProps {
  checkout: any;
}

const CheckoutDebug: React.FC<CheckoutDebugProps> = ({ checkout }) => {
  const {
    items,
    deliveryOptions,
    subtotal,
    deliveryPrice,
    total,
    form,
    loading
  } = checkout;

  const selectedDeliveryMethod = form.watch('deliveryMethod');
  const selectedDelivery = deliveryOptions.find((opt: any) => opt.id === selectedDeliveryMethod);

  return (
    <div className="fixed top-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-xs z-50">
      <h3 className="font-bold text-green-400 mb-2">🔧 Отладка расчетов</h3>
      
      <div className="space-y-1">
        <div>📦 Товары: {items.length}</div>
        <div>🚚 Способов доставки: {deliveryOptions.length}</div>
        <div>⏳ Загрузка: {loading ? 'Да' : 'Нет'}</div>
        
        <hr className="border-gray-600 my-2" />
        
        <div>📋 Выбрано: {selectedDeliveryMethod}</div>
        <div>💰 Цена доставки: {selectedDelivery?.price || 'не найдено'}₽</div>
        <div>📦 Объект доставки: {selectedDelivery ? 'найден' : 'НЕ НАЙДЕН'}</div>
        
        <hr className="border-gray-600 my-2" />
        
        <div>💵 Подытог: {subtotal}₽</div>
        <div>🚚 Доставка: {deliveryPrice}₽</div>
        <div>💎 Итого: {total}₽</div>
        
        <hr className="border-gray-600 my-2" />
        
        <div className="text-yellow-300">
          🔍 Способы доставки:
        </div>
        {deliveryOptions.map((opt: any) => (
          <div key={opt.id} className="text-xs">
            • {opt.id}: {opt.price}₽
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckoutDebug;