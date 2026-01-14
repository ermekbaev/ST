import { NextRequest, NextResponse } from 'next/server';
import { YooCheckout, ICreatePayment } from '@a2seven/yoo-checkout';

const checkout = new YooCheckout({
  shopId: process.env.YUKASSA_SHOP_ID!,
  secretKey: process.env.YUKASSA_SECRET_KEY!,
});

interface CreatePaymentRequest {
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

// Маппинг методов оплаты на типы YooKassa
function getYooKassaPaymentMethod(method?: string): string {
  const methodMap: Record<string, string> = {
    'card': 'bank_card',
    'sbp': 'sbp',
    'tinkoff_bank': 'tinkoff_bank',
    'installments': 'sber_loan'  // Сбер - оплата частями
  };
  return methodMap[method || 'card'] || 'bank_card';
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  
  if (digits.startsWith('8')) {
    return '7' + digits.slice(1);
  }
  
  if (digits.startsWith('7')) {
    return digits;
  }
  
  if (digits.length === 10) {
    return '7' + digits;
  }
  
  return digits;
}

export async function POST(request: NextRequest) {
  try {
    
    const body: CreatePaymentRequest = await request.json();
    const { amount, orderId, customerEmail, customerPhone, description, returnUrl, paymentMethodType, items } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Некорректная сумма платежа'
      }, { status: 400 });
    }

    if (!orderId) {
      return NextResponse.json({
        success: false,
        error: 'ID заказа обязателен'
      }, { status: 400 });
    }

    if (!customerPhone) {
      return NextResponse.json({
        success: false,
        error: 'Телефон клиента обязателен'
      }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(customerPhone);

    const receiptItems = items ? items.map(item => ({
      description: item.name,
      quantity: item.quantity.toString(),
      amount: {
        value: (item.price * item.quantity).toFixed(2),
        currency: 'RUB'
      },
      vat_code: 1, 
      payment_mode: 'full_payment' as const,
      payment_subject: 'commodity' as const
    })) : [{
      description: description || `Заказ #${orderId}`,
      quantity: '1.00',
      amount: {
        value: amount.toFixed(2),
        currency: 'RUB'
      },
      vat_code: 1,
      payment_mode: 'full_payment' as const,
      payment_subject: 'commodity' as const
    }];

    const yooKassaMethod = getYooKassaPaymentMethod(paymentMethodType);

    const createPayload: ICreatePayment = {
      amount: {
        value: amount.toFixed(2),
        currency: 'RUB'
      },
      payment_method_data: {
        type: yooKassaMethod as any
      },
      confirmation: {
        type: 'redirect',
        return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/order-success?orderNumber=${orderId}`
      },
      description: description || `Оплата заказа #${orderId} в Tigr Shop`,
      metadata: {
        order_id: orderId,
        customer_email: customerEmail || '',
        customer_phone: normalizedPhone, 
        source: 'tigr_shop'
      },
      receipt: {
        customer: {
          email: customerEmail,
          phone: normalizedPhone 
        },
        items: receiptItems
      },
      capture: true, 
      save_payment_method: false 
    };

    const payment = await checkout.createPayment(createPayload);

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      confirmationUrl: payment.confirmation?.confirmation_url,
      status: payment.status,
      amount: payment.amount
    });

  } catch (error: any) {
    console.error('❌ ЮKassa: Ошибка создания платежа:', error);
    
    let errorMessage = 'Ошибка создания платежа';
    
    if (error.response?.data) {
      const yukassaError = error.response.data;
      if (yukassaError.description) {
        errorMessage = yukassaError.description;
      } else if (yukassaError.error) {
        errorMessage = yukassaError.error;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    }, { status: 500 });
  }
}