// src/types/checkout.ts
import { CartItem } from './cart';

export interface CheckoutFormData {
  // Личные данные
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Адрес доставки
  region: string;
  city: string;
  address: string;
  postalCode: string;
  
  // Получатель (если отличается)
  recipientFirstName: string;
  recipientLastName: string;
  recipientPhone: string;
  
  // Способ доставки
  deliveryMethod: DeliveryMethod;
  
  // Способ оплаты
  paymentMethod: PaymentMethod;
}

export type DeliveryMethod = 
  | 'store_pickup'     // Доставить в магазин TS
  | 'courier_ts'       // Доставка курьером TS
  | 'cdek_pickup'      // СДЭК - доставка до пункта выдачи
  | 'cdek_courier'     // СДЭК - доставка курьером
  | 'post_russia'      // Почта России
  | 'boxberry';        // BoxBerry

export type PaymentMethod = 
  | 'card'             // Оплата картой (МИР, VIZA, MasterCard)
  | 'cash_vladivostok';// Оплата наличными в городе Владивосток

export interface DeliveryOption {
  id: DeliveryMethod;
  name: string;
  description?: string;
  price: number; // ✅ Убрал знак вопроса - цена обязательна
  estimatedDays?: string;
}

export interface PaymentOption {
  id: PaymentMethod;
  name: string;
  description?: string;
}

export interface OrderSummaryData {
  items: CartItem[];
  subtotal: number;
  deliveryPrice: number;
  promoDiscount: number;
  total: number;
  estimatedDelivery: string;
}

export interface PromoCode {
  code: string;
  discount: number; // в рублях или процентах
  type: 'amount' | 'percentage' | 'free_shipping'; // ✅ Добавил 'free_shipping'
}

// ✅ НОВЫЙ ТИП - добавьте эту строку
export interface AppliedPromoCode extends PromoCode {
  appliedDiscount: number; // реальная скидка в рублях
}