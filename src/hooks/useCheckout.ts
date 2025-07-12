import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCart } from '@/contexts/CartContext';

// Простой интерфейс для формы
interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  region: string;
  city: string;
  address: string;
  postalCode: string;
  recipientFirstName: string;
  recipientLastName: string;
  recipientPhone: string;
  deliveryMethod: string;
  paymentMethod: string;
}

// Простой расчет доставки
const calculateDeliveryPrice = (method: string, city: string = ''): number => {
  const isVladivostok = city.toLowerCase().includes('владивосток');
  
  switch (method) {
    case 'store_pickup':
    case 'courier_ts':
      return isVladivostok ? 0 : 500;
    case 'cdek_pickup':
      return 300;
    case 'cdek_courier':
      return 500;
    case 'post_russia':
      return 250;
    case 'boxberry':
      return 350;
    default:
      return 0;
  }
};

export const useCheckout = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CheckoutFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      region: '',
      city: '',
      address: '',
      postalCode: '',
      recipientFirstName: '',
      recipientLastName: '',
      recipientPhone: '',
      deliveryMethod: 'store_pickup',
      paymentMethod: 'card',
    },
    mode: 'onChange'
  });

  // Применение промокода
  const applyPromoCode = (code: string) => {
    const validPromoCodes: Record<string, { discount: number; type: 'amount' | 'percentage' }> = {
      'SAVE500': { discount: 500, type: 'amount' },
      'SAVE10': { discount: 10, type: 'percentage' },
    };

    const promo = validPromoCodes[code];
    if (promo) {
      const subtotal = getTotalPrice();
      const discount = promo.type === 'amount' 
        ? promo.discount 
        : Math.round(subtotal * promo.discount / 100);
      
      setPromoDiscount(discount);
      setPromoCode(code);
      return true;
    }
    return false;
  };

  // Отслеживание изменения способа доставки и города
  const watchedDeliveryMethod = form.watch('deliveryMethod');
  const watchedCity = form.watch('city');
  
  useEffect(() => {
    const price = calculateDeliveryPrice(watchedDeliveryMethod, watchedCity);
    setDeliveryPrice(price);
  }, [watchedDeliveryMethod, watchedCity]);

  // Подсчет итоговой стоимости
  const subtotal = getTotalPrice();
  const total = Math.max(0, subtotal + deliveryPrice - promoDiscount);

  // Оформление заказа
  const submitOrder = async (data: CheckoutFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Submitting order:', data);
      
      const orderData = {
        ...data,
        items,
        subtotal,
        deliveryPrice,
        promoDiscount,
        total,
        promoCode,
        orderDate: new Date().toISOString(),
      };

      // Симуляция отправки
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Сохраняем данные заказа для страницы успеха
      localStorage.setItem('lastOrder', JSON.stringify(orderData));
      
      // Очищаем корзину
      clearCart();
      
      // Переход на страницу успеха
      window.location.href = '/order-success';
      
    } catch (error) {
      console.error('Ошибка при оформлении заказа:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Отладочная информация
  console.log('useCheckout - form values:', form.watch());
  console.log('useCheckout - deliveryMethod:', form.watch('deliveryMethod'));
  console.log('useCheckout - paymentMethod:', form.watch('paymentMethod'));

  return {
    form,
    items,
    subtotal,
    deliveryPrice,
    promoDiscount,
    total,
    promoCode,
    isSubmitting,
    applyPromoCode,
    submitOrder,
  };
};