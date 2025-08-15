'use client'
import React, { useState, useEffect } from 'react';
import { ExtendedOrder } from '@/types/orders';
import OrderCard from '@/components/Orders/OrderCard';

const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<ExtendedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      const transformedOrders: ExtendedOrder[] = (data.orders || []).map((apiOrder: any) => {
        console.log(`🔄 Обрабатываем заказ ${apiOrder.orderNumber}: ${apiOrder.items.length} товаров`);
        
        return {
          id: apiOrder.orderNumber,
          orderNumber: apiOrder.orderNumber,
          date: new Date(apiOrder.createdAt).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }),
          status: getDisplayStatus(apiOrder.orderStatus, apiOrder.paymentStatus),
          total: `${apiOrder.totalAmount.toLocaleString('ru-RU')} ₽`,
          items: apiOrder.items.map((item: any) => ({
            id: item.id,
            productName: item.productName,
            quantity: item.quantity,
            size: item.size || 'ONE SIZE',
            price: item.priceAtTime,
            image: item.productImage || '/api/placeholder/98/50'
          })),
          deliveryDetails: {
            name: apiOrder.customerName || 'Пользователь',
            address: apiOrder.deliveryAddress || 'Адрес не указан',
            email: apiOrder.customerEmail || 'Email не указан'
          },
          deliveryMethod: getDeliveryMethodText(apiOrder.deliveryMethod),
          paymentMethod: getPaymentMethodText(apiOrder.paymentMethod),
          notes: apiOrder.notes || '',
          orderTime: new Date(apiOrder.createdAt).toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          canPay: apiOrder.orderStatus === 'pending' && apiOrder.paymentStatus === 'pending',
          paymentStatus: apiOrder.paymentStatus,
          orderStatus: apiOrder.orderStatus,
          customerName: apiOrder.customerName,
          customerEmail: apiOrder.customerEmail,
          deliveryAddress: apiOrder.deliveryAddress,
          totalItems: apiOrder.items.length
        };
      });

      setOrders(transformedOrders);
      
    } catch (err) {
      console.error('❌ Ошибка загрузки заказов:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const retryPaymentId = localStorage.getItem('retryPaymentId');
      const retryOrderNumber = localStorage.getItem('retryOrderNumber');
      const paymentStartTime = localStorage.getItem('paymentStartTime');
      
      if (retryPaymentId && retryOrderNumber && paymentStartTime) {
        const timeSincePayment = Date.now() - parseInt(paymentStartTime);
        
        if (timeSincePayment < 10 * 60 * 1000) {
          
          try {
            const response = await fetch(`/api/payments/status?paymentId=${retryPaymentId}`);
            const data = await response.json();
            
            if (data.success && data.payment) {
              
              if (data.payment.status === 'succeeded' && data.payment.paid) {
                
                await fetch('/api/payments/sync-status', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    paymentId: retryPaymentId,
                    orderNumber: retryOrderNumber
                  })
                });
                
                localStorage.removeItem('retryPaymentId');
                localStorage.removeItem('retryOrderNumber');
                localStorage.removeItem('paymentStartTime');
                
                loadOrders();
              }
            }
          } catch (error) {
            console.error('❌ Ошибка проверки статуса платежа:', error);
          }
        } else {
          localStorage.removeItem('retryPaymentId');
          localStorage.removeItem('retryOrderNumber');
          localStorage.removeItem('paymentStartTime');
        }
      }
    };

    const handleFocus = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentReturn = urlParams.get('payment');
      
      if (paymentReturn === 'retry' || document.referrer.includes('yoomoney.ru') || document.referrer.includes('yookassa.ru')) {
        console.log('↩️ Возврат с платежной системы - проверяем статус');
        checkPaymentStatus();
      }
    };

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'retry') {
      checkPaymentStatus();
      
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleOrderUpdate = () => {
    console.log('🔄 Запрошено обновление заказов');
    loadOrders();
  };

  const getDisplayStatus = (orderStatus: string, paymentStatus: string): string => {
    if (orderStatus === 'pending' && paymentStatus === 'pending') {
      return 'принят, ожидается оплата';
    }
    if (orderStatus === 'pending' && paymentStatus === 'paid') {
      return 'принята оплата';
    }
    
    const statusMap: { [key: string]: string } = {
      'pending': 'в обработке',
      'confirmed': 'подтвержден',
      'shipped': 'отправлен',
      'delivered': 'доставлен',
      'cancelled': 'отменен'
    };
    
    return statusMap[orderStatus] || orderStatus;
  };

  const getDeliveryMethodText = (method: string): string => {
    const methods: { [key: string]: string } = {
      'store_pickup': 'Самовывоз из магазина',
      'courier_ts': 'Курьер TS',
      'cdek_pickup': 'СДЭК до пункта выдачи',
      'cdek_courier': 'СДЭК курьером'
    };
    return methods[method] || method;
  };

  const getPaymentMethodText = (method: string): string => {
    const methods: { [key: string]: string } = {
      'card': 'Онлайн картой',
      'cash_vladivostok': 'Наличными во Владивостоке'
    };
    return methods[method] || method;
  };

  const handleRetry = () => {
    loadOrders(); 
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="px-5 lg:px-5 pb-8 lg:pb-12">
        
        {/* Заголовок */}
        <div className="mb-8 pt-8">
          <div className="relative flex items-center">
            <h1 className="order-history-page-title">
              ИСТОРИЯ ЗАКАЗОВ
            </h1>
            <div className="order-history-page-line"></div>
          </div>
        </div>

        {/* Контент */}
        <div className="mt-[50px] lg:mt-[70px]">
          
          {/* Загрузка */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="text-[20px] leading-[30px] font-black italic text-black">
                Загружаем ваши заказы...
              </div>
            </div>
          )}

          {/* Ошибка */}
          {error && (
            <div className="flex flex-col items-center py-20 space-y-4">
              <div className="text-[20px] leading-[30px] font-black italic text-red-600 text-center max-w-[400px]">
                {error}
              </div>
              
              {/* Дополнительная информация для ошибки авторизации */}
              {error.includes('авторизация') && (
                <div className="text-center space-y-2">
                  <div className="text-[14px] text-gray-600">
                    Войдите в аккаунт для просмотра истории заказов
                  </div>
                  <button 
                    onClick={() => window.location.href = '/'}
                    className="px-4 py-2 bg-blue-600 text-white text-[14px] rounded hover:bg-blue-700"
                  >
                    НА ГЛАВНУЮ
                  </button>
                </div>
              )}
              
              <button 
                onClick={handleRetry}
                className="px-6 py-3 bg-[#0B0B0D] text-white text-[16px] leading-[20px] hover:bg-gray-800 transition-colors"
              >
                ПОВТОРИТЬ ПОПЫТКУ
              </button>
            </div>
          )}

          {/* Пустой список */}
          {!loading && !error && orders.length === 0 && (
            <div className="flex justify-center items-center py-20">
              <div className="text-[20px] leading-[30px] font-black italic text-[#8C8072] text-center">
                У вас пока нет заказов
              </div>
            </div>
          )}

          {/* Список заказов */}
          {!loading && !error && orders.length > 0 && (
            <div className="space-y-0">
              {orders.map((order, index) => (
                <OrderCard 
                  key={`${order.id}-${index}`} 
                  order={order} 
                  index={index}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default OrderHistoryPage;