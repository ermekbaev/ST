import { NextRequest, NextResponse } from 'next/server';
import { YooCheckout, ICreatePayment } from '@a2seven/yoo-checkout';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL 

const checkout = new YooCheckout({
  shopId: process.env.YUKASSA_SHOP_ID!,
  secretKey: process.env.YUKASSA_SECRET_KEY!,
});

interface RetryPaymentRequest {
  orderNumber: string;  
  returnUrl?: string;   
}

export async function POST(request: NextRequest) {
  try {
    const body: RetryPaymentRequest = await request.json();
    
    if (!body.orderNumber) {
      return NextResponse.json({
        success: false,
        error: 'Номер заказа обязателен'
      }, { status: 400 });
    }

    const authHeader = request.headers.get('authorization');
    const userToken = authHeader?.replace('Bearer ', '') || null;
    
    let userId: string | null = null;
    if (userToken) {
      try {
        const userResponse = await fetch(`${STRAPI_URL}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          userId = userData.id.toString();
        }
      } catch (error) {
      }
    }

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Необходима авторизация'
      }, { status: 401 });
    }

    const orderResponse = await fetch(
      `${STRAPI_URL}/api/orders?filters[orderNumber][$eq]=${body.orderNumber}&filters[user][id][$eq]=${userId}&populate=*`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!orderResponse.ok) {
      console.error('❌ Ошибка поиска заказа:', orderResponse.status);
      return NextResponse.json({
        success: false,
        error: 'Ошибка поиска заказа'
      }, { status: 500 });
    }

    const orderData = await orderResponse.json();
    
    if (!orderData.data || orderData.data.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Заказ не найден'
      }, { status: 404 });
    }

    const order = orderData.data[0];
    
    if (order.paymentStatus === 'paid') {
      return NextResponse.json({
        success: false,
        error: 'Заказ уже оплачен'
      }, { status: 400 });
    }

    if (order.orderStatus === 'cancelled') {
      return NextResponse.json({
        success: false,
        error: 'Заказ отменен'
      }, { status: 400 });
    }

    const orderItemsResponse = await fetch(
      `${STRAPI_URL}/api/order-items?filters[orderId][$eq]=${order.id}&populate=*`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    let orderItems: any[] = [];
    if (orderItemsResponse.ok) {
      const orderItemsData = await orderItemsResponse.json();
      orderItems = orderItemsData.data || [];
    }

    const amount = parseFloat(order.totalAmount);
    
    const receiptItems = orderItems.length > 0 
      ? orderItems.map(item => ({
          description: item.productName || `Товар ${item.productId}`,
          quantity: (item.quantity || 1).toString(),
          amount: {
            value: parseFloat(item.priceAtTime || '0').toFixed(2),
            currency: 'RUB'
          },
          vat_code: 1,
          payment_mode: 'full_payment' as const,
          payment_subject: 'commodity' as const
        }))
      : [{
          description: `Заказ #${order.orderNumber}`,
          quantity: '1.00',
          amount: {
            value: amount.toFixed(2),
            currency: 'RUB'
          },
          vat_code: 1,
          payment_mode: 'full_payment' as const,
          payment_subject: 'commodity' as const
        }];

    const normalizePhone = (phone: string): string => {
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.startsWith('8')) return `7${cleaned.slice(1)}`;
      if (cleaned.startsWith('7')) return cleaned;
      return `7${cleaned}`;
    };

    const normalizedPhone = normalizePhone(order.customerPhone || '79999999999');

    const returnUrl = body.returnUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/order-success?orderNumber=${order.orderNumber}`;

    const createPayload: ICreatePayment = {
      amount: {
        value: amount.toFixed(2),
        currency: 'RUB'
      },
      payment_method_data: {
        type: 'bank_card'
      },
      confirmation: {
        type: 'redirect',
        return_url: returnUrl
      },
      description: `Доплата по заказу #${order.orderNumber} в Tigr Shop`,
      metadata: {
        order_id: order.id.toString(),
        order_number: order.orderNumber,
        customer_email: order.customerEmail || '',
        customer_phone: normalizedPhone,
        source: 'tigr_shop_retry',
        retry_payment: 'true'
      },
      receipt: {
        customer: {
          email: order.customerEmail || undefined,
          phone: normalizedPhone
        },
        items: receiptItems
      },
      capture: true,
      save_payment_method: false
    };

    const payment = await checkout.createPayment(createPayload);

    await updateOrderPaymentStatus(order.id, {
      paymentStatus: 'pending',
      paymentId: payment.id
    });

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      confirmationUrl: payment.confirmation?.confirmation_url,
      orderNumber: order.orderNumber,
      amount: amount
    });

  } catch (error: any) {
    console.error('❌ Ошибка создания повторного платежа:', error);
    
    let errorMessage = 'Ошибка создания платежа';
    
    if (error.response?.data?.description) {
      errorMessage = error.response.data.description;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

async function updateOrderPaymentStatus(orderId: string, updateData: {
  paymentStatus: string;
  paymentId: string;
}) {
  try {
    const response = await fetch(`${STRAPI_URL}/api/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: updateData
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ошибка обновления заказа:', response.status, errorText);
      return;
    }

    const result = await response.json();

  } catch (error) {
    console.error('❌ Ошибка обновления статуса платежа:', error);
  }
}