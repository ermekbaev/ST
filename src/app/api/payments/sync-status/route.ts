import { NextRequest, NextResponse } from 'next/server';
import { YooCheckout } from '@a2seven/yoo-checkout';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

const checkout = new YooCheckout({
  shopId: process.env.YUKASSA_SHOP_ID!,
  secretKey: process.env.YUKASSA_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { paymentId, orderNumber } = await request.json();

    console.log('🔄 Синхронизация статуса платежа:', { paymentId, orderNumber });

    if (!paymentId || !orderNumber) {
      return NextResponse.json({
        success: false,
        error: 'PaymentId и orderNumber обязательны'
      }, { status: 400 });
    }

    const payment = await checkout.getPayment(paymentId);

    console.log('✅ Получен статус от ЮKassa:', {
      id: payment.id,
      status: payment.status,
      paid: payment.paid,
      amount: payment.amount?.value
    });

    let updated = false;

    if (payment.status === 'succeeded' && payment.paid) {
      updated = await updateOrderPaymentStatus(orderNumber, {
        paymentStatus: 'paid'
      });

      if (updated) {
        console.log('✅ Статус обновлен в Strapi на paid');
        
        await sendAdminNotification(`💳 Статус платежа синхронизирован для заказа ${orderNumber}`, {
          orderNumber,
          paymentId: payment.id,
          amount: `${payment.amount.value} ${payment.amount.currency}`,
          previousStatus: 'pending',
          newStatus: 'paid'
        });
      }
    } else if (payment.status === 'canceled') {
      updated = await updateOrderPaymentStatus(orderNumber, {
        paymentStatus: 'failed'
      });
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        paid: payment.paid,
        amount: payment.amount?.value,
        updated
      }
    });

  } catch (error: any) {
    console.error('❌ Ошибка синхронизации статуса:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка синхронизации статуса платежа',
      details: error.message
    }, { status: 500 });
  }
}

async function updateOrderPaymentStatus(orderNumber: string, updateData: {
  paymentStatus: string;
}): Promise<boolean> {
  
  try {
    const findResponse = await fetch(
      `${STRAPI_URL}/api/orders?filters[orderNumber][$eq]=${orderNumber}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (findResponse.ok) {
      const findResult = await findResponse.json();
      
      if (findResult.data && findResult.data.length > 0) {
        const orderId = findResult.data[0].id;
        console.log(`✅ Найден заказ с ID: ${orderId} (без токена)`);

        const updateResponse = await fetch(`${STRAPI_URL}/api/orders/${orderId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            data: updateData
          })
        });

        console.log(`📡 Ответ Strapi (без токена): ${updateResponse.status}`);

        if (updateResponse.ok) {
          const result = await updateResponse.json();
          console.log('✅ Заказ обновлен БЕЗ токена:', result.data?.id);
          return true;
        } else {
          const errorText = await updateResponse.text();
          console.log('❌ Не удалось обновить без токена:', updateResponse.status, errorText);
        }
      }
    }
  } catch (error) {
    console.log('❌ Ошибка обновления без токена:', error);
  }

  if (!STRAPI_API_TOKEN) {
    console.error('❌ Отсутствует STRAPI_API_TOKEN для второй попытки');
    return false;
  }

  try {
    const findResponse = await fetch(
      `${STRAPI_URL}/api/orders?filters[orderNumber][$eq]=${orderNumber}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${STRAPI_API_TOKEN}`
        }
      }
    );

    if (!findResponse.ok) {
      console.error('❌ Ошибка поиска заказа с токеном:', findResponse.status);
      return false;
    }

    const findResult = await findResponse.json();
    
    if (!findResult.data || findResult.data.length === 0) {
      console.error(`❌ Заказ ${orderNumber} не найден с токеном`);
      return false;
    }

    const order = findResult.data[0];
    const documentId = order.documentId || order.id; // Используем documentId для Strapi v5
    console.log(`✅ Найден заказ с documentId: ${documentId} (ID: ${order.id}) (с токеном)`);

    console.log(`🔄 Обновляем заказ documentId ${documentId} с данными:`, updateData);
    
    const updateResponse = await fetch(`${STRAPI_URL}/api/orders/${documentId}`, {
      method: 'PUT', 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`
      },
      body: JSON.stringify({
        data: updateData
      })
    });

    const result = await updateResponse.json();
    return true;

  } catch (error) {
    console.error('❌ Сетевая ошибка при обновлении заказа:', error);
    return false;
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