// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

// POST /api/orders - создать заказ
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 API: Создаем заказ...');
    
    const body = await request.json();
    
    // Валидация данных заказа
    const validation = validateOrderData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { customerInfo, items, totalAmount, deliveryAddress, notes } = body;

    // Генерируем номер заказа
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (STRAPI_API_TOKEN) {
      headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
    }

    // 1. Создаем основной заказ в Strapi
    const orderResponse = await fetch(`${STRAPI_URL}/api/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        data: {
          orderNumber,
          customerName: customerInfo.name,
          customerPhone: customerInfo.phone,
          customerEmail: customerInfo.email || '',
          totalAmount,
          orderStatus: 'pending',
          paymentStatus: 'pending',
          deliveryAddress: deliveryAddress || '',
          notes: notes || '',
        }
      })
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      console.error('❌ Ошибка создания заказа в Strapi:', errorData);
      throw new Error(`Ошибка создания заказа: ${orderResponse.status}`);
    }

    const orderResult = await orderResponse.json();
    const orderId = orderResult.data.id;

    console.log(`✅ Заказ создан с ID: ${orderId}`);

    // 2. Создаем позиции заказа и резервируем товары
    const orderItemsPromises = items.map(async (item: any) => {
      try {
        // Создаем позицию заказа
        const orderItemResponse = await fetch(`${STRAPI_URL}/api/order-items`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            data: {
              order: orderId,
              product: parseInt(item.productId),
              size: item.size,
              quantity: item.quantity,
              priceAtTime: item.priceAtTime,
            }
          })
        });

        if (!orderItemResponse.ok) {
          console.error(`❌ Ошибка создания позиции заказа для товара ${item.productId}`);
          return false;
        }

        // Резервируем товар
        await reserveProduct(item.productId, item.quantity, headers);
        return true;

      } catch (error) {
        console.error(`❌ Ошибка обработки позиции ${item.productId}:`, error);
        return false;
      }
    });

    // Ждем обработки всех позиций
    const results = await Promise.all(orderItemsPromises);
    const successCount = results.filter(Boolean).length;

    console.log(`✅ Обработано позиций: ${successCount}/${items.length}`);

    if (successCount === 0) {
      // Если ни одна позиция не создалась, удаляем заказ
      await fetch(`${STRAPI_URL}/api/orders/${orderId}`, {
        method: 'DELETE',
        headers
      });
      
      throw new Error('Не удалось создать позиции заказа');
    }

    console.log(`✅ Заказ ${orderNumber} успешно создан`);
    
    return NextResponse.json({
      success: true,
      orderId: orderNumber,
      strapiOrderId: orderId,
      processedItems: successCount,
      totalItems: items.length
    });

  } catch (error) {
    console.error('❌ API: Ошибка создания заказа:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка при создании заказа' 
      },
      { status: 500 }
    );
  }
}

// Валидация данных заказа
function validateOrderData(data: any): { isValid: boolean; error?: string } {
  if (!data.customerInfo) {
    return { isValid: false, error: 'Не указана информация о покупателе' };
  }

  if (!data.customerInfo.name || !data.customerInfo.phone) {
    return { isValid: false, error: 'Не указано имя или телефон покупателя' };
  }

  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    return { isValid: false, error: 'Корзина пуста' };
  }

  if (!data.totalAmount || data.totalAmount <= 0) {
    return { isValid: false, error: 'Неверная сумма заказа' };
  }

  // Валидация позиций
  for (const item of data.items) {
    if (!item.productId || !item.size || !item.quantity || !item.priceAtTime) {
      return { isValid: false, error: 'Неверные данные товара в корзине' };
    }
    
    if (item.quantity <= 0 || item.priceAtTime <= 0) {
      return { isValid: false, error: 'Неверное количество или цена товара' };
    }
  }

  return { isValid: true };
}

// Резервирование товара
async function reserveProduct(productId: string, quantity: number, headers: HeadersInit): Promise<void> {
  try {
    // Получаем текущие данные товара
    const productResponse = await fetch(`${STRAPI_URL}/api/products/${productId}`, {
      headers
    });
    
    if (!productResponse.ok) {
      console.error(`❌ Не удалось получить товар ${productId} для резервирования`);
      return;
    }

    const productData = await productResponse.json();
    const currentReserved = productData.data.attributes.reservedQuantity || 0;
    const stockQuantity = productData.data.attributes.stockQuantity || 0;
    
    // Проверяем, что достаточно товара
    if (stockQuantity < currentReserved + quantity) {
      console.warn(`⚠️ Недостаточно товара ${productId} для резервирования`);
      throw new Error(`Недостаточно товара в наличии (ID: ${productId})`);
    }

    // Обновляем резерв
    const updateResponse = await fetch(`${STRAPI_URL}/api/products/${productId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        data: {
          reservedQuantity: currentReserved + quantity
        }
      })
    });

    if (updateResponse.ok) {
      console.log(`✅ Зарезервировано ${quantity} единиц товара ${productId}`);
    } else {
      console.error(`❌ Ошибка резервирования товара ${productId}`);
      throw new Error(`Ошибка резервирования товара ${productId}`);
    }

  } catch (error) {
    console.error(`❌ Ошибка резервирования товара ${productId}:`, error);
    throw error;
  }
}