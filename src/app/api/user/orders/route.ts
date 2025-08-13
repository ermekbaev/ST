// src/app/api/user/orders/route.ts - ФИНАЛЬНАЯ ИСПРАВЛЕННАЯ ВЕРСИЯ
import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 API: Запрос истории заказов пользователя');
    
    // ✅ Проверяем авторизацию
    const authHeader = request.headers.get('authorization');
    const userToken = authHeader?.replace('Bearer ', '') || null;
    
    if (!userToken) {
      return NextResponse.json({ success: false, error: 'Необходима авторизация' }, { status: 401 });
    }

    // ✅ Получаем данные пользователя
    const userResponse = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: { 'Authorization': `Bearer ${userToken}` },
    });

    if (!userResponse.ok) {
      return NextResponse.json({ success: false, error: 'Недействительный токен' }, { status: 401 });
    }

    const userData = await userResponse.json();
    const userId = userData.id;
    console.log('✅ Пользователь найден:', userId);

    // ✅ ШАГ 1: Получаем заказы пользователя
    const ordersResponse = await fetch(
      `${STRAPI_URL}/api/orders?filters[user][id][$eq]=${userId}&sort[0]=createdAt:desc&pagination[limit]=200`,
      { headers: { 'Content-Type': 'application/json' } }
    );

    const ordersData = await ordersResponse.json();
    console.log(`📦 Найдено заказов: ${ordersData.data?.length || 0}`);

    // ✅ ШАГ 2: Получаем ВСЕ order-items
    let allOrderItems: any[] = [];
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages && currentPage <= 20) {
      const orderItemsResponse = await fetch(
        `${STRAPI_URL}/api/order-items?populate=*&pagination[page]=${currentPage}&pagination[pageSize]=100`,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (!orderItemsResponse.ok) break;

      const pageData = await orderItemsResponse.json();
      const pageItems = pageData.data || [];
      
      allOrderItems = [...allOrderItems, ...pageItems];
      
      const pagination = pageData.meta?.pagination;
      hasMorePages = pagination && currentPage < pagination.pageCount;
      currentPage++;
    }

    console.log(`📦 ИТОГО загружено order-items: ${allOrderItems.length}`);

    // ✅ ШАГ 3: УЛУЧШЕННОЕ СВЯЗЫВАНИЕ - ищем order-items для каждого заказа
    console.log('\n🔍 === АНАЛИЗ СВЯЗЕЙ ЗАКАЗОВ И ORDER-ITEMS ===');
    
    // Показываем ID всех заказов
    const orderIds = (ordersData.data || []).map((o: any) => o.id);
    console.log('📋 ID заказов пользователя:', orderIds);
    
    // Показываем orderId всех order-items
    const orderItemOrderIds = allOrderItems.map((item: any) => item.orderId).filter(Boolean);
    console.log('📋 orderId в order-items:', orderItemOrderIds);

    // ✅ ШАГ 4: ОБРАБОТКА КАЖДОГО ЗАКАЗА
    const orders: any[] = [];

    for (const order of ordersData.data || []) {
      console.log(`\n🔍 === ЗАКАЗ ${order.orderNumber} (ID: ${order.id}) ===`);
      
      // Ищем order-items для этого заказа разными способами
      let orderItemData = null;
      let matchMethod = 'none';

      // СПОСОБ 1: Точное совпадение orderId
      const exactMatch = allOrderItems.find((item: any) => 
        item.orderId === order.id.toString()
      );
      
      if (exactMatch) {
        orderItemData = exactMatch;
        matchMethod = 'exact';
        console.log(`✅ ${order.orderNumber}: Найдено точное совпадение orderId`);
      }
      
      // СПОСОБ 2: Близкие ID (в пределах ±10)
      if (!orderItemData) {
        const closeMatches = allOrderItems.filter((item: any) => {
          const itemOrderId = parseInt(item.orderId);
          const targetOrderId = parseInt(order.id.toString());
          const diff = Math.abs(itemOrderId - targetOrderId);
          return diff <= 10 && diff > 0;
        });
        
        if (closeMatches.length === 1) {
          orderItemData = closeMatches[0];
          matchMethod = 'close';
          console.log(`✅ ${order.orderNumber}: Найдено близкое совпадение (orderId: ${closeMatches[0].orderId})`);
        } else if (closeMatches.length > 1) {
          // Берем самое близкое
          closeMatches.sort((a: any, b: any) => {
            const diffA = Math.abs(parseInt(a.orderId) - parseInt(order.id.toString()));
            const diffB = Math.abs(parseInt(b.orderId) - parseInt(order.id.toString()));
            return diffA - diffB;
          });
          orderItemData = closeMatches[0];
          matchMethod = 'closest';
          console.log(`✅ ${order.orderNumber}: Выбрано ближайшее совпадение (orderId: ${closeMatches[0].orderId})`);
        }
      }

      // СПОСОБ 3: По времени создания (в пределах 5 минут)
      if (!orderItemData) {
        const orderTime = new Date(order.createdAt).getTime();
        const timeMatches = allOrderItems.filter((item: any) => {
          const itemTime = new Date(item.createdAt).getTime();
          const timeDiff = Math.abs(orderTime - itemTime);
          return timeDiff <= 5 * 60 * 1000; // 5 минут
        });
        
        if (timeMatches.length === 1) {
          orderItemData = timeMatches[0];
          matchMethod = 'time';
          console.log(`✅ ${order.orderNumber}: Найдено совпадение по времени`);
        }
      }

      // ✅ ШАГ 5: ОБРАБОТКА ИЗОБРАЖЕНИЯ
      let productImage = '/api/placeholder/98/50';
      let imageSource = 'placeholder';

      if (orderItemData) {
        console.log(`📋 ${order.orderNumber}: OrderItem найден (${matchMethod}), productId: ${orderItemData.productId}`);
        
        // 1. Проверяем связанный product
        if (orderItemData.product?.mainPhoto) {
          productImage = orderItemData.product.mainPhoto;
          imageSource = 'linked_product';
          console.log(`✅ ${order.orderNumber}: Изображение из связанного продукта`);
        }
        // 2. Загружаем продукт по API
        else if (orderItemData.productId) {
          console.log(`🔍 ${order.orderNumber}: Загружаем продукт ${orderItemData.productId}...`);
          
          try {
            // ИСПРАВЛЕНО: Используем правильный endpoint с полями
            const productResponse = await fetch(
              `${STRAPI_URL}/api/products/${orderItemData.productId}?fields[0]=mainPhoto&fields[1]=name`,
              { headers: { 'Content-Type': 'application/json' } }
            );
            
            console.log(`📡 ${order.orderNumber}: Статус запроса продукта: ${productResponse.status}`);
            
            if (productResponse.ok) {
              const productData = await productResponse.json();
              console.log(`📦 ${order.orderNumber}: Ответ продукта:`, {
                hasData: !!productData.data,
                attributes: productData.data?.attributes || productData.data,
                mainPhoto: productData.data?.attributes?.mainPhoto || productData.data?.mainPhoto
              });
              
              // ИСПРАВЛЕНО: Проверяем и attributes, и прямые поля
              const mainPhoto = productData.data?.attributes?.mainPhoto || productData.data?.mainPhoto;
              if (mainPhoto) {
                productImage = mainPhoto;
                imageSource = 'fetched_product';
                console.log(`✅ ${order.orderNumber}: Изображение получено по API: ${mainPhoto.substring(0, 50)}...`);
              } else {
                console.log(`⚠️ ${order.orderNumber}: У продукта нет mainPhoto`);
              }
            } else {
              console.log(`❌ ${order.orderNumber}: Продукт не найден (${productResponse.status})`);
            }
          } catch (error) {
            console.error(`❌ ${order.orderNumber}: Ошибка загрузки продукта:`, error);
          }
        }
      } else {
        console.log(`❌ ${order.orderNumber}: OrderItem НЕ НАЙДЕН`);
      }

      // ✅ ШАГ 6: СОЗДАЕМ ЗАКАЗ
      const orderResult = {
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
        items: orderItemData ? [{
          id: orderItemData.id.toString(),
          productName: orderItemData.productName || orderItemData.product?.name || orderItemData.product?.attributes?.name || `Товар ${orderItemData.productId}`,
          quantity: orderItemData.quantity || 1,
          size: orderItemData.size?.value || orderItemData.size?.attributes?.value || 'ONE SIZE',
          priceAtTime: parseFloat(orderItemData.priceAtTime) || 0,
          productImage
        }] : [],
        debug: {
          orderItemFound: !!orderItemData,
          matchMethod: matchMethod,
          imageSource: imageSource,
          productId: orderItemData?.productId,
          hasLinkedProduct: !!orderItemData?.product,
          orderItemOrderId: orderItemData?.orderId
        }
      };

      console.log(`📋 ${order.orderNumber}: ИТОГОВЫЙ РЕЗУЛЬТАТ:`, {
        hasItems: orderResult.items.length > 0,
        matchMethod: matchMethod,
        imageSource: imageSource,
        isPlaceholder: orderResult.items[0]?.productImage === '/api/placeholder/98/50'
      });

      orders.push(orderResult);
    }

    // ✅ ФИНАЛЬНАЯ СТАТИСТИКА
    console.log('\n🎯 === ФИНАЛЬНАЯ СТАТИСТИКА ===');
    const withImages = orders.filter(o => o.items.length > 0 && o.items[0].productImage !== '/api/placeholder/98/50').length;
    const withPlaceholders = orders.filter(o => o.items.length > 0 && o.items[0].productImage === '/api/placeholder/98/50').length;
    const withoutItems = orders.filter(o => o.items.length === 0).length;
    
    console.log(`📊 Заказов с фото: ${withImages}`);
    console.log(`📊 Заказов с placeholder: ${withPlaceholders}`);
    console.log(`📊 Заказов без товаров: ${withoutItems}`);

    return NextResponse.json({
      success: true,
      orders,
      count: orders.length,
      totalOrderItems: allOrderItems.length,
      debug: {
        ordersWithImages: withImages,
        ordersWithPlaceholders: withPlaceholders,
        ordersWithoutItems: withoutItems,
        totalOrderItems: allOrderItems.length,
        orderIds: orderIds,
        orderItemOrderIds: orderItemOrderIds
      }
    });

  } catch (error) {
    console.error('❌ Ошибка:', error);
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}