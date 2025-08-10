import React, { useState } from 'react';
import { Order } from '@/types/orders';

interface OrderCardProps {
  order: Order;
  index: number;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  // Обработчик ошибки загрузки изображения
  const handleImageError = () => {
    setImageError(true);
  };

  // Получаем URL изображения товара
  const getProductImage = () => {
    if (imageError) {
      return '/api/placeholder/98/50';
    }
    return order.items[0]?.image || '/api/placeholder/98/50';
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
              {order.id}
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
                  {order.deliveryDetails.name}
                </div>
                <div className="text-[15px] leading-[20px] text-[#8C8072]">
                  {order.deliveryDetails.address}
                </div>
                <div className="text-[15px] leading-[20px] text-[#8C8072]">
                  {order.deliveryDetails.email}
                </div>
              </div>
            </div>

            {/* Колонка 3: Способ доставки + Дата и время + Способ оплаты */}
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
              
              {/* Кнопка оплатить */}
              {order.canPay && (
                <button className="w-[336px] h-[50px] bg-[#0B0B0D] text-white text-[20px] leading-[27px] hover:bg-gray-800 transition-colors">
                  ОПЛАТИТЬ
                </button>
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
              {order.id}
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
                  {order.deliveryDetails.name}
                </div>
                <div className="text-[10px] leading-[14px] text-[#8C8072] max-w-[300px]">
                  {order.deliveryDetails.address}
                </div>
                <div className="text-[10px] leading-[14px] text-[#8C8072] max-w-[300px]">
                  {order.deliveryDetails.email}
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

            {/* БЛОК 6: Кнопка ОПЛАТИТЬ (только если не оплачен) */}
            {order.canPay && (
              <div className="pt-4">
                <button className="w-full h-[50px] bg-[#0B0B0D] text-white text-[20px] leading-[27px] hover:bg-gray-800 transition-colors">
                  ОПЛАТИТЬ
                </button>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderCard;