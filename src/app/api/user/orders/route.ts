// src/app/api/user/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  size: string;
  priceAtTime: number;
  productImage?: string; // Добавляем поле для фото товара
}

interface UserOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  deliveryMethod: string;
  paymentMethod: string;
  deliveryAddress?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
}

// GET /api/user/orders - получить заказы авторизованного пользователя
export async function GET(request: NextRequest) {
  try {
    console.log('📋 API: Запрос истории заказов пользователя');
    
    // ✅ Проверяем авторизацию
    const authHeader = request.headers.get('authorization');
    const userToken = authHeader?.replace('Bearer ', '') || null;
    
    if (!userToken) {
      console.log('❌ Токен не передан, доступ запрещен');
      return NextResponse.json(
        { success: false, error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    // ✅ Получаем данные пользователя
    let userId: string | null = null;
    try {
      const userResponse = await fetch(`${STRAPI_URL}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (!userResponse.ok) {
        console.log('❌ Токен недействителен');
        return NextResponse.json(
          { success: false, error: 'Недействительный токен' },
          { status: 401 }
        );
      }

      const userData = await userResponse.json();
      userId = userData.id;
      console.log('✅ Пользователь найден:', userData.id, userData.email);
    } catch (error) {
      console.error('❌ Ошибка проверки пользователя:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка проверки авторизации' },
        { status: 500 }
      );
    }

    // ✅ ШАГ 1: Получаем заказы пользователя
    console.log(`🔍 Ищем заказы для пользователя ${userId}...`);
    
    const ordersResponse = await fetch(
      `${STRAPI_URL}/api/orders?filters[user][id][$eq]=${userId}&populate=order_item&sort[0]=createdAt:desc`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!ordersResponse.ok) {
      const errorText = await ordersResponse.text();
      console.error('❌ Ошибка получения заказов из Strapi:', errorText);
      return NextResponse.json(
        { success: false, error: 'Ошибка загрузки заказов' },
        { status: 500 }
      );
    }

    const ordersData = await ordersResponse.json();
    console.log(`📦 Найдено заказов: ${ordersData.data?.length || 0}`);

    // ✅ ШАГ 2: Получаем все order-items с полными данными (фото, размеры)
    const orderItemsResponse = await fetch(
      `${STRAPI_URL}/api/order-items?populate=*`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    let orderItemsData: any = { data: [] };
    if (orderItemsResponse.ok) {
      orderItemsData = await orderItemsResponse.json();
      console.log(`📦 Найдено позиций заказов с полными данными: ${orderItemsData.data?.length || 0}`);
    }

    // ✅ ШАГ 3: Создаем карту order-items для быстрого поиска по orderId
    const orderItemsMap = new Map();
    (orderItemsData.data || []).forEach((item: any) => {
      if (item.orderId) {
        orderItemsMap.set(item.orderId, item);
      }
    });

    // ✅ ШАГ 4: Преобразуем данные, объединяя информацию
    const orders: UserOrder[] = (ordersData.data || []).map((order: any) => {
      // Ищем полную информацию о позиции заказа из второго API
      const fullOrderItem = orderItemsMap.get(order.id.toString());
      
      // Используем базовую информацию из первого API или полную из второго
      const orderItemData = fullOrderItem || order.order_item;
      
      console.log(`🔍 Обрабатываем заказ ${order.orderNumber}:`, {
        hasBasicOrderItem: !!order.order_item,
        hasFullOrderItem: !!fullOrderItem,
        productName: orderItemData?.productName,
        hasProduct: !!orderItemData?.product,
        hasSize: !!orderItemData?.size
      });

      // Формируем товары заказа
      const items: OrderItem[] = [];
      
      if (orderItemData) {
        items.push({
          id: orderItemData.id.toString(),
          // НАЗВАНИЕ: берем из productName или из связанного продукта
          productName: orderItemData.productName || orderItemData.product?.name || `Товар ${orderItemData.productId}`,
          quantity: orderItemData.quantity || 1,
          // РАЗМЕР: берем из связанного size объекта
          size: orderItemData.size?.value || orderItemData.size?.productName || 'ONE SIZE',
          priceAtTime: parseFloat(orderItemData.priceAtTime) || 0,
          // ФОТО: берем из связанного продукта (уже полный URL)
          productImage: orderItemData.product?.mainPhoto || '/api/placeholder/98/50'
        });

        console.log(`✅ Товар для заказа ${order.orderNumber}:`, {
          name: items[0].productName,
          size: items[0].size,
          hasImage: items[0].productImage !== '/api/placeholder/98/50'
        });
      } else {
        console.log(`⚠️ Нет данных о товаре для заказа ${order.orderNumber}`);
      }

      return {
        id: order.id.toString(),
        orderNumber: order.orderNumber,
        totalAmount: parseFloat(order.totalAmount) || 0,
        orderStatus: order.orderStatus || 'pending',
        paymentStatus: order.paymentStatus || 'pending',
        deliveryMethod: order.deliveryMethod || '',
        paymentMethod: order.paymentMethod || '',
        deliveryAddress: order.deliveryAddress || '',
        customerName: order.customerName || '',
        customerPhone: order.customerPhone || '',
        customerEmail: order.customerEmail || '',
        notes: order.notes || '',
        createdAt: order.createdAt,
        items
      };
    });

    console.log('✅ Заказы пользователя обработаны:', orders.length);

    return NextResponse.json({
      success: true,
      orders,
      count: orders.length,
      message: 'Заказы успешно загружены'
    });

  } catch (error) {
    console.error('❌ Ошибка получения заказов пользователя:', error);
    
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