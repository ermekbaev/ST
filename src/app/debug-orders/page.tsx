'use client'
import React, { useState, useEffect } from 'react';

const DebugOrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Необходима авторизация для просмотра заказов');
        setLoading(false);
        return;
      }

      console.log('🔄 Загружаем заказы для отладки...');

      const response = await fetch('/api/user/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка загрузки заказов');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Ошибка получения данных');
      }

      console.log('📦 Полученные данные:', data);

      setOrders(data.orders || []);
      setDebugInfo(data.debug);

    } catch (error) {
      console.error('❌ Ошибка загрузки заказов:', error);
      setError(error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Загрузка отладочной информации...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Ошибка: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 text-black">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔍 Отладка истории заказов</h1>
        
        {/* ОБЩАЯ СТАТИСТИКА */}
        {debugInfo && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">📊 Общая статистика</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-100 p-4 rounded">
                <div className="text-2xl font-bold text-green-800">{debugInfo.ordersWithImages}</div>
                <div className="text-green-600">Заказов с фото</div>
              </div>
              <div className="bg-yellow-100 p-4 rounded">
                <div className="text-2xl font-bold text-yellow-800">{debugInfo.ordersWithPlaceholders}</div>
                <div className="text-yellow-600">С placeholder</div>
              </div>
              <div className="bg-red-100 p-4 rounded">
                <div className="text-2xl font-bold text-red-800">{debugInfo.ordersWithoutItems}</div>
                <div className="text-red-600">Без товаров</div>
              </div>
            </div>
          </div>
        )}

        {/* КНОПКА ПЕРЕЗАГРУЗКИ */}
        <button 
          onClick={loadOrders}
          className="mb-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          🔄 Перезагрузить данные
        </button>

        {/* СПИСОК ЗАКАЗОВ */}
        <div className="space-y-4">
          {orders.map((order, index) => (
            <div key={order.id} className="bg-white p-6 rounded-lg shadow">
              
              {/* ЗАГОЛОВОК ЗАКАЗА */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    Заказ #{order.orderNumber}
                  </h3>
                  <p className="text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">{order.totalAmount.toLocaleString()} ₽</div>
                  <div className="text-sm text-gray-600">{order.orderStatus} / {order.paymentStatus}</div>
                </div>
              </div>

              {/* ОТЛАДОЧНАЯ ИНФОРМАЦИЯ */}
              <div className="bg-gray-100 p-4 rounded mb-4">
                <h4 className="font-semibold mb-2">🔧 Debug информация:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Order Item найден:</strong> {order.debug?.orderItemFound ? '✅ Да' : '❌ Нет'}
                  </div>
                  <div>
                    <strong>Источник изображения:</strong> {order.debug?.imageSource || 'не определен'}
                  </div>
                  <div>
                    <strong>Product ID:</strong> {order.debug?.productId || 'нет'}
                  </div>
                  <div>
                    <strong>Связанный продукт:</strong> {order.debug?.hasLinkedProduct ? '✅ Да' : '❌ Нет'}
                  </div>
                </div>
              </div>

              {/* ТОВАРЫ */}
              <div>
                <h4 className="font-semibold mb-2">🛍️ Товары ({order.items.length}):</h4>
                {order.items.length > 0 ? (
                  <div className="space-y-2">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
                        
                        {/* ИЗОБРАЖЕНИЕ */}
                        <div className="w-20 h-20 bg-white border rounded overflow-hidden flex-shrink-0">
                          {item.productImage && item.productImage !== '/api/placeholder/98/50' ? (
                            <img 
                              src={item.productImage} 
                              alt={item.productName}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                console.error(`❌ Ошибка загрузки изображения для ${item.productName}:`, item.productImage);
                                (e.target as HTMLImageElement).src = '/api/placeholder/98/50';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                              Нет фото
                            </div>
                          )}
                        </div>

                        {/* ИНФОРМАЦИЯ О ТОВАРЕ */}
                        <div className="flex-grow">
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-sm text-gray-600">
                            Размер: {item.size} | Количество: {item.quantity} | Цена: {item.priceAtTime} ₽
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            <strong>URL изображения:</strong> {item.productImage}
                          </div>
                        </div>

                        {/* СТАТУС ИЗОБРАЖЕНИЯ */}
                        <div className="flex-shrink-0">
                          {item.productImage === '/api/placeholder/98/50' ? (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                              Placeholder
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                              Реальное фото
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">Товары не найдены</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Заказы не найдены
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugOrderHistoryPage;