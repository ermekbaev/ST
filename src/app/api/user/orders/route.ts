// src/app/api/user/orders/route.ts - ОБНОВЛЕНО С ПРАВИЛЬНЫМ POPULATE
import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 API: Запрос истории заказов пользователя');
    
    // Проверяем авторизацию
    const authHeader = request.headers.get('authorization');
    const userToken = authHeader?.replace('Bearer ', '') || null;
    
    if (!userToken) {
      return NextResponse.json({ success: false, error: 'Необходима авторизация' }, { status: 401 });
    }

    // Получаем данные пользователя
    const userResponse = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: { 'Authorization': `Bearer ${userToken}` },
    });

    if (!userResponse.ok) {
      return NextResponse.json({ success: false, error: 'Недействительный токен' }, { status: 401 });
    }

    const userData = await userResponse.json();
    const userId = userData.id;
    console.log('✅ Пользователь найден:', userId);

    // ✅ ШАГ 1: Получаем заказы с ПОЛНЫМ populate для order_items
    console.log(`🔍 Загружаем заказы для пользователя ${userId} с полным populate...`);
    
    let ordersData = null;
    let workingPopulateField = 'order_items';

    try {
      // ✅ ИСПОЛЬЗУЕМ РАСШИРЕННЫЙ POPULATE ДЛЯ ЗАГРУЗКИ PRODUCT И SIZE
      const ordersResponse = await fetch(
        `${STRAPI_URL}/api/orders?filters[user][id][$eq]=${userId}&populate[order_items][populate][0]=product&populate[order_items][populate][1]=size&sort[0]=createdAt:desc&pagination[limit]=200`,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (ordersResponse.ok) {
        ordersData = await ordersResponse.json();
        console.log(`✅ Загружены заказы с расширенным populate для order_items`);
        console.log(`📊 Найдено заказов: ${ordersData.data?.length || 0}`);
        
        // Проверяем качество populate
        ordersData.data?.forEach((order: any, index: number) => {
          console.log(`📋 Заказ ${index + 1} (${order.orderNumber}): order_items = ${order.order_items?.length || 0}`);
          if (order.order_items?.length > 0) {
            order.order_items.forEach((item: any, itemIndex: number) => {
              console.log(`  Товар ${itemIndex + 1}: product=${!!item.product}, size=${!!item.size}, mainPhoto=${!!item.product?.mainPhoto}`);
            });
          }
        });
      } else {
        console.warn('⚠️ Расширенный populate не сработал, пробуем простой...');
        throw new Error('Расширенный populate не удался');
      }
    } catch (error) {
      console.warn('⚠️ Расширенный populate не удался, пробуем простой populate...', error);
      
      // Fallback на простой populate
      try {
        const ordersResponse = await fetch(
          `${STRAPI_URL}/api/orders?filters[user][id][$eq]=${userId}&populate=order_items&sort[0]=createdAt:desc&pagination[limit]=200`,
          { headers: { 'Content-Type': 'application/json' } }
        );

        if (ordersResponse.ok) {
          ordersData = await ordersResponse.json();
          console.log(`✅ Загружены заказы с простым populate order_items`);
        } else {
          throw new Error('Простой populate тоже не удался');
        }
      } catch (fallbackError) {
        console.warn('⚠️ Простой populate тоже не удался, загружаем без populate...', fallbackError);
        
        // Последний fallback - без populate
        const ordersResponse = await fetch(
          `${STRAPI_URL}/api/orders?filters[user][id][$eq]=${userId}&sort[0]=createdAt:desc&pagination[limit]=200`,
          { headers: { 'Content-Type': 'application/json' } }
        );

        if (!ordersResponse.ok) {
          const errorText = await ordersResponse.text();
          console.error('❌ Ошибка получения заказов из Strapi:', errorText);
          return NextResponse.json(
            { success: false, error: 'Ошибка загрузки заказов' },
            { status: 500 }
          );
        }

        ordersData = await ordersResponse.json();
        workingPopulateField = null;
        console.log('⚠️ Загружены заказы БЕЗ populate');
      }
    }

    console.log(`📦 Найдено заказов: ${ordersData.data?.length || 0}`);

    // ✅ ШАГ 2: Получаем ВСЕ order-items отдельно как запасной вариант
    console.log('🔄 Загружаем все order-items как запасной вариант...');
    
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

    // ✅ ШАГ 3: ОБРАБОТКА КАЖДОГО ЗАКАЗА
    const orders: any[] = [];

    for (const order of ordersData.data || []) {
      console.log(`\n🔍 === ЗАКАЗ ${order.orderNumber} (ID: ${order.id}) ===`);
      
      // ✅ ПРОВЕРЯЕМ order_items из заказа (с populate)
      let orderItems: any[] = [];
      
      if (order.order_items && Array.isArray(order.order_items) && order.order_items.length > 0) {
        orderItems = order.order_items;
        console.log(`✅ ${order.orderNumber}: Найдено ${orderItems.length} товаров через populate order_items`);
        
        // Проверим качество populate для каждого товара
        orderItems.forEach((item, index) => {
          console.log(`  Товар ${index + 1}: product=${!!item.product}, size=${!!item.size}, productName=${item.productName}, mainPhoto=${!!item.product?.mainPhoto}`);
        });
      }
      
      // ✅ ЕСЛИ НЕТ POPULATED ДАННЫХ, ищем в отдельно загруженных order-items
      if (orderItems.length === 0) {
        console.log(`⚠️ ${order.orderNumber}: Нет populated order_items, ищем отдельно...`);
        
        // Точное совпадение orderId
        const exactMatches = allOrderItems.filter((item: any) => 
          item.orderId === order.id.toString()
        );
        
        if (exactMatches.length > 0) {
          orderItems = exactMatches;
          console.log(`✅ ${order.orderNumber}: Найдено ${orderItems.length} товаров через точное совпадение orderId`);
        }
        // Близкие ID
        else {
          const closeMatches = allOrderItems.filter((item: any) => {
            const itemOrderId = parseInt(item.orderId);
            const targetOrderId = parseInt(order.id.toString());
            const diff = Math.abs(itemOrderId - targetOrderId);
            return diff <= 10 && diff > 0;
          });
          
          if (closeMatches.length > 0) {
            closeMatches.sort((a: any, b: any) => {
              const diffA = Math.abs(parseInt(a.orderId) - parseInt(order.id.toString()));
              const diffB = Math.abs(parseInt(b.orderId) - parseInt(order.id.toString()));
              return diffA - diffB;
            });
            
            const minDiff = Math.abs(parseInt(closeMatches[0].orderId) - parseInt(order.id.toString()));
            orderItems = closeMatches.filter((item: any) => {
              const diff = Math.abs(parseInt(item.orderId) - parseInt(order.id.toString()));
              return diff === minDiff;
            });
            
            console.log(`✅ ${order.orderNumber}: Найдено ${orderItems.length} товаров через близкое совпадение (разность: ${minDiff})`);
          }
        }
      }

      // ✅ ШАГ 4: ОБРАБОТКА ВСЕХ НАЙДЕННЫХ ТОВАРОВ
      const items: any[] = [];
      
      for (let i = 0; i < orderItems.length; i++) {
        const orderItemData = orderItems[i];
        console.log(`\n🛍️ ${order.orderNumber}: Обрабатываем товар ${i + 1}/${orderItems.length} (ID: ${orderItemData.id})`);

        // ✅ ПОЛУЧАЕМ ИЗОБРАЖЕНИЕ ДЛЯ КАЖДОГО ТОВАРА
        let productImage = '/api/placeholder/98/50';
        let imageSource = 'placeholder';

        // 1. Проверяем связанный product из populate
        if (orderItemData.product?.mainPhoto) {
          productImage = orderItemData.product.mainPhoto;
          imageSource = 'populated_product';
          console.log(`✅ ${order.orderNumber}: Товар ${i + 1} - изображение из populated product: ${productImage.substring(0, 50)}...`);
        }
        // 2. Если нет populated product, загружаем по productId
        else if (orderItemData.productId) {
          console.log(`🔍 ${order.orderNumber}: Товар ${i + 1} - загружаем продукт ${orderItemData.productId} по API...`);
          
          try {
            const productResponse = await fetch(
              `${STRAPI_URL}/api/products/${orderItemData.productId}?fields[0]=mainPhoto&fields[1]=name`,
              { headers: { 'Content-Type': 'application/json' } }
            );
            
            if (productResponse.ok) {
              const productData = await productResponse.json();
              const mainPhoto = productData.data?.attributes?.mainPhoto || productData.data?.mainPhoto;
              
              if (mainPhoto) {
                productImage = mainPhoto;
                imageSource = 'fetched_product';
                console.log(`✅ ${order.orderNumber}: Товар ${i + 1} - изображение получено по API: ${mainPhoto.substring(0, 50)}...`);
              } else {
                console.log(`⚠️ ${order.orderNumber}: Товар ${i + 1} - у продукта нет mainPhoto`);
              }
            } else {
              console.log(`❌ ${order.orderNumber}: Товар ${i + 1} - продукт не найден (${productResponse.status})`);
            }
          } catch (error) {
            console.error(`❌ ${order.orderNumber}: Товар ${i + 1} - ошибка загрузки продукта:`, error);
          }
        }

        // ✅ СОЗДАЕМ ТОВАР С ВСЕЙ ИНФОРМАЦИЕЙ
        const item = {
          id: orderItemData.id.toString(),
          productName: orderItemData.productName || orderItemData.product?.name || orderItemData.product?.attributes?.name || `Товар ${orderItemData.productId}`,
          quantity: orderItemData.quantity || 1,
          size: orderItemData.size?.value || orderItemData.size?.attributes?.value || 'ONE SIZE',
          priceAtTime: parseFloat(orderItemData.priceAtTime) || 0,
          productImage
        };

        items.push(item);

        console.log(`📋 ${order.orderNumber}: Товар ${i + 1} создан:`, {
          name: item.productName,
          size: item.size,
          quantity: item.quantity,
          imageSource: imageSource,
          hasRealImage: item.productImage !== '/api/placeholder/98/50',
          finalImageUrl: item.productImage === '/api/placeholder/98/50' ? 'placeholder' : `${item.productImage.substring(0, 50)}...`
        });
      }

      // ✅ ШАГ 5: СОЗДАЕМ ЗАКАЗ С ВСЕМИ ТОВАРАМИ
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
        items
      };

      console.log(`📋 ${order.orderNumber}: ИТОГОВЫЙ ЗАКАЗ:`, {
        totalItems: items.length,
        itemsWithImages: items.filter(item => item.productImage !== '/api/placeholder/98/50').length,
        itemsWithPlaceholders: items.filter(item => item.productImage === '/api/placeholder/98/50').length,
        populateSource: workingPopulateField || 'separate_fetch'
      });

      orders.push(orderResult);
    }

    // ✅ ФИНАЛЬНАЯ СТАТИСТИКА
    console.log('\n🎯 === ФИНАЛЬНАЯ СТАТИСТИКА ===');
    const totalItems = orders.reduce((sum, order) => sum + order.items.length, 0);
    const itemsWithImages = orders.reduce((sum, order) => 
      sum + order.items.filter((item: { productImage: string; }) => item.productImage !== '/api/placeholder/98/50').length, 0
    );
    const itemsWithPlaceholders = orders.reduce((sum, order) => 
      sum + order.items.filter((item: { productImage: string; }) => item.productImage === '/api/placeholder/98/50').length, 0
    );
    const ordersWithoutItems = orders.filter(o => o.items.length === 0).length;
    
    console.log(`📊 Всего заказов: ${orders.length}`);
    console.log(`📊 Всего товаров: ${totalItems}`);
    console.log(`📊 Товаров с фото: ${itemsWithImages}`);
    console.log(`📊 Товаров с placeholder: ${itemsWithPlaceholders}`);
    console.log(`📊 Заказов без товаров: ${ordersWithoutItems}`);
    console.log(`📊 Рабочее поле populate: ${workingPopulateField || 'НЕТ'}`);

    return NextResponse.json({
      success: true,
      orders,
      count: orders.length,
      totalOrderItems: allOrderItems.length,
      debug: {
        totalOrders: orders.length,
        totalItems: totalItems,
        itemsWithImages: itemsWithImages,
        itemsWithPlaceholders: itemsWithPlaceholders,
        ordersWithoutItems: ordersWithoutItems,
        workingPopulateField: workingPopulateField,
        orderIds: ordersData.data?.map((o: any) => o.id) || [],
        orderItemOrderIds: allOrderItems.map((item: any) => item.orderId).filter(Boolean)
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