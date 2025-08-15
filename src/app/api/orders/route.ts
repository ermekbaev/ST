// src/app/api/orders/route.ts - ИСПРАВЛЕНО ПОД НОВЫЕ СВЯЗИ STRAPI + EMAIL УВЕДОМЛЕНИЯ
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

// 🔄 ЗАМЕНИЛИ Telegram на Email настройки
const EMAIL_USER = process.env.EMAIL_USER || 'adiletermekbaev176@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || 'adiletermekbaev176@gmail.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'adiletermekbaev176@gmail.com';

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
    
    // Получаем токен пользователя
    const authHeader = request.headers.get('authorization');
    const userToken = authHeader?.replace('Bearer ', '') || null;
    
    console.log('🔍 Отладка токена:', {
      hasUserToken: !!userToken,
      tokenPreview: userToken ? `${userToken.substring(0, 20)}...` : 'НЕТ ТОКЕНА'
    });

    // Получаем данные пользователя если токен есть
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

    // ✅ ИСПРАВЛЕНО: Подготавливаем данные для Strapi с правильной связью пользователя
    const orderData = {
      orderNumber,
      customerName: body.customerInfo.name,
      customerPhone: body.customerInfo.phone,
      customerEmail: body.customerInfo.email || '',
      totalAmount: body.totalAmount,
      deliveryMethod: body.deliveryMethod,
      paymentMethod: body.paymentMethod,
      deliveryAddress: body.deliveryAddress || '',
      notes: body.notes || '',
      orderStatus: 'pending',
      paymentStatus: body.paymentMethod === 'cash_vladivostok' ? 'pending' : 'pending',
      // Правильная связь с пользователем
      ...(userId && { 
        user: {
          connect: [{ id: parseInt(userId) }]
        }
      })
    };

    console.log('💾 Сохраняем заказ в Strapi...', {
      isUserOrder: !!userId,
      userId: userId || 'guest'
    });

    // Сохраняем заказ в Strapi
    const orderId = await saveOrderToStrapi(orderData, body.items);
    
    console.log(`✅ Заказ сохранен в Strapi с ID: ${orderId}`, userId ? '(авторизованный)' : '(гостевой)');

    // 🔄 ИЗМЕНЕНО: Отправляем email уведомление админу вместо Telegram
    await sendAdminNotification(orderNumber, body, orderData);

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      message: 'Заказ успешно создан',
      userOrder: !!userId
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

// ✅ ИСПРАВЛЕНО: Сохранение заказа в Strapi под новые связи
async function saveOrderToStrapi(orderData: any, items: CreateOrderData['items']): Promise<string> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
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

  // 2. ✅ ИСПРАВЛЕНО: Создаем позиции заказа с новой связью
  console.log(`\n🔄 === СОЗДАЕМ ${items.length} ПОЗИЦИЙ ЗАКАЗА ===`);
  
  const createdOrderItems: string[] = [];
  let successCount = 0;

  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    
    try {
      console.log(`\n🔄 === СОЗДАЕМ ПОЗИЦИЮ ${index + 1}/${items.length} ===`);
      
      // Пытаемся найти размер
      const sizeId = await findSizeId(item.productId, item.size);
      
      if (!sizeId) {
        console.warn(`⚠️ Размер "${item.size}" не найден для товара ${item.productId}, создаем без размера`);
      }

      // ✅ ИСПРАВЛЕНО: Правильная структура для новых связей
      const itemData = {
        orderId: orderId.toString(),
        productId: item.productId,
        productName: item.productName || `Товар ${item.productId}`,
        quantity: item.quantity,
        priceAtTime: item.priceAtTime,
        
        // ✅ ИСПРАВЛЕНО: Связь с product
        product: {
          connect: [{ id: parseInt(item.productId) }]
        },
        
        // ✅ ИСПРАВЛЕНО: Связь с заказом через новое поле
        order: {
          connect: [{ id: orderId }]
        },
        
        // Размер только если найден
        ...(sizeId && {
          size: {
            connect: [{ id: parseInt(sizeId) }]
          }
        })
      };

      console.log(`🔄 Отправляем запрос создания позиции ${index + 1}:`, {
        orderId: itemData.orderId,
        productId: itemData.productId,
        productName: itemData.productName,
        hasProductConnection: true,
        hasOrderConnection: true,
        hasSizeConnection: !!sizeId
      });

      const itemResponse = await fetch(`${STRAPI_URL}/api/order-items`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ data: itemData })
      });

      if (!itemResponse.ok) {
        const errorText = await itemResponse.text();
        console.error(`❌ Ошибка создания позиции ${index + 1}:`, errorText);
        
        // ✅ FALLBACK: Пытаемся создать хотя бы базовую позицию
        console.log(`🔄 Пытаемся создать fallback позицию ${index + 1} без связей...`);
        
        const fallbackData = {
          orderId: orderId.toString(),
          productId: item.productId,
          productName: item.productName || `Товар ${item.productId}`,
          quantity: item.quantity,
          priceAtTime: item.priceAtTime
        };
        
        const fallbackResponse = await fetch(`${STRAPI_URL}/api/order-items`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ data: fallbackData })
        });
        
        if (fallbackResponse.ok) {
          const fallbackResult = await fallbackResponse.json();
          console.log(`✅ Создана fallback позиция ${index + 1} с ID: ${fallbackResult.data.id} (БЕЗ СВЯЗЕЙ)`);
          createdOrderItems.push(fallbackResult.data.id.toString());
          successCount++;
        } else {
          const fallbackError = await fallbackResponse.text();
          console.error(`❌ Fallback также не сработал для позиции ${index + 1}:`, fallbackError);
        }
      } else {
        const itemResult = await itemResponse.json();
        const orderItemId = itemResult.data.id;
        console.log(`✅ Позиция ${index + 1} создана с ID: ${orderItemId} (СО СВЯЗЯМИ)`);
        
        createdOrderItems.push(orderItemId.toString());
        successCount++;
      }
      
      // Небольшая пауза между созданием позиций для стабильности
      if (index < items.length - 1) {
        console.log(`⏳ Пауза 200ms перед следующей позицией...`);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
    } catch (error) {
      console.error(`❌ Критическая ошибка создания позиции ${index + 1}:`, error);
    }
  }

  console.log(`\n📦 === ИТОГИ СОЗДАНИЯ ПОЗИЦИЙ ===`);
  console.log(`✅ Создано позиций: ${successCount}/${items.length}`);
  console.log(`📋 ID созданных позиций: [${createdOrderItems.join(', ')}]`);

  if (successCount === 0) {
    throw new Error('Не удалось создать ни одной позиции заказа');
  }

  // ✅ ИСПРАВЛЕНО: Обновляем заказ с новым полем связи
  if (createdOrderItems.length > 0) {
    await updateOrderWithItems(orderId, createdOrderItems);
    
    // Проверяем результат связывания
    await new Promise(resolve => setTimeout(resolve, 1000));
    await verifyOrderLinks(orderId.toString());
  }

  return orderId.toString();
}

// ✅ ИСПРАВЛЕНО: Обновление заказа с новым названием поля связи
async function updateOrderWithItems(orderId: string, orderItemIds: string[]): Promise<void> {
  try {
    console.log(`🔄 Обновляем заказ ${orderId} со связями на позиции: [${orderItemIds.join(', ')}]`);
    
    // Получаем documentId заказа
    let documentId = null;
    
    try {
      const searchResponse = await fetch(`${STRAPI_URL}/api/orders?filters[id][$eq]=${orderId}`);
      
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.data && searchData.data.length > 0) {
          documentId = searchData.data[0].documentId;
          console.log(`🔍 Найден documentId для заказа ${orderId}: ${documentId}`);
        }
      }
    } catch (error) {
      console.warn('⚠️ Поиск documentId не удался:', error);
    }
    
    if (!documentId) {
      console.warn(`⚠️ DocumentId не найден для заказа ${orderId}, используем orderId`);
      documentId = orderId;
    }
    
    // ✅ КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: Используем новое название поля для связи
    // Проверим разные варианты названий полей
    const possibleFieldNames = ['order_items', 'orderItems', 'order_item'];
    
    for (const fieldName of possibleFieldNames) {
      console.log(`🔄 Пробуем обновить через поле "${fieldName}"...`);
      
      const updateData = {
        [fieldName]: orderItemIds.map(id => ({ id: parseInt(id) }))
      };

      console.log(`🔄 Отправляем данные для связывания (${fieldName}):`, JSON.stringify(updateData, null, 2));

      const updateResponse = await fetch(`${STRAPI_URL}/api/orders/${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: updateData
        })
      });

      if (updateResponse.ok) {
        const result = await updateResponse.json();
        console.log(`✅ Заказ ${orderId} обновлен через поле "${fieldName}" со связями на ${orderItemIds.length} позиций`);
        console.log(`📋 Новый ID заказа: ${result.data?.id || 'не указан'}`);
        return; // Успешно обновили, выходим
      } else {
        const errorText = await updateResponse.text();
        console.warn(`⚠️ Не удалось обновить через поле "${fieldName}":`, errorText);
      }
    }
    
    // Если ни один вариант не сработал, пробуем connect
    console.log('🔄 Пробуем через connect...');
    
    for (const fieldName of possibleFieldNames) {
      const connectData = {
        [fieldName]: {
          connect: orderItemIds.map(id => ({ id: parseInt(id) }))
        }
      };
      
      const connectResponse = await fetch(`${STRAPI_URL}/api/orders/${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: connectData
        })
      });
      
      if (connectResponse.ok) {
        console.log(`✅ Заказ ${orderId} обновлен через connect в поле "${fieldName}"`);
        return;
      } else {
        const connectError = await connectResponse.text();
        console.warn(`⚠️ Connect через "${fieldName}" не сработал:`, connectError);
      }
    }
    
    console.error(`❌ Все попытки обновления заказа ${orderId} не удались`);
    
  } catch (error) {
    console.error(`❌ Критическая ошибка обновления заказа ${orderId}:`, error);
  }
}

// ✅ ИСПРАВЛЕНО: Проверка связей с учетом нового поля
async function verifyOrderLinks(orderId: string): Promise<void> {
  try {
    console.log(`🔍 Проверяем связи для заказа ${orderId}...`);
    
    // Проверяем разные варианты populate
    const populateOptions = ['order_items', 'orderItems', 'order_item'];
    
    for (const populateField of populateOptions) {
      try {
        const orderResponse = await fetch(
          `${STRAPI_URL}/api/orders/${orderId}?populate=${populateField}`,
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );
        
        if (orderResponse.ok) {
          const orderData = await orderResponse.json();
          const orderItems = orderData.data?.[populateField] || [];
          
          console.log(`📊 Проверка заказа ${orderId} через поле "${populateField}":`);
          console.log(`  - Связанных items: ${Array.isArray(orderItems) ? orderItems.length : (orderItems ? 1 : 0)}`);
          
          if (Array.isArray(orderItems) && orderItems.length > 0) {
            console.log(`✅ У заказа ${orderId} есть ${orderItems.length} связанных позиций через поле "${populateField}"`);
            orderItems.forEach((item: any, index: number) => {
              console.log(`  ${index + 1}. ID: ${item.id}, Product: ${item.productName}`);
            });
            return; // Нашли рабочее поле, выходим
          }
        }
      } catch (error) {
        console.warn(`⚠️ Ошибка проверки через поле "${populateField}":`, error);
      }
    }
    
    console.warn(`⚠️ У заказа ${orderId} не найдены связанные order_items ни в одном поле!`);
    
  } catch (error) {
    console.error(`❌ Ошибка проверки связей:`, error);
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

// Поиск размеров
async function findSizeId(productId: string, sizeValue: string): Promise<string | null> {
  try {
    console.log(`🔍 Ищем размер "${sizeValue}" для товара ${productId}...`);
    
    // Метод 1: Получаем товар с размерами
    const productResponse = await fetch(
      `${STRAPI_URL}/api/products?filters[id][$eq]=${productId}&populate=sizes`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (productResponse.ok) {
      const productData = await productResponse.json();
      
      if (productData.data && productData.data.length > 0) {
        const product = productData.data[0];
        
        if (product.sizes && Array.isArray(product.sizes)) {
          const targetSize = product.sizes.find((size: any) => 
            size.value === sizeValue
          );
          
          if (targetSize) {
            console.log(`✅ Найден размер ID: ${targetSize.id} для значения "${sizeValue}"`);
            return targetSize.id.toString();
          }
        }
      }
    }

    // Метод 2: Прямой поиск размера
    const sizeResponse = await fetch(
      `${STRAPI_URL}/api/sizes?filters[value][$eq]=${sizeValue}&populate=*`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (sizeResponse.ok) {
      const sizeData = await sizeResponse.json();
      
      if (sizeData.data && sizeData.data.length > 0) {
        const firstSize = sizeData.data[0];
        console.log(`✅ Найден размер ID через прямой поиск: ${firstSize.id} для значения "${sizeValue}"`);
        return firstSize.id.toString();
      }
    }

    console.log(`❌ Размер "${sizeValue}" не найден для товара ${productId}`);
    return null;
    
  } catch (error) {
    console.error('❌ Ошибка поиска размера:', error);
    return null;
  }
}

// 🔄 ИЗМЕНЕНО: Отправка email уведомления админу (вместо Telegram)
async function sendAdminNotification(orderNumber: string, orderData: CreateOrderData, savedData: any): Promise<void> {
  try {
    console.log('📧 Отправляем email уведомление админу...');
    
    // Проверяем настройки email
    if (!EMAIL_PASS) {
      console.log('⚠️ Email не настроен (нет EMAIL_PASS), выводим в консоль:');
      console.log('\n🎯 ==================== EMAIL УВЕДОМЛЕНИЕ ====================');
      console.log('📧 ДЛЯ:', ADMIN_EMAIL);
      console.log('📋 ТЕМА: 🛍️ Новый заказ №' + orderNumber);
      console.log('============================================================');
      console.log(formatAdminNotification(orderNumber, orderData, savedData));
      console.log('============================================================');
      console.log('💡 Настройте EMAIL_PASS в .env.local для автоматической отправки');
      console.log('============================================================\n');
      return;
    }

    // Создаем транспортер для Gmail
    const transporter = nodemailer.createTransport({
      host: 'smtp.mail.ru',
      port: 465,
      secure: true,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS, // обычный пароль, НЕ App Password
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Форматируем сообщение
    const messageText = formatAdminNotification(orderNumber, orderData, savedData);
    const messageHtml = formatAdminNotificationHtml(orderNumber, orderData, savedData);

    // Настройки письма
    const mailOptions = {
      from: EMAIL_FROM,
      to: ADMIN_EMAIL,
      subject: `🛍️ Новый заказ №${orderNumber} - ${orderData.totalAmount.toLocaleString('ru-RU')}₽`,
      text: messageText,
      html: messageHtml,
    };

    // Отправляем email
    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email успешно отправлен на', ADMIN_EMAIL);
    console.log('📧 Message ID:', result.messageId);

  } catch (error) {
    console.error('❌ Ошибка отправки email:', error);
    
    // Fallback - выводим в консоль
    console.log('\n📧 Fallback - выводим уведомление в консоль:');
    console.log('🎯 ==================== EMAIL УВЕДОМЛЕНИЕ ====================');
    console.log('📧 ДЛЯ:', ADMIN_EMAIL);
    console.log('📋 ТЕМА: 🛍️ Новый заказ №' + orderNumber);
    console.log('============================================================');
    console.log(formatAdminNotification(orderNumber, orderData, savedData));
    console.log('============================================================\n');
  }
}

// Форматирование уведомления (как в Telegram)
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
    message += `${index + 1}. ${item.productName || item.productId} (${item.size}) × ${item.quantity} = ${(item.priceAtTime * item.quantity).toLocaleString('ru-RU')}₽\n`;
  });
  
  message += `\n💰 Итого: ${totalAmount.toLocaleString('ru-RU')}₽\n`;
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

// Форматирование HTML версии email
function formatAdminNotificationHtml(orderNumber: string, orderData: CreateOrderData, savedData: any): string {
  const { customerInfo, items, totalAmount, deliveryMethod, paymentMethod } = orderData;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Новый заказ ${orderNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .order-info { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .customer-info { margin-bottom: 25px; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .items-table th { background-color: #f1f2f6; font-weight: bold; }
        .total { font-size: 18px; font-weight: bold; text-align: right; margin: 20px 0; color: #27ae60; }
        .delivery-payment { display: flex; justify-content: space-between; margin: 20px 0; }
        .delivery-payment > div { flex: 1; margin: 0 10px; background-color: #f8f9fa; padding: 15px; border-radius: 5px; }
        .timestamp { text-align: center; color: #7f8c8d; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛍️ НОВЫЙ ЗАКАЗ!</h1>
          <h2>Заказ №${orderNumber}</h2>
        </div>
        
        <div class="content">
          <div class="customer-info">
            <h3>👤 Информация о клиенте:</h3>
            <p><strong>Имя:</strong> ${customerInfo.name}</p>
            <p><strong>Телефон:</strong> ${customerInfo.phone}</p>
            ${customerInfo.email ? `<p><strong>Email:</strong> ${customerInfo.email}</p>` : ''}
          </div>

          <h3>📦 Заказанные товары (${items.length} шт.):</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>№</th>
                <th>Товар</th>
                <th>Размер</th>
                <th>Кол-во</th>
                <th>Цена</th>
                <th>Сумма</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.productName || item.productId}</td>
                  <td>${item.size}</td>
                  <td>${item.quantity}</td>
                  <td>${item.priceAtTime.toLocaleString('ru-RU')}₽</td>
                  <td>${(item.priceAtTime * item.quantity).toLocaleString('ru-RU')}₽</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total">
            💰 Итого: ${totalAmount.toLocaleString('ru-RU')}₽
          </div>

          <div class="delivery-payment">
            <div>
              <h4>🚚 Доставка:</h4>
              <p>${getDeliveryMethodName(deliveryMethod)}</p>
              ${savedData.deliveryAddress ? `<p><strong>Адрес:</strong> ${savedData.deliveryAddress}</p>` : ''}
            </div>
            <div>
              <h4>💳 Оплата:</h4>
              <p>${getPaymentMethodName(paymentMethod)}</p>
            </div>
          </div>

          ${savedData.notes ? `
            <div class="order-info">
              <h4>📝 Примечания:</h4>
              <p>${savedData.notes}</p>
            </div>
          ` : ''}

          <div class="timestamp">
            ⏰ ${new Date().toLocaleString('ru-RU')}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// 🔄 УДАЛЯЕМ старую функцию sendTelegramNotification (больше не нужна)

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