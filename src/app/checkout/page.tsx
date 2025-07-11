'use client';

import React from 'react';
import { useCart } from '@/contexts/CartContext';

export default function CheckoutPage() {
  const { items, getTotalPrice } = useCart();

  return (
    <div className="min-h-screen bg-[#E5DDD4] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Оформление заказа</h1>
        
        {/* Отладочная информация */}
        <div className="bg-white p-4 rounded mb-6">
          <p><strong>Товаров в корзине:</strong> {items?.length || 0}</p>
          <p><strong>Общая сумма:</strong> {getTotalPrice ? getTotalPrice().toLocaleString('ru-RU') : 0} ₽</p>
        </div>
        
        {!items || items.length === 0 ? (
          <div className="bg-white p-8 rounded shadow text-center">
            <h2 className="text-xl mb-4">Корзина пуста</h2>
            <p className="text-gray-600 mb-6">Добавьте товары в корзину для оформления заказа</p>
            <a 
              href="/" 
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
            >
              Перейти к покупкам
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Левая колонка - Форма */}
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-semibold mb-4">Данные для заказа</h2>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Имя, фамилия</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border rounded"
                    placeholder="Введите имя и фамилию"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input 
                    type="email" 
                    className="w-full p-3 border rounded"
                    placeholder="Введите email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Телефон</label>
                  <input 
                    type="tel" 
                    className="w-full p-3 border rounded"
                    placeholder="Введите телефон"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Адрес доставки</label>
                  <textarea 
                    className="w-full p-3 border rounded"
                    rows={3}
                    placeholder="Введите полный адрес доставки"
                  />
                </div>
              </form>
            </div>
            
            {/* Правая колонка - Сводка заказа */}
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-semibold mb-4">Ваш заказ</h2>
              
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="border-b pb-4">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">Размер: {item.size}</p>
                    <p className="text-sm text-gray-600">Количество: {item.quantity}</p>
                    <p className="font-semibold">{(item.price * item.quantity).toLocaleString('ru-RU')} ₽</p>
                  </div>
                ))}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Итого:</span>
                    <span>{getTotalPrice().toLocaleString('ru-RU')} ₽</span>
                  </div>
                </div>
                
                <button className="w-full bg-black text-white py-3 rounded hover:bg-gray-800">
                  ОФОРМИТЬ ЗАКАЗ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}