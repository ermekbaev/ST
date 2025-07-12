'use client'
import React, { useState } from 'react';

const DebugCheckoutForm = () => {
  const [formData, setFormData] = useState({
    deliveryMethod: 'store_pickup',
    paymentMethod: 'card'
  });

  const deliveryOptions = [
    { id: 'store_pickup', name: 'Доставить в магазин TS', price: 0 },
    { id: 'courier_ts', name: 'Доставка курьером TS', price: 0 },
    { id: 'cdek_pickup', name: 'СДЭК - доставка до пункта выдачи', price: 300 },
    { id: 'cdek_courier', name: 'СДЭК - доставка курьером', price: 500 },
    { id: 'post_russia', name: 'Почта России', price: 250 },
    { id: 'boxberry', name: 'BoxBerry', price: 350 }
  ];

  const paymentOptions = [
    { id: 'card', name: 'Оплата картой (МИР, VIZA, MasterCard)' },
    { id: 'cash_vladivostok', name: 'Оплата наличными в городе Владивосток' }
  ];

  const handleDeliveryChange = (value) => {
    setFormData(prev => ({ ...prev, deliveryMethod: value }));
  };

  const handlePaymentChange = (value) => {
    setFormData(prev => ({ ...prev, paymentMethod: value }));
  };

  return (
    <div className="min-h-screen bg-[#E5DDD4] p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg">
        <h1 className="text-2xl font-bold mb-8">Отладка формы checkout</h1>
        
        {/* Отладочная информация */}
        <div className="bg-gray-100 p-4 rounded mb-8">
          <h3 className="font-bold">Текущие значения:</h3>
          <p>Доставка: {formData.deliveryMethod}</p>
          <p>Оплата: {formData.paymentMethod}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Способ доставки */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold">СПОСОБ ДОСТАВКИ</h2>
            
            <div className="space-y-3">
              {deliveryOptions.map((option) => (
                <label key={option.id} className="flex items-center gap-4 cursor-pointer p-2 hover:bg-gray-50 rounded">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value={option.id}
                    checked={formData.deliveryMethod === option.id}
                    onChange={(e) => handleDeliveryChange(e.target.value)}
                    className="sr-only"
                  />
                  <div 
                    className={`w-4 h-4 border border-black relative ${
                      formData.deliveryMethod === option.id 
                        ? 'bg-black' 
                        : 'bg-transparent'
                    }`}
                  >
                    {formData.deliveryMethod === option.id && (
                      <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs">
                        ✓
                      </span>
                    )}
                  </div>
                  <span className="text-base">
                    {option.name}
                    {option.price > 0 && ` (+${option.price.toLocaleString('ru-RU')} ₽)`}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Способ оплаты */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold">СПОСОБ ОПЛАТЫ</h2>
            
            <div className="space-y-3">
              {paymentOptions.map((option) => (
                <label key={option.id} className="flex items-center gap-4 cursor-pointer p-2 hover:bg-gray-50 rounded">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={option.id}
                    checked={formData.paymentMethod === option.id}
                    onChange={(e) => handlePaymentChange(e.target.value)}
                    className="sr-only"
                  />
                  <div 
                    className={`w-4 h-4 border border-black relative ${
                      formData.paymentMethod === option.id 
                        ? 'bg-black' 
                        : 'bg-transparent'
                    }`}
                  >
                    {formData.paymentMethod === option.id && (
                      <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs">
                        ✓
                      </span>
                    )}
                  </div>
                  <span className="text-base">{option.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Тест CSS классов */}
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-bold">Тест CSS классов:</h3>
          
          <div className="flex items-center gap-4">
            <div className="checkout-checkbox checkout-checkbox--checked"></div>
            <span>Выбранный чекбокс (CSS)</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="checkout-checkbox"></div>
            <span>Невыбранный чекбокс (CSS)</span>
          </div>
        </div>

        <style jsx>{`
          .checkout-checkbox {
            width: 15px;
            height: 15px;
            border: 1px solid #000000;
            background: transparent;
            cursor: pointer;
            position: relative;
          }

          .checkout-checkbox--checked {
            background: #000000;
          }

          .checkout-checkbox--checked::after {
            content: "✓";
            color: white;
            font-size: 10px;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
        `}</style>
      </div>
    </div>
  );
};

export default DebugCheckoutForm;