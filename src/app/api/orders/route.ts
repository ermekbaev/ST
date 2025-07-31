// src/app/api/orders/route.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ
import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;
const ADMIN_TELEGRAM_CHAT_ID = process.env.ADMIN_TELEGRAM_CHAT_ID;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

interface CreateOrderData {
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  items: Array<{
    productId: string;
    size: string;
    quantity: number;
    priceAtTime: number;
    productName?: string;
  }>;
  totalAmount: number;
  deliveryMethod: string;
  paymentMethod: string;
  deliveryAddress?: string;
  notes?: string;
}

// POST /api/orders - создать заказ
export async function POST(request: NextRequest) {
  try {
    console.log('📝 API: Получен запрос на создание заказа');
    
    const body: CreateOrderData = await request.json();
    
    // ✅ ДОБАВЛЕНО: Получаем и проверяем токен пользователя
    const authHeader = request.headers.get('authorization');
    const userToken = authHeader?.replace('Bearer ', '') || null;
    
    // ✅ ДОБАВЛЕНО: Отладочная информация о токене
    console.log('🔍 Отладка входящих данных:', {
      hasUserToken: !!userToken,
      tokenPreview: userToken ? `${userToken.substring(0, 20)}...` : 'НЕТ ТОКЕНА'
    });

    if (!userToken) {
      console.log('❌ ТОКЕН НЕ ПЕРЕДАН ИЗ ФРОНТЕНДА!');
    } else {
      console.log('✅ Токен получен, заказ будет привязан к пользователю');
    }

    // ✅ ДОБАВЛЕНО: Получаем данные пользователя если токен есть
    let userId: string | null = null;
    if (userToken) {
      try {
        const userResponse = await fetch(`${STRAPI_URL}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${userToken}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          userId = userData.id;
          console.log('✅ Пользователь найден:', userData.id, userData.email);
        } else {
          console.log('⚠️ Токен недействителен, создаем гостевой заказ');
        }
      } catch (error) {
        console.error('❌ Ошибка проверки пользователя:', error);
      }
    }
    
    // Базовая валидация
    const validation = validateOrderData(body);
    if (!validation.isValid) {
      console.error('❌ Валидация заказа не прошла:', validation.error);
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Генерируем номер заказа
    const orderNumber = generateOrderNumber();
    console.log('🔢 Сгенерирован номер заказа:', orderNumber);

    // ✅ ИСПРАВЛЕНО: Подготавливаем данные для Strapi с userId
    const orderData = {
      orderNumber,
      customerName: body.customerInfo.name,
      customerPhone: body.customerInfo.phone,
      customerEmail: body.customerInfo.email || '',
      totalAmount: body.totalAmount, // ИСПРАВЛЕНО: было totalNumber
      deliveryMethod: body.deliveryMethod,
      paymentMethod: body.paymentMethod,
      deliveryAddress: body.deliveryAddress || '',
      notes: body.notes || '',
      orderStatus: 'pending',
      paymentStatus: body.paymentMethod === 'cash_vladivostok' ? 'pending' : 'pending',
      // ✅ ДОБАВЛЕНО: Привязываем к пользователю если авторизован
      ...(userId && { user: userId })
    };

    console.log('💾 Сохраняем заказ в Strapi...', {
      isUserOrder: !!userId,
      userId: userId || 'guest'
    });

    // Сохраняем заказ в Strapi
    const orderId = await saveOrderToStrapi(orderData, body.items);
    
    console.log(`✅ Заказ сохранен в Strapi с ID: ${orderId}`, userId ? '(авторизованный)' : '(гостевой)');

    // Отправляем уведомление админу
    await sendAdminNotification(orderNumber, body, orderData);

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      message: 'Заказ успешно создан',
      userOrder: !!userId // ✅ ДОБАВЛЕНО: Флаг авторизованного заказа
    });

  } catch (error) {
    console.error('❌ Ошибка создания заказа:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Внутренняя ошибка сервера',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}

// Генерация номера заказа
function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 999).toString().padStart(3, '0');
  
  return `ORD${year}${month}${day}${random}`;
}

// Валидация данных заказа
function validateOrderData(data: CreateOrderData): { isValid: boolean; error?: string } {
  if (!data.customerInfo?.name?.trim()) {
    return { isValid: false, error: 'Не указано имя покупателя' };
  }

  if (!data.customerInfo?.phone?.trim()) {
    return { isValid: false, error: 'Не указан телефон покупателя' };
  }

  // Проверяем формат телефона (базовая проверка)
  const phoneRegex = /^[+]?[0-9\s\-\(\)]{10,}$/;
  if (!phoneRegex.test(data.customerInfo.phone.trim())) {
    return { isValid: false, error: 'Неверный формат телефона' };
  }

  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    return { isValid: false, error: 'Корзина пуста' };
  }

  if (!data.totalAmount || data.totalAmount <= 0) {
    return { isValid: false, error: 'Неверная сумма заказа' };
  }

  if (!data.deliveryMethod || !data.paymentMethod) {
    return { isValid: false, error: 'Не указан способ доставки или оплаты' };
  }

  // Проверяем каждую позицию
  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i];
    if (!item.productId || !item.size || !item.quantity || !item.priceAtTime) {
      return { isValid: false, error: `Неверные данные товара #${i + 1}` };
    }
    
    if (item.quantity <= 0 || item.priceAtTime <= 0) {
      return { isValid: false, error: `Неверное количество или цена товара #${i + 1}` };
    }
  }

  return { isValid: true };
}

// Сохранение заказа в Strapi
async function saveOrderToStrapi(orderData: any, items: CreateOrderData['items']): Promise<string> {
  if (!STRAPI_API_TOKEN) {
    throw new Error('STRAPI_API_TOKEN не настроен');
  }

//   const headers: HeadersInit = {
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
//   };

  const headers: HeadersInit = {
  'Content-Type': 'application/json',
  // Убираем Authorization для Public роли
  };

  console.log('🔄 Создаем основной заказ в Strapi...');

  // 1. Создаем основной заказ
  const orderResponse = await fetch(`${STRAPI_URL}/api/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ data: orderData })
  });

  if (!orderResponse.ok) {
    const errorText = await orderResponse.text();
    console.error('❌ Ошибка ответа Strapi:', errorText);
    throw new Error(`Ошибка создания заказа в Strapi: ${orderResponse.status} - ${errorText}`);
  }

  const orderResult = await orderResponse.json();
  const orderId = orderResult.data.id;

  console.log(`✅ Основной заказ создан с ID: ${orderId}`);

  // 2. Создаем позиции заказа
  console.log(`🔄 Создаем ${items.length} позиций заказа...`);
  
  const itemPromises = items.map(async (item, index) => {
    try {
      const itemData = {
        orderId: orderId.toString(), 
        productId: item.productId,
        productName: item.productName || `Товар ${item.productId}`,
        size: item.size,
        quantity: item.quantity, // ИСПРАВЛЕНО: не Quantity
        priceAtTime: item.priceAtTime,
      };

      console.log(`🔄 Создаем позицию ${index + 1}:`, itemData);

      const itemResponse = await fetch(`${STRAPI_URL}/api/order-items`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ data: itemData })
      });

      if (!itemResponse.ok) {
        const errorText = await itemResponse.text();
        console.error(`❌ Ошибка создания позиции ${index + 1}:`, errorText);
        return false;
      }

      const itemResult = await itemResponse.json();
      console.log(`✅ Позиция ${index + 1} создана с ID:`, itemResult.data.id);
      return true;
    } catch (error) {
      console.error(`❌ Ошибка создания позиции ${index + 1}:`, error);
      return false;
    }
  });

  const results = await Promise.all(itemPromises);
  const successCount = results.filter(Boolean).length;
  
  console.log(`📦 Создано позиций заказа: ${successCount}/${items.length}`);

  if (successCount === 0) {
    throw new Error('Не удалось создать ни одной позиции заказа');
  }

  return orderId.toString();
}

// Отправка уведомления админу
async function sendAdminNotification(orderNumber: string, orderData: CreateOrderData, savedData: any): Promise<void> {
  try {
    // Формируем текст уведомления
    const message = formatAdminNotification(orderNumber, orderData, savedData);
    
    console.log('📧 Отправляем уведомление админу...');
    
    // Пытаемся отправить в Telegram
    if (TELEGRAM_BOT_TOKEN && ADMIN_TELEGRAM_CHAT_ID) {
      await sendTelegramNotification(message);
    } else {
      console.log('📧 УВЕДОМЛЕНИЕ АДМИНУ (Telegram не настроен):\n', message);
    }

  } catch (error) {
    console.error('❌ Ошибка отправки уведомления админу:', error);
  }
}

// Форматирование уведомления
function formatAdminNotification(orderNumber: string, orderData: CreateOrderData, savedData: any): string {
  const { customerInfo, items, totalAmount, deliveryMethod, paymentMethod } = orderData;
  
  let message = `🛍️ НОВЫЙ ЗАКАЗ!\n\n`;
  message += `📋 Номер: ${orderNumber}\n`;
  message += `👤 Клиент: ${customerInfo.name}\n`;
  message += `📞 Телефон: ${customerInfo.phone}\n`;
  
  if (customerInfo.email) {
    message += `📧 Email: ${customerInfo.email}\n`;
  }
  
  message += `\n📦 Товары (${items.length} шт.):\n`;
  items.forEach((item, index) => {
    message += `${index + 1}. ${item.productName || item.productId} (${item.size}) × ${item.quantity} = ${item.priceAtTime * item.quantity}₽\n`;
  });
  
  message += `\n💰 Итого: ${totalAmount}₽\n`;
  message += `🚚 Доставка: ${getDeliveryMethodName(deliveryMethod)}\n`;
  message += `💳 Оплата: ${getPaymentMethodName(paymentMethod)}\n`;
  
  if (savedData.deliveryAddress) {
    message += `📍 Адрес: ${savedData.deliveryAddress}\n`;
  }
  
  if (savedData.notes) {
    message += `📝 Примечания: ${savedData.notes}\n`;
  }
  
  message += `\n⏰ ${new Date().toLocaleString('ru-RU')}`;
  
  return message;
}

// Отправка в Telegram
async function sendTelegramNotification(message: string): Promise<void> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: ADMIN_TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (response.ok) {
      console.log('✅ Уведомление отправлено в Telegram');
    } else {
      const errorText = await response.text();
      console.error('❌ Ошибка отправки в Telegram:', errorText);
    }
  } catch (error) {
    console.error('❌ Ошибка Telegram API:', error);
  }
}

// Вспомогательные функции для читаемых названий
function getDeliveryMethodName(method: string): string {
  const methods = {
    'store_pickup': 'Самовывоз из магазина',
    'courier_ts': 'Курьер TS',
    'cdek_pickup': 'СДЭК до пункта выдачи',
    'cdek_courier': 'СДЭК курьером'
  };
  //@ts-ignore
  return methods[method] || method;
}

function getPaymentMethodName(method: string): string {
  const methods = {
    'card': 'Онлайн картой',
    'cash_vladivostok': 'Наличными во Владивостоке'
  };
  //@ts-ignore
  return methods[method] || method;
}