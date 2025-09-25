import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function GET(request: NextRequest) {
  try {
    
    const authHeader = request.headers.get('authorization');
    const userToken = authHeader?.replace('Bearer ', '') || null;
    
    if (!userToken) {
      return NextResponse.json({ success: false, error: 'Необходима авторизация' }, { status: 401 });
    }

    const userResponse = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: { 'Authorization': `Bearer ${userToken}` },
    });

    if (!userResponse.ok) {
      return NextResponse.json({ success: false, error: 'Недействительный токен' }, { status: 401 });
    }

    const userData = await userResponse.json();
    const userId = userData.id;

    let ordersData = null;
    let workingPopulateField: string | null = 'order_items'; // ✅ ИСПРАВЛЕНО: правильная типизация

    try {
      const ordersResponse = await fetch(
        `${STRAPI_URL}/api/orders?filters[user][id][$eq]=${userId}&populate[order_items][populate][0]=product&populate[order_items][populate][1]=size&sort[0]=createdAt:desc&pagination[limit]=200`,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (ordersResponse.ok) {
        ordersData = await ordersResponse.json();
        
        ordersData.data?.forEach((order: any, index: number) => {
          if (order.order_items?.length > 0) {
            order.order_items.forEach((item: any, itemIndex: number) => {
            });
          }
        });
      } else {
        console.warn('⚠️ Расширенный populate не сработал, пробуем простой...');
        throw new Error('Расширенный populate не удался');
      }
    } catch (error) {
      console.warn('⚠️ Расширенный populate не удался, пробуем простой populate...', error);
      
      try {
        const ordersResponse = await fetch(
          `${STRAPI_URL}/api/orders?filters[user][id][$eq]=${userId}&populate=order_items&sort[0]=createdAt:desc&pagination[limit]=200`,
          { headers: { 'Content-Type': 'application/json' } }
        );

        if (ordersResponse.ok) {
          ordersData = await ordersResponse.json();
        } else {
          throw new Error('Простой populate тоже не удался');
        }
      } catch (fallbackError) {
        console.warn('⚠️ Простой populate тоже не удался, загружаем без populate...', fallbackError);
        
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
      }
    }

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

    const orders: any[] = [];

    for (const order of ordersData.data || []) {
      
      let orderItems: any[] = [];
      
      if (order.order_items && Array.isArray(order.order_items) && order.order_items.length > 0) {
        orderItems = order.order_items;
        
      }
      
      if (orderItems.length === 0) {
        
        const exactMatches = allOrderItems.filter((item: any) => 
          item.orderId === order.id.toString()
        );
        
        if (exactMatches.length > 0) {
          orderItems = exactMatches;
        }
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
            
          }
        }
      }

      const items: any[] = [];
      
      for (let i = 0; i < orderItems.length; i++) {
        const orderItemData = orderItems[i];
        let productImage = '/api/placeholder/98/50';
        let imageSource = 'placeholder';

        if (orderItemData.product?.mainPhoto) {
          productImage = orderItemData.product.mainPhoto;
          imageSource = 'populated_product';
        }
        else if (orderItemData.productId) {
          
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
              } else {
              }
            } else {
            }
          } catch (error) {
            console.error(`❌ ${order.orderNumber}: Товар ${i + 1} - ошибка загрузки продукта:`, error);
          }
        }

        const item = {
          id: orderItemData.id.toString(),
          productName: orderItemData.productName || orderItemData.product?.name || orderItemData.product?.attributes?.name || `Товар ${orderItemData.productId}`,
          quantity: orderItemData.quantity || 1,
          size: orderItemData.size?.value || orderItemData.size?.attributes?.value || 'ONE SIZE',
          priceAtTime: parseFloat(orderItemData.priceAtTime) || 0,
          productImage
        };

        items.push(item);
      }

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

      orders.push(orderResult);
    }

    const totalItems = orders.reduce((sum, order) => sum + order.items.length, 0);
    const itemsWithImages = orders.reduce((sum, order) => 
      sum + order.items.filter((item: { productImage: string; }) => item.productImage !== '/api/placeholder/98/50').length, 0
    );
    const itemsWithPlaceholders = orders.reduce((sum, order) => 
      sum + order.items.filter((item: { productImage: string; }) => item.productImage === '/api/placeholder/98/50').length, 0
    );
    const ordersWithoutItems = orders.filter(o => o.items.length === 0).length;
    
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