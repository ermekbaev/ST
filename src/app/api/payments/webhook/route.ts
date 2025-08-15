import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;
const YUKASSA_WEBHOOK_SECRET = process.env.YUKASSA_WEBHOOK_SECRET;

interface YooKassaWebhookEvent {
  type: string;
  event: string;
  object: {
    id: string;
    status: string;
    amount: {
      value: string;
      currency: string;
    };
    metadata?: {
      order_id?: string;
      customer_email?: string;
      customer_phone?: string;
    };
    created_at: string;
    paid: boolean;
    test: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    
    const body = await request.text();
    const signature = request.headers.get('yookassa-signature');
    
    if (!verifyWebhookSignature(body, signature)) {
      console.error('❌ Неверная подпись webhook');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event: YooKassaWebhookEvent = JSON.parse(body);

    switch (event.event) {
      case 'payment.succeeded':
        await handlePaymentSucceeded(event.object);
        break;
        
      case 'payment.canceled':
        await handlePaymentCanceled(event.object);
        break;
        
      case 'payment.waiting_for_capture':
        await handlePaymentWaitingForCapture(event.object);
        break;
        
      case 'refund.succeeded':
        await handleRefundSucceeded(event.object);
        break;
        
      default:
        console.log(`ℹ️ Необработанное событие: ${event.event}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Ошибка обработки webhook ЮKassa:', error);
    return NextResponse.json({ 
      error: 'Webhook processing error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function verifyWebhookSignature(body: string, signature: string | null): boolean {
  if (!signature || !YUKASSA_WEBHOOK_SECRET) {
    console.warn('⚠️ Отсутствует подпись или секрет webhook');
    return false;
  }
  
  const hash = crypto
    .createHmac('sha256', YUKASSA_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');
    
  return hash === signature;
}

async function handlePaymentSucceeded(payment: YooKassaWebhookEvent['object']) {
  const orderId = payment.metadata?.order_id;
  
  if (!orderId) {
    console.error('❌ Отсутствует order_id в metadata платежа');
    return;
  }

  try {
    await updateOrderPaymentStatus(orderId, {
      paymentStatus: 'paid',
      paymentId: payment.id,
      paidAt: new Date().toISOString(),
      paymentAmount: parseFloat(payment.amount.value)
    });

    await sendAdminNotification(`💳 Получена оплата за заказ #${orderId}`, {
      orderId,
      paymentId: payment.id,
      amount: `${payment.amount.value} ${payment.amount.currency}`,
      customerPhone: payment.metadata?.customer_phone
    });

  } catch (error) {
    console.error('❌ Ошибка обработки успешного платежа:', error);
  }
}

async function handlePaymentCanceled(payment: YooKassaWebhookEvent['object']) {
  const orderId = payment.metadata?.order_id;
  
  if (!orderId) return;

  console.log(`❌ Платеж отменен для заказа ${orderId}`);

  try {
    await updateOrderPaymentStatus(orderId, {
      paymentStatus: 'cancelled',
      paymentId: payment.id
    });

    await sendAdminNotification(`❌ Платеж отменен для заказа #${orderId}`, {
      orderId,
      paymentId: payment.id,
      amount: `${payment.amount.value} ${payment.amount.currency}`
    });

  } catch (error) {
    console.error('❌ Ошибка обработки отмененного платежа:', error);
  }
}

async function handlePaymentWaitingForCapture(payment: YooKassaWebhookEvent['object']) {
  const orderId = payment.metadata?.order_id;
  
  if (!orderId) return;

  try {
    await updateOrderPaymentStatus(orderId, {
      paymentStatus: 'pending',
      paymentId: payment.id
    });

  } catch (error) {
    console.error('❌ Ошибка обработки ожидающего платежа:', error);
  }
}

async function handleRefundSucceeded(refund: any) {
  console.log(`💸 Возврат успешно выполнен: ${refund.id}`);
}

async function updateOrderPaymentStatus(orderId: string, updateData: {
  paymentStatus: string;
  paymentId: string;
  paidAt?: string;
  paymentAmount?: number;
}) {
  if (!STRAPI_API_TOKEN) {
    console.error('❌ Отсутствует STRAPI_API_TOKEN');
    return;
  }

  try {
    console.log(`🔄 Обновляем заказ ${orderId} в Strapi`);

    const response = await fetch(`${STRAPI_URL}/api/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`
      },
      body: JSON.stringify({
        data: updateData
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ошибка обновления заказа в Strapi:', response.status, errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Заказ обновлен в Strapi:', result.data?.id);

  } catch (error) {
    console.error('❌ Сетевая ошибка при обновлении заказа:', error);
  }
}

async function sendAdminNotification(message: string, details: Record<string, any>) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const ADMIN_TELEGRAM_CHAT_ID = process.env.ADMIN_TELEGRAM_CHAT_ID;

  if (!TELEGRAM_BOT_TOKEN || !ADMIN_TELEGRAM_CHAT_ID) {
    console.log('ℹ️ Telegram не настроен для уведомлений');
    return;
  }

  try {
    const text = `${message}\n\n${Object.entries(details)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')}`;

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: ADMIN_TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML'
      })
    });

  } catch (error) {
    console.error('❌ Ошибка отправки Telegram уведомления:', error);
  }
}