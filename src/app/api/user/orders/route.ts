// src/app/api/user/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  size: string;
  priceAtTime: number;
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

    // ✅ Получаем заказы пользователя из Strapi
    console.log(`🔍 Ищем заказы для пользователя ${userId}...`);
    
    const ordersResponse = await fetch(
      `${STRAPI_URL}/api/orders?filters[user][id][$eq]=${userId}&populate[order_items]=*&sort[0]=createdAt:desc`,
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

    // ✅ Преобразуем данные в формат для фронтенда
    const orders: UserOrder[] = (ordersData.data || []).map((order: any) => {
      // Формируем товары заказа
      const items: OrderItem[] = (order.order_items || []).map((item: any) => ({
        id: item.id.toString(),
        productName: item.productName || `Товар ${item.productId}`,
        quantity: item.quantity || 1,
        size: item.size || 'ONE SIZE',
        priceAtTime: parseFloat(item.priceAtTime) || 0
      }));

      return {
        id: order.id.toString(),
        orderNumber: order.orderNumber,
        totalAmount: parseFloat(order.totalAmount) || 0,
        orderStatus: order.orderStatus || 'pending',
        paymentStatus: order.paymentStatus || 'pending',
        deliveryMethod: order.deliveryMethod || '',
        paymentMethod: order.paymentMethod || '',
        deliveryAddress: order.deliveryAddress || '',
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

// ✅ Вспомогательные функции для читаемых названий
function getDeliveryMethodName(method: string): string {
  const methods: Record<string, string> = {
    'store_pickup': 'Самовывоз из магазина',
    'courier_ts': 'Курьер TS',
    'cdek_pickup': 'СДЭК до пункта выдачи',
    'cdek_courier': 'СДЭК курьером'
  };
  return methods[method] || method;
}

function getPaymentMethodName(method: string): string {
  const methods: Record<string, string> = {
    'card': 'Онлайн картой',
    'cash_vladivostok': 'Наличными во Владивостоке'
  };
  return methods[method] || method;
}

function getOrderStatusName(status: string): string {
  const statuses: Record<string, string> = {
    'pending': 'В обработке',
    'confirmed': 'Подтвержден',
    'shipped': 'Отправлен',
    'delivered': 'Доставлен',
    'cancelled': 'Отменен'
  };
  return statuses[status] || status;
}

function getPaymentStatusName(status: string): string {
  const statuses: Record<string, string> = {
    'pending': 'Ожидает оплаты',
    'paid': 'Оплачен',
    'failed': 'Ошибка оплаты'
  };
  return statuses[status] || status;
}