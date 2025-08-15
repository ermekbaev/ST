export interface OrderItem {
  price: any;
  id: string;
  productName: string;
  quantity: number;
  image?: string;
  size?: string;
  priceAtTime?: number;
}

export interface DeliveryDetails {
  name: string;
  address: string;
  email: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  total: string;
  items: OrderItem[];
  
  // ✅ ДОБАВЛЕНО: Статусы оплаты и заказа
  paymentStatus: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  
  // ✅ ДОБАВЛЕНО: Информация о клиенте
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  
  // ✅ ДОБАВЛЕНО: Информация о доставке
  deliveryMethod: string;
  deliveryAddress?: string;
  notes?: string;
  
  // Детали доставки (для обратной совместимости)
  deliveryDetails?: {
    name: string;
    address: string;
    email: string;
  };
  
  // ✅ УСТАРЕВШЕЕ: оставляем для совместимости
  canPay?: boolean;
}

// ✅ ДОБАВЛЕНО: Интерфейс для ответа API пользовательских заказов
export interface UserOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  deliveryMethod: string;
  paymentMethod: string;
  deliveryAddress: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes: string;
  createdAt: string;
  items: OrderItem[];
}

// ✅ ДОБАВЛЕНО: Статусы для отображения
export const ORDER_STATUS_LABELS = {
  pending: 'Ожидает подтверждения',
  confirmed: 'Подтвержден',
  processing: 'В обработке', 
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменен'
};

export const PAYMENT_STATUS_LABELS = {
  pending: 'Ожидает оплаты',
  paid: 'Оплачен',
  failed: 'Ошибка оплаты',
  cancelled: 'Отменен',
  refunded: 'Возвращен'
};

export const DELIVERY_METHOD_LABELS = {
  store_pickup: 'Самовывоз из магазина',
  courier_ts: 'Курьер TS', 
  cdek_pickup: 'СДЭК до пункта выдачи',
  cdek_courier: 'СДЭК курьером'
};

export const PAYMENT_METHOD_LABELS = {
  card: 'Онлайн картой',
  cash_vladivostok: 'Наличными во Владивостоке'
};


// Расширенный интерфейс заказа для работы с API
export interface ExtendedOrder {
  id: string;
  orderNumber?: string;
  date: string;
  status: string;
  total: string;
  items: OrderItem[];
  deliveryDetails?: DeliveryDetails;
  deliveryMethod: string;
  paymentMethod: string;
  notes?: string;
  orderTime?: string;
  canPay?: boolean;
  // Дополнительные поля из API
  paymentStatus?: string;
  orderStatus?: string;
  customerName?: string;
  customerEmail?: string;
  deliveryAddress?: string;
}