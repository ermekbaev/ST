// src/app/api/payments/create/route.ts - ИСПРАВЛЕН: НОРМАЛИЗАЦИЯ ТЕЛЕФОНА
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
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

// 🔥 ДОБАВЛЕНА ФУНКЦИЯ НОРМАЛИЗАЦИИ ТЕЛЕФОНА
function normalizePhone(phone: string): string {
  // Убираем все символы кроме цифр
  const digits = phone.replace(/\D/g, '');
  
  // Если начинается с 8, заменяем на 7
  if (digits.startsWith('8')) {
    return '7' + digits.slice(1);
  }
  
  // Если начинается с +7, убираем +
  if (digits.startsWith('7')) {
    return digits;
  }
  
  // Если 10 цифр, добавляем 7 в начало
  if (digits.length === 10) {
    return '7' + digits;
  }
  
  return digits;
}

export async function POST(request: NextRequest) {
  try {
    console.log('💳 ЮKassa: Создание платежа');
    
    const body: CreatePaymentRequest = await request.json();
    const { amount, orderId, customerEmail, customerPhone, description, returnUrl, items } = body;

    // Валидация данных
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

    // 🔥 НОРМАЛИЗУЕМ ТЕЛЕФОН ДЛЯ ЮKASSA
    const normalizedPhone = normalizePhone(customerPhone);
    console.log('📞 Нормализация телефона:', {
      original: customerPhone,
      normalized: normalizedPhone
    });

    // Подготовка чека для фискализации
    const receiptItems = items ? items.map(item => ({
      description: item.name,
      quantity: item.quantity.toString(),
      amount: {
        value: (item.price * item.quantity).toFixed(2),
        currency: 'RUB'
      },
      vat_code: 1, // НДС не облагается
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
        return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/order-success?orderNumber=${orderId}`
      },
      description: description || `Оплата заказа #${orderId} в Tigr Shop`,
      metadata: {
        order_id: orderId,
        customer_email: customerEmail || '',
        customer_phone: normalizedPhone, // 🔥 ИСПОЛЬЗУЕМ НОРМАЛИЗОВАННЫЙ ТЕЛЕФОН
        source: 'tigr_shop'
      },
      receipt: {
        customer: {
          email: customerEmail,
          phone: normalizedPhone // 🔥 ИСПОЛЬЗУЕМ НОРМАЛИЗОВАННЫЙ ТЕЛЕФОН
        },
        items: receiptItems
      },
      // Дополнительные настройки
      capture: true, // Автоматическое списание
      save_payment_method: false // Пока не сохраняем карты
    };

    console.log('💳 ЮKassa: Отправляем запрос на создание платежа:', {
      amount: createPayload.amount,
      orderId,
      customerPhone: normalizedPhone // 🔥 ЛОГИРУЕМ НОРМАЛИЗОВАННЫЙ ТЕЛЕФОН
    });

    const payment = await checkout.createPayment(createPayload);

    console.log('✅ ЮKassa: Платеж создан:', {
      paymentId: payment.id,
      status: payment.status,
      confirmationUrl: payment.confirmation?.confirmation_url
    });

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      confirmationUrl: payment.confirmation?.confirmation_url,
      status: payment.status,
      amount: payment.amount
    });

  } catch (error: any) {
    console.error('❌ ЮKassa: Ошибка создания платежа:', error);
    
    // Обработка специфичных ошибок ЮKassa
    let errorMessage = 'Ошибка создания платежа';
    
    if (error.response?.data) {
      const yukassaError = error.response.data;
      if (yukassaError.description) {
        errorMessage = yukassaError.description;
      } else if (yukassaError.error) {
        errorMessage = yukassaError.error;
      }
      
      // 🔥 ДОБАВЛЕНА ДЕТАЛЬНАЯ ИНФОРМАЦИЯ ОБ ОШИБКЕ
      console.error('📋 Детали ошибки ЮKassa:', {
        type: yukassaError.type,
        code: yukassaError.code,
        description: yukassaError.description,
        parameter: yukassaError.parameter
      });
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