import { DeliveryOption, PaymentOption } from '@/types/checkout';

export const useDeliveryOptions = () => {
  const deliveryOptions: DeliveryOption[] = [
    {
      id: 'store_pickup',
      name: 'Доставить в магазин TS',
      price: 0,
      estimatedDays: '5-7 дней'
    },
    {
      id: 'courier_ts',
      name: 'Доставка курьером TS',
      price: 0,
      estimatedDays: '5-7 дней'
    },
    {
      id: 'cdek_pickup',
      name: 'СДЭК - доставка до пункта выдачи',
      price: 300,
      estimatedDays: '3-5 дней'
    },
    {
      id: 'cdek_courier',
      name: 'СДЭК - доставка курьером',
      price: 500,
      estimatedDays: '3-5 дней'
    },
    {
      id: 'post_russia',
      name: 'Почта России',
      price: 250,
      estimatedDays: '7-14 дней'
    },
    {
      id: 'boxberry',
      name: 'BoxBerry',
      price: 350,
      estimatedDays: '4-6 дней'
    }
  ];

  const paymentOptions: PaymentOption[] = [
    {
      id: 'card',
      name: 'Оплата картой (МИР, VIZA, MasterCard)',
    },
    {
      id: 'cash_vladivostok',
      name: 'Оплата наличными в городе Владивосток',
    }
  ];

  return {
    deliveryOptions,
    paymentOptions,
  };
};