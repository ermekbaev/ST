import { DeliveryMethod } from '@/types/checkout';

export interface DeliveryInfo {
  price: number;
  estimatedDays: string;
  description?: string;
}

export const calculateDelivery = (method: DeliveryMethod, city: string = ''): DeliveryInfo => {
  const isVladivostok = city.toLowerCase().includes('владивосток');
  
  switch (method) {
    case 'store_pickup':
      return {
        price: 0,
        estimatedDays: isVladivostok ? '1-2 дня' : '5-7 дней',
        description: 'Самовывоз из магазина'
      };
      
    case 'courier_ts':
      return {
        price: isVladivostok ? 0 : 500,
        estimatedDays: isVladivostok ? '1-2 дня' : '5-7 дней',
        description: 'Доставка курьером магазина'
      };
      
    case 'cdek_pickup':
      return {
        price: 300,
        estimatedDays: '3-5 дней',
        description: 'СДЭК до пункта выдачи'
      };
      
    case 'cdek_courier':
      return {
        price: 500,
        estimatedDays: '3-5 дней',
        description: 'СДЭК курьером до двери'
      };
      
    case 'post_russia':
      return {
        price: 250,
        estimatedDays: '7-14 дней',
        description: 'Почта России'
      };
      
    case 'boxberry':
      return {
        price: 350,
        estimatedDays: '4-6 дней',
        description: 'BoxBerry до пункта выдачи'
      };
      
    default:
      return {
        price: 0,
        estimatedDays: 'Не определено',
        description: 'Способ доставки не выбран'
      };
  }
};

export const getEstimatedDeliveryDate = (days: string): string => {
  const today = new Date();
  const match = days.match(/(\d+)-(\d+)/);
  
  if (match) {
    const minDays = parseInt(match[1]);
    const maxDays = parseInt(match[2]);
    
    const minDate = new Date(today);
    const maxDate = new Date(today);
    
    minDate.setDate(today.getDate() + minDays);
    maxDate.setDate(today.getDate() + maxDays);
    
    const minFormatted = minDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    const maxFormatted = maxDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    
    return `${minFormatted} - ${maxFormatted}`;
  }
  
  return 'Дата не определена';
};