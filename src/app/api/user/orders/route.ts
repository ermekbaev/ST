// src/app/api/user/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  size: string;
  priceAtTime: number;
  productImage?: string;
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

    // ✅ ШАГ 2: Получаем ВСЕ order-items для отладки
    const orderItemsResponse = await fetch(
      `${STRAPI_URL}/api/order-items?populate=*&pagination[limit]=100`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    let orderItemsData: any = { data: [] };
    if (orderItemsResponse.ok) {
      orderItemsData = await orderItemsResponse.json();
      console.log(`📦 Найдено позиций заказов: ${orderItemsData.data?.length || 0}`);
      
      // Показываем все order-items для отладки
      console.log('🔍 ВСЕ ORDER-ITEMS:');
      (orderItemsData.data || []).forEach((item: any) => {
        console.log(`  - ID: ${item.id}, orderId: ${item.orderId}, productId: ${item.productId}, product: ${!!item.product}`);
      });
    }

    // ✅ ШАГ 3: Создаем карту order-items и проверяем близкие ID
    const orderItemsMap = new Map();
    const allOrderIds = (ordersData.data || []).map((o: any) => o.id);
    
    (orderItemsData.data || []).forEach((item: any) => {
      if (item.orderId) {
        console.log(`🗂️ Добавляем в карту: orderId=${item.orderId}, productId=${item.productId}, hasProduct=${!!item.product}`);
        orderItemsMap.set(item.orderId, item);
      }
    });

    console.log(`🗺️ Карта order-items содержит ключи:`, Array.from(orderItemsMap.keys()));
    console.log(`🗺️ Заказы пользователя имеют ID:`, allOrderIds);
    
    // НОВОЕ: Проверяем есть ли order-items с близкими ID
    console.log('\n🔍 ПОИСК СВЯЗЕЙ ПО БЛИЗКИМ ID:');
    allOrderIds.forEach((orderId: any) => {
      const orderIdStr = orderId.toString();
      const hasDirectMatch = orderItemsMap.has(orderIdStr);
      
      if (!hasDirectMatch) {
        // Ищем order-items с ID близкими к orderId
        const closeMatches = (orderItemsData.data || []).filter((item: any) => {
          const itemOrderId = parseInt(item.orderId);
          const targetOrderId = parseInt(orderIdStr);
          const diff = Math.abs(itemOrderId - targetOrderId);
          return diff <= 5; // В пределах 5 ID
        });
        
        console.log(`  Заказ ${orderIdStr}: прямого совпадения нет, близкие ID:`, 
          closeMatches.map((item: any) => `orderId=${item.orderId} (diff=${Math.abs(parseInt(item.orderId) - parseInt(orderIdStr))})`));
          
        // Если есть единственное близкое совпадение, используем его
        if (closeMatches.length === 1) {
          console.log(`  ✅ Используем близкое совпадение: orderId=${closeMatches[0].orderId} для заказа ${orderIdStr}`);
          orderItemsMap.set(orderIdStr, closeMatches[0]);
        }
      } else {
        console.log(`  Заказ ${orderIdStr}: ✅ есть прямое совпадение`);
      }
    });

    // ✅ ШАГ 4: Преобразуем данные с получением продуктов по ID
    const orders: UserOrder[] = [];

    for (const order of ordersData.data || []) {
      console.log(`\n🔍 === ОБРАБАТЫВАЕМ ЗАКАЗ ${order.orderNumber} (ID: ${order.id}) ===`);
      
      // Ищем полную информацию о позиции заказа
      const fullOrderItem = orderItemsMap.get(order.id.toString());
      const orderItemData = fullOrderItem || order.order_item;
      
      console.log(`📋 Информация о товаре:`, {
        orderIdString: order.id.toString(),
        hasBasicOrderItem: !!order.order_item,
        hasFullOrderItem: !!fullOrderItem,
        productId: orderItemData?.productId,
        productName: orderItemData?.productName,
        hasLinkedProduct: !!orderItemData?.product,
        productMainPhoto: orderItemData?.product?.mainPhoto
      });

      // Формируем товары заказа
      const items: OrderItem[] = [];
      
      if (orderItemData) {
        let productImage = '/api/placeholder/98/50';
        
        // Если есть связанный product с фото, используем его
        if (orderItemData.product?.mainPhoto) {
          productImage = orderItemData.product.mainPhoto;
          console.log(`✅ Используем фото из связанного продукта: ${productImage.substring(0, 50)}...`);
        }
        // НОВОЕ: Если нет связанного product, получаем его по productId
        else if (orderItemData.productId) {
          console.log(`🔍 Загружаем продукт по ID: ${orderItemData.productId}`);
          
          try {
            const productResponse = await fetch(
              `${STRAPI_URL}/api/products/${orderItemData.productId}`,
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );
            
            if (productResponse.ok) {
              const productData = await productResponse.json();
              if (productData.data?.mainPhoto) {
                productImage = productData.data.mainPhoto;
                console.log(`✅ Получено фото продукта: ${productImage.substring(0, 50)}...`);
              } else {
                console.log(`⚠️ У продукта ${orderItemData.productId} нет mainPhoto`);
              }
            } else {
              console.log(`⚠️ Продукт ${orderItemData.productId} не найден в API (статус: ${productResponse.status})`);
            }
          } catch (error) {
            console.warn(`⚠️ Ошибка загрузки продукта ${orderItemData.productId}:`, error);
          }
        }

        items.push({
          id: orderItemData.id.toString(),
          productName: orderItemData.productName || orderItemData.product?.name || `Товар ${orderItemData.productId}`,
          quantity: orderItemData.quantity || 1,
          size: orderItemData.size?.value || 'ONE SIZE',
          priceAtTime: parseFloat(orderItemData.priceAtTime) || 0,
          productImage
        });

        console.log(`✅ Товар для заказа ${order.orderNumber}:`, {
          name: items[0].productName,
          size: items[0].size,
          imageUrl: items[0].productImage,
          hasRealImage: items[0].productImage !== '/api/placeholder/98/50'
        });
      } else {
        console.log(`⚠️ НЕТ ДАННЫХ О ТОВАРЕ для заказа ${order.orderNumber} (order_item отсутствует)`);
      }

      orders.push({
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
      });
    }

    console.log('✅ Заказы пользователя обработаны:', orders.length);
    console.log('🔍 ИТОГОВЫЕ ДАННЫЕ ДЛЯ ФРОНТЕНДА:', JSON.stringify(orders, null, 2));

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