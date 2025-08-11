import React, { useState } from 'react';
import { ExtendedOrder } from '@/types/orders';

interface OrderCardProps {
  order: ExtendedOrder;
  index: number;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Состояние для оплаты
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const getProductImage = () => {
    if (imageError) {
      return '/api/placeholder/98/50';
    }
    return order.items[0]?.image || '/api/placeholder/98/50';
  };

  // Определяем, можно ли оплатить заказ
  const canPayOrder = () => {
    // Отладочная информация
    console.log('🔍 Проверка возможности оплаты для заказа:', {
      orderNumber: order.orderNumber || order.id,
      canPay: order.canPay,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      paymentMethod: order.paymentMethod
    });

    // Используем поле canPay, если оно есть (из API)
    if (order.canPay !== undefined) {
      console.log('✅ Используем canPay из API:', order.canPay);
      return order.canPay;
    }
    
    // Проверяем по реальным данным из API
    const canPay = (
      order.paymentStatus === 'pending' && // оплата не завершена
      order.orderStatus === 'pending' &&   // заказ еще в обработке
      order.paymentMethod === 'card'        // карточная оплата
    );
    
    console.log('🔄 Используем fallback логику:', canPay);
    return canPay;
  };

  // Функция оплаты
  const handlePaymentClick = async () => {
    if (isPaymentProcessing) return;
    
    setIsPaymentProcessing(true);
    setPaymentError(null);

    try {
      console.log(`💳 Инициируем повторную оплату заказа ${order.orderNumber || order.id}`);

      // Получаем токен
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Необходима авторизация');
      }

      // Отправляем запрос на создание платежа
      const response = await fetch('/api/payments/retry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderNumber: order.orderNumber || order.id,
          returnUrl: `${window.location.origin}/order-history?payment=retry&orderNumber=${order.orderNumber || order.id}`
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Ошибка создания платежа');
      }

      if (!data.confirmationUrl) {
        throw new Error('Не получена ссылка для оплаты');
      }

      console.log('✅ Повторный платеж создан, перенаправляем...');

      // Сохраняем информацию о платеже для отслеживания
      if (data.paymentId) {
        localStorage.setItem('retryPaymentId', data.paymentId);
        localStorage.setItem('retryOrderNumber', order.orderNumber || order.id);
        localStorage.setItem('paymentStartTime', Date.now().toString());
      }

      // Перенаправляем на YooKassa
      window.location.href = data.confirmationUrl;

    } catch (error) {
      console.error('❌ Ошибка повторной оплаты:', error);
      setPaymentError(error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  // Получаем текст кнопки
  const getPaymentButtonText = () => {
    if (isPaymentProcessing) return 'ОБРАБОТКА...';
    if (order.paymentStatus === 'failed') return 'ПОВТОРИТЬ ОПЛАТУ';
    return 'ОПЛАТИТЬ';
  };

  return (
    <div className="border-b-2 border-[#E5DDD4] last:border-b-0">
      
      {/* DESKTOP ВЕРСИЯ */}
      <div className="hidden lg:block">
        
        {/* Основная строка заказа - 4 колонки */}
        <div className="grid grid-cols-4 gap-8 py-8 items-start">
          
          {/* Колонка 1: Номер заказа + Фото */}
          <div className="flex flex-col space-y-4">
            <div className="text-[20px] leading-[30px] font-black italic text-black">
              {order.orderNumber || order.id}
            </div>
            
            {/* Фото товара */}
            <div className="w-[98px] h-[50px] bg-[#E5DDD4] flex items-center justify-center overflow-hidden rounded">
              <img 
                src={getProductImage()}
                alt={order.items[0]?.productName || 'Товар'}
                className="w-full h-full object-contain bg-white"
                onError={handleImageError}
              />
            </div>
          </div>

          {/* Колонка 2: Цена */}
          <div className="flex items-start">
            <div className="text-[20px] leading-[30px] font-black italic text-black">
              {order.total}
            </div>
          </div>

          {/* Колонка 3: Статус */}
          <div className="flex items-start">
            <div className="text-[20px] leading-[30px] font-black italic text-black uppercase">
              {order.status}
            </div>
          </div>

          {/* Колонка 4: Стрелка */}
          <div className="flex justify-end">
            <button 
              onClick={toggleExpansion}
              className="w-5 h-5 flex items-center justify-center"
            >
              <div 
                className="w-[19.85px] h-[19.85px] border-2 border-black transform transition-transform duration-300"
                style={{
                  transform: isExpanded ? 'rotate(45deg)' : 'rotate(-135deg)'
                }}
              />
            </button>
          </div>
        </div>

        {/* Детальная информация - раскрывающаяся */}
        <div 
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="grid grid-cols-4 gap-8 pb-8">
            
            {/* Колонка 1: Дата оформления + Товар */}
            <div className="space-y-4">
              <div>
                <div className="text-[20px] leading-[30px] font-black italic text-black">
                  Оформлен: {order.date}
                </div>
              </div>
              <div>
                <div className="text-[20px] leading-[27px] text-black">
                  {order.items[0]?.productName || 'Товар'} количество {order.items[0]?.quantity || 1}
                </div>
              </div>
            </div>

            {/* Колонка 2: Детали доставки */}
            <div>
              <div className="text-[20px] leading-[30px] font-black italic text-black uppercase mb-2">
                детали доставки
              </div>
              <div className="space-y-1">
                <div className="text-[15px] leading-[20px] text-[#8C8072]">
                  {order.deliveryDetails?.name || order.customerName}
                </div>
                <div className="text-[15px] leading-[20px] text-[#8C8072]">
                  {order.deliveryDetails?.address || order.deliveryAddress}
                </div>
                <div className="text-[15px] leading-[20px] text-[#8C8072]">
                  {order.deliveryDetails?.email || order.customerEmail}
                </div>
              </div>
            </div>

            {/* Колонка 3: Способ доставки + Кнопка оплаты */}
            <div className="space-y-4">
              <div>
                <div className="text-[20px] leading-[30px] font-black italic text-black uppercase mb-2">
                  способ доставки
                </div>
                <div className="text-[18px] leading-[24px] text-[#8C8072]">
                  {order.deliveryMethod}
                </div>
              </div>
              
              <div className="text-[18px] leading-[24px] text-[#8C8072]">
                Способ оплаты: {order.paymentMethod}
              </div>
              
              {/* Кнопка оплаты */}
              {canPayOrder() && (
                <div className="space-y-2">
                  <button 
                    onClick={handlePaymentClick}
                    disabled={isPaymentProcessing}
                    className={`w-[336px] h-[50px] text-white text-[20px] leading-[27px] transition-colors ${
                      isPaymentProcessing 
                        ? 'bg-gray-500 cursor-not-allowed' 
                        : 'bg-[#0B0B0D] hover:bg-gray-800'
                    }`}
                  >
                    {getPaymentButtonText()}
                  </button>
                  
                  {paymentError && (
                    <div className="text-red-500 text-[14px] leading-[18px]">
                      {paymentError}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Колонка 4: Примечание к заказу */}
            <div>
              <div className="text-[20px] leading-[30px] font-black italic text-black uppercase mb-2">
                примечание к заказу
              </div>
              <div className="text-[18px] leading-[24px] text-[#8C8072]">
                {order.notes || '—'}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* MOBILE ВЕРСИЯ */}
      <div className="block lg:hidden py-4">
        
        {/* ГЛАВНЫЙ БЛОК ДО ДЕТАЛЕЙ */}
        <div className="flex justify-between items-start mb-4">
          
          {/* ЛЕВЫЙ БЛОК: Номер заказа + Фото + Кнопка подробнее */}
          <div className="flex flex-col space-y-3">
            {/* Номер заказа */}
            <div className="text-[15px] leading-[22px] font-black italic text-black">
              {order.orderNumber || order.id}
            </div>
            
            {/* Фото товара */}
            <div className="w-[98px] h-[50px] bg-[#E5DDD4] flex items-center justify-center overflow-hidden rounded">
              <img 
                src={getProductImage()}
                alt={order.items[0]?.productName || 'Товар'}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            </div>
            
            {/* Кнопка "ПОДРОБНЕЕ" */}
            <button 
              onClick={toggleExpansion}
              className="text-[15px] leading-[22px] font-black italic text-[#BFB3A3] uppercase text-left"
            >
              ПОДРОБНЕЕ
            </button>
          </div>

          {/* ПРАВЫЙ БЛОК: Только статус заказа */}
          <div className="text-[10px] leading-[15px] font-black italic text-black uppercase max-w-[162px] text-right">
            {order.status}
          </div>
        </div>

        {/* ДЕТАЛИ (раскрывающиеся 5-6 блоков) */}
        <div 
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="space-y-4 pt-2">
            
            {/* БЛОК 1: Оформлен/дата + ИТОГО/цена */}
            <div className="space-y-2">
              {/* Оформлен + дата (flex justify-around) */}
              <div className="flex justify-between items-center">
                <span className="text-[15px] leading-[22px] font-black italic text-black">Оформлен:</span>
                <span className="text-[15px] leading-[22px] font-black italic text-black">{order.date}</span>
              </div>
              
              {/* ИТОГО + цена (flex justify-around) */}
              <div className="flex justify-between items-center">
                <span className="text-[15px] leading-[22px] font-black italic text-black">ИТОГО</span>
                <span className="text-[15px] leading-[22px] font-black italic text-black">{order.total}</span>
              </div>
            </div>

            {/* БЛОК 2: Название товара сверху + количество снизу */}
            <div>
              <div className="text-[15px] leading-[20px] text-black mb-1">
                {order.items[0]?.productName || 'Товар'}
              </div>
              <div className="text-[15px] leading-[20px] text-[#8C8072]">
                Количество {order.items[0]?.quantity || 1}
              </div>
            </div>

            {/* БЛОК 3: ДЕТАЛИ ДОСТАВКИ заголовок + имя/адрес/почта под ним */}
            <div>
              <div className="text-[15px] leading-[22px] font-black italic text-black uppercase mb-2">
                детали доставки
              </div>
              <div className="space-y-1">
                <div className="text-[10px] leading-[14px] text-[#8C8072] max-w-[300px]">
                  {order.deliveryDetails?.name || order.customerName}
                </div>
                <div className="text-[10px] leading-[14px] text-[#8C8072] max-w-[300px]">
                  {order.deliveryDetails?.address || order.deliveryAddress}
                </div>
                <div className="text-[10px] leading-[14px] text-[#8C8072] max-w-[300px]">
                  {order.deliveryDetails?.email || order.customerEmail}
                </div>
              </div>
            </div>

            {/* БЛОК 4: СПОСОБ ДОСТАВКИ заголовок + дата/время и способ оплаты под ним */}
            <div>
              <div className="text-[15px] leading-[22px] font-black italic text-black uppercase mb-2">
                способ доставки
              </div>
              <div className="space-y-1">
                <div className="text-[10px] leading-[14px] text-[#8C8072]">
                  {order.deliveryMethod}
                </div>
                <div className="text-[10px] leading-[14px] text-[#8C8072]">
                  Способ оплаты: {order.paymentMethod}
                </div>
              </div>
            </div>

            {/* БЛОК 5: ПРИМЕЧАНИЕ К ЗАКАЗУ заголовок + текст под ним */}
            <div>
              <div className="text-[15px] leading-[22px] font-black italic text-black uppercase mb-2">
                примечание к заказу
              </div>
              <div className="text-[10px] leading-[14px] text-[#8C8072] max-w-[300px]">
                {order.notes || '—'}
              </div>
            </div>

            {/* БЛОК 6: Кнопка ОПЛАТИТЬ */}
            {canPayOrder() && (
              <div className="pt-4 space-y-2">
                <button 
                  onClick={handlePaymentClick}
                  disabled={isPaymentProcessing}
                  className={`w-full h-[50px] text-white text-[20px] leading-[27px] transition-colors ${
                    isPaymentProcessing 
                      ? 'bg-gray-500 cursor-not-allowed' 
                      : 'bg-[#0B0B0D] hover:bg-gray-800'
                  }`}
                >
                  {getPaymentButtonText()}
                </button>
                
                {paymentError && (
                  <div className="text-red-500 text-[12px] leading-[16px] max-w-[300px]">
                    {paymentError}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderCard;