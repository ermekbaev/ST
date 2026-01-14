export interface CreatePaymentData {
  amount: number;
  orderId: string;
  customerEmail?: string;
  customerPhone: string;
  description?: string;
  returnUrl?: string;
  paymentMethodType?: 'card' | 'sbp' | 'tinkoff_bank' | 'installments';
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  confirmationUrl?: string;
  status?: string;
  error?: string;
  details?: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  payment?: {
    id: string;
    status: string;
    amount: {
      value: string;
      currency: string;
    };
    metadata?: Record<string, string>;
    paid: boolean;
    created_at: string;
  };
  error?: string;
}

export const createPayment = async (data: CreatePaymentData): Promise<PaymentResponse> => {
  try {
    
    const response = await fetch('/api/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Ошибка создания платежа:', result);
      return {
        success: false,
        error: result.error || 'Ошибка создания платежа'
      };
    }

    return result;

  } catch (error) {
    console.error('❌ Сетевая ошибка при создании платежа:', error);
    return {
      success: false,
      error: 'Ошибка соединения с сервером'
    };
  }
};

export const checkPaymentStatus = async (paymentId: string): Promise<PaymentStatusResponse> => {
  try {
    const response = await fetch(`/api/payments/status?paymentId=${paymentId}`);
    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Ошибка проверки статуса:', result);
      return {
        success: false,
        error: result.error || 'Ошибка проверки статуса'
      };
    }

    return result;

  } catch (error) {
    console.error('❌ Сетевая ошибка при проверке статуса:', error);
    return {
      success: false,
      error: 'Ошибка соединения с сервером'
    };
  }
};

export const refundPayment = async (paymentId: string, amount?: number, reason?: string) => {
  try {
    const response = await fetch('/api/payments/refund', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentId,
        amount,
        reason: reason || 'Возврат по запросу клиента'
      })
    });

    return await response.json();

  } catch (error) {
    console.error('❌ Ошибка возврата:', error);
    return {
      success: false,
      error: 'Ошибка создания возврата'
    };
  }
};

export const formatAmount = (amount: number): string => {
  return (amount / 100).toFixed(2);
};

export const amountToKopecks = (rubles: number): number => {
  return Math.round(rubles * 100);
};

export const isPaymentSuccessful = (status: string): boolean => {
  return status === 'succeeded';
};

export const isPaymentPending = (status: string): boolean => {
  return status === 'pending' || status === 'waiting_for_capture';
};

export const isPaymentCanceled = (status: string): boolean => {
  return status === 'canceled';
};

export const getPaymentStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'Ожидает оплаты',
    waiting_for_capture: 'Ожидает подтверждения',
    succeeded: 'Успешно оплачен',
    canceled: 'Отменен'
  };

  return statusMap[status] || 'Неизвестный статус';
};

export const formatCartItemsForPayment = (cartItems: any[]): CreatePaymentData['items'] => {
  return cartItems.map(item => ({
    name: item.name || `${item.brand} ${item.model}`.trim() || 'Товар',
    quantity: item.quantity || 1,
    price: item.price || 0
  }));
};