// src/app/api/products/route.ts - ПРАВИЛЬНЫЙ для вашей структуры Strapi

import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 API: Получен запрос на товары');
    
    // Запрос товаров с populate=*
    const strapiUrl = `${STRAPI_URL}/api/products?populate=*`;
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
        message: 'Нет товаров в Strapi'
      });
    }

    // Обрабатываем товары из реальной структуры Strapi
    const products = strapiData.data.map((item: any) => {
      console.log(`🔄 Обрабатываем товар:`, item.name || 'Без названия');
      
      // В новой версии Strapi данные лежат прямо в корне item, без attributes
      const data = item; // не item.attributes!
      
      // Извлекаем размеры с ценами из массива sizes
      let productSizes = [];
      
      if (data.sizes && Array.isArray(data.sizes)) {
        productSizes = data.sizes
          .filter((sizeItem: any) => {
            // Фильтруем размеры, у которых есть цена и количество
            return sizeItem.price !== null && 
                   sizeItem.stockQuantity !== null;
          })
          .map((sizeItem: any) => {
            console.log(`📏 Обрабатываем размер:`, {
              value: sizeItem.value,
              price: sizeItem.price,
              stockQuantity: sizeItem.stockQuantity,
              reservedQuantity: sizeItem.reservedQuantity
            });
            
            // Вычисляем доступное количество
            const stockQty = sizeItem.stockQuantity || 0;
            const reservedQty = sizeItem.reservedQuantity || 0;
            const availableQty = Math.max(0, stockQty - reservedQty);
            
            return {
              id: sizeItem.id,
              size: String(sizeItem.value || ''),
              price: sizeItem.price || 0,
              originalPrice: sizeItem.originalPrice,
              available: availableQty > 0,
              stockQuantity: stockQty,
              reservedQuantity: reservedQty,
              availableQuantity: availableQty
            };
          });
        
        // Сортируем размеры по числовому значению
        productSizes.sort((a: any, b: any) => {
          const aNum = parseFloat(a.size.replace(/[^\d.]/g, ''));
          const bNum = parseFloat(b.size.replace(/[^\d.]/g, ''));
          return aNum - bNum;
        });
        
        console.log(`✅ Размеры с ценами:`, productSizes.map((s: { size: any; price: any; }) => `${s.size}: ${s.price}₽`));
      } else {
        console.log(`⚠️ Размеры не найдены для товара:`, data.name);
      }

      // Извлекаем связанные данные (они лежат прямо в объектах)
      const brand = data.brand?.name ? String(data.brand.name) : 'Не указан';
      const category = data.category?.name ? String(data.category.name) : 'Не указана';
      const gender = data.gender?.name ? String(data.gender.name) : 'Унисекс';

      // Находим базовую цену (минимальную среди размеров)
      const basePrice = productSizes.length > 0 
        ? Math.min(...productSizes.map((s: any) => s.price))
        : 0;

      // Обрабатываем фото
      const mainPhoto = String(data.mainPhoto || '/images/placeholder.jpg');
      let additionalPhotos = [];
      
      // addTotalPhotos может быть массивом или null
      if (data.addTotalPhotos && Array.isArray(data.addTotalPhotos)) {
        additionalPhotos = data.addTotalPhotos;
      }
      
      const product = {
        id: String(item.id || ''),
        article: String(data.article || ''),
        brand: brand,
        name: String(data.name || ''),
        
        // Для совместимости со старыми компонентами
        size: productSizes[0]?.size || '',
        sizes: productSizes.map((s: any) => s.size),
        
        // Новый формат с полной информацией о размерах и ценах
        allSizes: productSizes,
        
        category: category,
        gender: gender,
        price: basePrice, // Минимальная цена среди размеров
        
        // Фото
        photo: mainPhoto,
        mainPhoto: mainPhoto,
        additionalPhotos: additionalPhotos,
        
        // Общая информация о наличии
        stockQuantity: productSizes.reduce((sum: number, s: any) => sum + (s.stockQuantity || 0), 0),
        availableStock: productSizes.reduce((sum: number, s: any) => sum + (s.availableQuantity || 0), 0),
        inStock: productSizes.some((s: any) => s.available),
        
        isActive: data.isActive !== false,
        slug: String(data.slug || ''),
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
      
      console.log(`✅ Товар обработан:`, {
        name: product.name,
        brand: product.brand,
        category: product.category,
        basePrice: product.price,
        sizesCount: product.allSizes.length,
        availableSizes: product.allSizes.filter((s: { available: any; }) => s.available).length
      });
      
      return product;
    });
    
    console.log(`✅ API: Возвращаем ${products.length} товаров с индивидуальными ценами размеров`);
    
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
        suggestion: 'Проверьте что Strapi запущен на localhost:1337 и содержит товары с размерами'
      },
      { status: 500 }
    );
  }
}