export interface OrderItem {
  productId: string;
  productName: string;
  size: string;
  quantity: number;
  priceAtTime: number;
}

export interface CreateOrderData {
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  deliveryMethod: string;
  paymentMethod: string;
  deliveryAddress?: string;
  notes?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  error?: string;
  details?: string;
}

export const createOrder = async (orderData: CreateOrderData): Promise<CreateOrderResponse> => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}) 
      },
      body: JSON.stringify(orderData)
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        orderId: data.orderId,
        orderNumber: data.orderNumber
      };
    } else {
      console.error('❌ Ошибка создания заказа:', data);
      return {
        success: false,
        error: data.error || 'Ошибка создания заказа',
        details: data.details
      };
    }

  } catch (error) {
    console.error('❌ Ошибка сети:', error);
    return {
      success: false,
      error: 'Ошибка подключения к серверу',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    };
  }
};

export const formatCheckoutDataForAPI = (
  formData: any,
  cartItems: any[],
  totalAmount: number
): CreateOrderData => {
  return {
    customerInfo: {
      name: formData.firstName || '',
      phone: formData.phone || '',
      email: formData.email || undefined,
    },
    items: cartItems.map(item => ({
      productId: item.id || item.article || 'UNKNOWN',
      productName: item.name || `${item.brand} ${item.name}`.trim() || 'Товар без названия',
      size: item.size || 'ONE SIZE',
      quantity: item.quantity || 1,
      priceAtTime: item.price || 0
    })),
    totalAmount: totalAmount,
    deliveryMethod: formData.deliveryMethod || 'store_pickup',
    paymentMethod: formData.paymentMethod || 'cash_vladivostok',
    deliveryAddress: formData.address || '',
    notes: formData.notes || ''
  };
};