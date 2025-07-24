// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 API: Получен запрос на товары');
    
    // Делаем более простой запрос к Strapi
    const strapiUrl = `${STRAPI_URL}/api/products`;
    console.log('🔄 Запрашиваем:', strapiUrl);
    
    const strapiResponse = await fetch(strapiUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Ответ от Strapi:', strapiResponse.status, strapiResponse.statusText);

    if (!strapiResponse.ok) {
      console.error(`❌ Strapi недоступен: ${strapiResponse.status}`);
      return NextResponse.json(
        { 
          error: `Strapi недоступен (${strapiResponse.status})`,
          message: 'Убедитесь что Strapi запущен на localhost:1337'
        },
        { status: 502 }
      );
    }

    const strapiData = await strapiResponse.json();
    console.log('📦 Получено от Strapi:', strapiData.data?.length || 0, 'товаров');
    
    if (!strapiData.data || !Array.isArray(strapiData.data)) {
      return NextResponse.json({
        products: [],
        total: 0,
        message: 'Нет товаров в Strapi',
        debug: strapiData
      });
    }

    // ИСПРАВЛЕНО: данные лежат прямо в корне товара, без attributes
    const products = strapiData.data.map((item: any) => {
      console.log(`🔄 Обрабатываем товар:`, item.id, item.name);
      
      const sizes = ['40', '41', '42', '43']; // Временно статично
      const mainPhoto = item.mainPhoto || '/images/placeholder.jpg';
      
      return {
        id: item.id?.toString() || '',
        article: item.article || '',
        brand: 'Nike', // Временно статично, пока не настроили связи
        name: item.name || '',
        
        // ДЛЯ СОВМЕСТИМОСТИ - оба формата размеров:
        size: sizes[0] || '', // Первый размер для старых компонентов
        sizes: sizes,         // Массив размеров для новых компонентов
        
        category: 'Кроссовки',
        gender: 'Унисекс',
        price: item.price || 0,
        
        // ДЛЯ СОВМЕСТИМОСТИ - оба формата фото:
        photo: mainPhoto,     // Для старых компонентов
        mainPhoto: mainPhoto, // Для новых компонентов
        additionalPhotos: item.additionalPhotos || [],
        
        stockQuantity: item.stockQuantity || 0,
        availableStock: Math.max(0, (item.stockQuantity || 0) - (item.reservedQuantity || 0)),
        isActive: item.isActive !== false,
        slug: item.slug || item.documentId || '',
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      };
    });
    
    console.log(`✅ API: Возвращаем ${products.length} товаров`);
    
    return NextResponse.json({
      products,
      total: strapiData.meta?.pagination?.total || products.length,
    });

  } catch (error) {
    console.error('❌ API: Ошибка загрузки товаров:', error);
    return NextResponse.json(
      { 
        error: 'Ошибка подключения к Strapi',
        message: error instanceof Error ? error.message : 'Неизвестная ошибка',
        suggestion: 'Проверьте что Strapi запущен на localhost:1337 и содержит товары'
      },
      { status: 500 }
    );
  }
}