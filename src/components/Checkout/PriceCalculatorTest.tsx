// ============================================================================
// ТЕСТ: ИЗОЛИРОВАННЫЙ РАСЧЕТ ЦЕНЫ БЕЗ КОМПОНЕНТОВ
// ============================================================================

// Создайте файл: src/components/Test/PriceCalculatorTest.tsx
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

interface TestFormData {
  deliveryMethod: string;
  firstName: string;
  email: string;
}

const PriceCalculatorTest: React.FC = () => {
  const [externalDeliveryPrice, setExternalDeliveryPrice] = useState(0);

  // ✅ ПРОСТАЯ ФОРМА БЕЗ ЛИШНИХ ЗАВИСИМОСТЕЙ
  const form = useForm<TestFormData>({
    defaultValues: {
      deliveryMethod: 'store_pickup',
      firstName: '',
      email: ''
    }
  });

  const { register, watch, setValue } = form;

  // ✅ ЦЕНЫ ДОСТАВКИ
  const deliveryPrices: Record<string, number> = {
    'store_pickup': 0,
    'courier_ts': 0,
    'cdek_pickup': 300,
    'cdek_courier': 500,
    'post_russia': 250,
    'boxberry': 350
  };

  const selectedDelivery = watch('deliveryMethod');
  const firstName = watch('firstName');
  const email = watch('email');

  // ✅ АВТОМАТИЧЕСКИЙ РАСЧЕТ ЦЕНЫ
  const currentDeliveryPrice = deliveryPrices[selectedDelivery] || 0;

  // ✅ ОБРАБОТЧИК СМЕНЫ ДОСТАВКИ
  const handleDeliveryChange = (deliveryId: string) => {
    setValue('deliveryMethod', deliveryId);
    setExternalDeliveryPrice(deliveryPrices[deliveryId] || 0);
  };

  const deliveryOptions = [
    { id: 'store_pickup', name: 'Доставить в магазин TS', price: 0 },
    { id: 'courier_ts', name: 'Доставка курьером TS', price: 0 },
    { id: 'cdek_pickup', name: 'СДЭК - доставка до пункта выдачи', price: 300 },
    { id: 'cdek_courier', name: 'СДЭК - доставка курьером', price: 500 },
    { id: 'post_russia', name: 'Почта России', price: 250 },
    { id: 'boxberry', name: 'BoxBerry', price: 350 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        <h1 className="text-3xl font-bold mb-8 text-center">
          🧪 Тест изолированного расчета цены
        </h1>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* ========== ЛЕВАЯ КОЛОНКА - ФОРМА ========== */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-6">Форма</h2>
            
            {/* Поля ввода */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Имя:</label>
                <input
                  {...register('firstName')}
                  placeholder="Введите имя"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email:</label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="Введите email"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Способы доставки */}
            <div>
              <h3 className="text-lg font-medium mb-4">Способ доставки:</h3>
              <div className="space-y-3">
                {deliveryOptions.map((option) => (
                  <div 
                    key={option.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => handleDeliveryChange(option.id)}
                  >
                    {/* Радиобаттон */}
                    <div className={`w-5 h-5 border-2 border-gray-400 rounded-full flex items-center justify-center ${
                      selectedDelivery === option.id ? 'bg-blue-500 border-blue-500' : 'bg-white'
                    }`}>
                      {selectedDelivery === option.id && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    
                    {/* Скрытый input */}
                    <input
                      type="radio"
                      {...register('deliveryMethod')}
                      value={option.id}
                      className="sr-only"
                    />
                    
                    <span className="flex-1">
                      {option.name}
                      {option.price > 0 && ` (+${option.price} ₽)`}
                    </span>
                    
                    {selectedDelivery === option.id && (
                      <span className="text-green-600 text-sm font-medium">✓</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ========== ПРАВАЯ КОЛОНКА - ОТЛАДКА ========== */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-6">🔍 Отладка</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-2">📋 Данные формы:</h3>
                <div className="text-sm space-y-1">
                  <div><strong>Имя:</strong> "{firstName}"</div>
                  <div><strong>Email:</strong> "{email}"</div>
                  <div><strong>Доставка:</strong> {selectedDelivery}</div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded">
                <h3 className="font-medium mb-2">💰 Расчет цены:</h3>
                <div className="text-sm space-y-1">
                  <div><strong>Автоматический расчет:</strong> {currentDeliveryPrice} ₽</div>
                  <div><strong>Внешний расчет:</strong> {externalDeliveryPrice} ₽</div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded">
                <h3 className="font-medium mb-2">🧪 Тест:</h3>
                <div className="text-sm space-y-1">
                  <div>1. Введите имя и email</div>
                  <div>2. Выберите способ доставки с ценой</div>
                  <div>3. Проверьте: сбрасываются ли данные?</div>
                </div>
              </div>

              <div className="p-4 bg-red-50 rounded">
                <h3 className="font-medium mb-2">❌ Если данные сбрасываются:</h3>
                <div className="text-sm space-y-1">
                  <div>Проблема в react-hook-form</div>
                  <div>или в обработчике события</div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded">
                <h3 className="font-medium mb-2">✅ Если данные НЕ сбрасываются:</h3>
                <div className="text-sm space-y-1">
                  <div>Проблема в другом месте</div>
                  <div>(OrderSummary, другие хуки)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Инструкции */}
        <div className="mt-8 p-6 bg-gray-800 text-white rounded-lg">
          <h3 className="text-lg font-semibold mb-4">📋 Как тестировать:</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Введите имя: "Тест"</li>
            <li>Введите email: "test@test.com"</li>
            <li>Выберите "СДЭК - доставка до пункта выдачи" (300 ₽)</li>
            <li>Проверьте: остались ли "Тест" и "test@test.com" в полях?</li>
            <li>Если ДА - проблема в OrderSummary или других компонентах</li>
            <li>Если НЕТ - проблема в самой react-hook-form</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PriceCalculatorTest;

// ============================================================================
// КАК ИСПОЛЬЗОВАТЬ:
// ============================================================================

/*

📝 СОЗДАЙТЕ ТЕСТОВУЮ СТРАНИЦУ:

1. Создайте файл: src/app/test-price/page.tsx

```typescript
import PriceCalculatorTest from '@/components/Test/PriceCalculatorTest';

export default function TestPricePage() {
  return <PriceCalculatorTest />;
}
```

2. Перейдите на: /test-price

3. Протестируйте изолированно:
   - Введите данные в поля
   - Выберите способ доставки с ценой
   - Проверьте сбрасываются ли данные

🎯 РЕЗУЛЬТАТ ПОКАЖЕТ:

- Если в этом тесте данные НЕ сбрасываются = проблема в OrderSummary
- Если в этом тесте данные СБРАСЫВАЮТСЯ = проблема в react-hook-form

*/