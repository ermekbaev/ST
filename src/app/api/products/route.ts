// src/app/api/products/route.ts - ПОЛНЫЙ КОД С КЭШИРОВАНИЕМ

import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// Кэш товаров
let cachedProducts: { products: any; total?: any; } | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 минут кэш

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 API: Получен запрос на товары');
    
    // Проверяем кэш
    const now = Date.now();
    const cacheAge = now - cacheTimestamp;
    const isCacheValid = cachedProducts && cacheAge < CACHE_DURATION;
    
    if (isCacheValid) {//@ts-ignore
      console.log(`📦 Возвращаем ${cachedProducts.products.length} товаров из кэша (возраст: ${Math.round(cacheAge / 1000)}с)`);
      return NextResponse.json(cachedProducts);
    }
    
    console.log('🔄 Кэш устарел или пустой, загружаем свежие данные...');
    
    // Функция для получения всех товаров через параллельные запросы
    const getAllProductsParallel = async () => {
      console.log('📦 Загружаем товары через параллельные запросы...');
      
      // Сначала получаем общее количество товаров
      const firstPageUrl = `${STRAPI_URL}/api/products?populate=*&pagination[page]=1&pagination[pageSize]=100`;
      const firstResponse = await fetch(firstPageUrl);
      
      if (!firstResponse.ok) {
        throw new Error(`Ошибка получения первой страницы: ${firstResponse.status}`);
      }
      
      const firstData = await firstResponse.json();
      const totalItems = firstData.meta?.pagination?.total || 0;
      const pageSize = 100;
      const totalPages = Math.ceil(totalItems / pageSize);
      
      console.log(`📊 Найдено ${totalItems} товаров на ${totalPages} страницах`);
      
      // Если всего одна страница, возвращаем её
      if (totalPages <= 1) {
        return firstData.data || [];
      }
      
      // Создаем массив промисов для параллельной загрузки остальных страниц
      const promises = [];
      
      // Добавляем первую страницу
      promises.push(Promise.resolve(firstData.data));
      
      // Создаем промисы для остальных страниц
      for (let page = 2; page <= totalPages; page++) {
        const pageUrl = `${STRAPI_URL}/api/products?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
        
        const pagePromise = fetch(pageUrl)
          .then(response => {
            if (!response.ok) {
              console.error(`❌ Ошибка на странице ${page}: ${response.status}`);
              return [];
            }
            return response.json();
          })
          .then(data => {
            console.log(`✅ Страница ${page}: ${data.data?.length || 0} товаров`);
            return data.data || [];
          })
          .catch(error => {
            console.error(`❌ Ошибка загрузки страницы ${page}:`, error);
            return [];
          });
        
        promises.push(pagePromise);
      }
      
      // Выполняем все запросы параллельно
      console.log(`🚀 Запускаем ${promises.length} параллельных запросов...`);
      const startTime = Date.now();
      
      const results = await Promise.all(promises);
      
      const endTime = Date.now();
      console.log(`⚡ Параллельная загрузка завершена за ${endTime - startTime}ms`);
      
      // Объединяем все результаты
      const allProducts = results.flat();
      console.log(`📦 Всего загружено: ${allProducts.length} товаров`);
      
      return allProducts;
    };

    // Получаем все товары параллельно
    const allStrapiProducts = await getAllProductsParallel();
    
    if (allStrapiProducts.length === 0) {
      return NextResponse.json({
        products: [],
        total: 0,
        message: 'Нет товаров в Strapi'
      });
    }

    console.log(`📊 Обрабатываем ${allStrapiProducts.length} товаров...`);
    const processStartTime = Date.now();

    // Обрабатываем товары из реальной структуры Strapi
    const products = allStrapiProducts.map((item: any) => {
      // В новой версии Strapi данные лежат прямо в корне item, без attributes
      const data = item;

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
      }

      // Извлекаем связанные данные
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
      
      if (data.addTotalPhotos && Array.isArray(data.addTotalPhotos)) {
        additionalPhotos = data.addTotalPhotos;
      }
      
      return {
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
        price: basePrice,
        
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
    });
    
    const processEndTime = Date.now();
    console.log(`⚡ Обработка товаров завершена за ${processEndTime - processStartTime}ms`);
    console.log(`✅ API: Возвращаем ${products.length} товаров с индивидуальными ценами размеров`);
    
    // Формируем результат
    const result = {
      products,
      total: allStrapiProducts.length,
    };
    
    // Сохраняем в кэш
    cachedProducts = result;
    cacheTimestamp = now;
    console.log(`💾 Данные сохранены в кэш на ${CACHE_DURATION / 1000 / 60} минут`);
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ API: Ошибка загрузки товаров:', error);
    
    // Если есть кэш, возвращаем его даже если устарел
    if (cachedProducts) {
      console.log('⚠️ Ошибка загрузки, возвращаем устаревший кэш');
      return NextResponse.json({
        ...cachedProducts,
        cached: true,
        error: 'Данные могут быть устаревшими'
      });
    }
    
    return NextResponse.json(
      { 
        error: 'Ошибка подключения к Strapi',
        message: error instanceof Error ? error.message : 'Неизвестная ошибка',
        suggestion: 'Проверьте что Strapi запущен и содержит товары с размерами'
      },
      { status: 500 }
    );
  }
}

// Функция для очистки кэша
export async function DELETE(request: NextRequest) {
  cachedProducts = null;
  cacheTimestamp = 0;
  console.log('🗑️ Кэш товаров очищен');
  
  return NextResponse.json({ 
    message: 'Кэш очищен',
    success: true 
  });
}