// app/api/products/[id]/route.ts - ИСПРАВЛЕНО для Next.js 15
import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`🔄 API: Загружаем товар ${id}`);

    // Определяем, что передано - числовой ID, documentId или slug
    let strapiUrl: string;
    
    if (!isNaN(Number(id))) {
      // Если передан числовой ID - добавляем populate=*
      strapiUrl = `${STRAPI_URL}/api/products/${id}?populate=*`;
    } else if (id.length > 10 && id.match(/^[a-z0-9]+$/)) {
      // Если передан documentId (длинная строка из букв и цифр)
      strapiUrl = `${STRAPI_URL}/api/products?filters[documentId][$eq]=${id}&populate=*`;
    } else {
      // Если передан slug
      strapiUrl = `${STRAPI_URL}/api/products?filters[slug][$eq]=${id}&populate=*`;
    }
    
    console.log(`📡 Запрос к Strapi: ${strapiUrl}`);

    // Запрос к Strapi
    const strapiResponse = await fetch(strapiUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`📡 Strapi ответ для товара ${id}:`, strapiResponse.status);

    if (!strapiResponse.ok) {
      if (strapiResponse.status === 404) {
        return NextResponse.json(
          { error: 'Товар не найден' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Ошибка загрузки товара из Strapi' },
        { status: strapiResponse.status }
      );
    }

    const strapiData = await strapiResponse.json();
    
    // Обрабатываем разные форматы ответа
    let item;
    if (strapiData.data) {
      if (Array.isArray(strapiData.data)) {
        // Если поиск по slug/documentId вернул массив
        if (strapiData.data.length === 0) {
          return NextResponse.json(
            { error: 'Товар не найден' },
            { status: 404 }
          );
        }
        item = strapiData.data[0]; // Берем первый элемент
      } else {
        // Если поиск по ID вернул объект
        item = strapiData.data;
      }
    } else {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      );
    }

    console.log(`🔍 Структура товара:`, {
      id: item.id,
      name: item.name,
      hasSizes: !!item.sizes,
      sizesCount: item.sizes?.length || 0,
      sizesPreview: item.sizes?.slice(0, 2).map((s: any) => ({
        value: s.value,
        price: s.price,
        hasPrice: s.price !== null
      }))
    });

    // КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: Правильная обработка размеров с ценами
    let allSizes = [];
    
    if (item.sizes && Array.isArray(item.sizes)) {
      // Фильтруем и обрабатываем размеры
      allSizes = item.sizes
        .filter((sizeItem: any) => {
          const hasPrice = sizeItem.price !== null && sizeItem.price !== undefined;
          const hasStock = sizeItem.stockQuantity !== null && sizeItem.stockQuantity !== undefined;
          console.log(`📏 Размер ${sizeItem.value}: price=${sizeItem.price}, stock=${sizeItem.stockQuantity}, включаем=${hasPrice && hasStock}`);
          return hasPrice && hasStock;
        })
        .map((sizeItem: any) => {
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
      
      // Сортируем размеры
      allSizes.sort((a: any, b: any) => {
        const aNum = parseFloat(a.size.replace(/[^\d.]/g, ''));
        const bNum = parseFloat(b.size.replace(/[^\d.]/g, ''));
        return aNum - bNum;
      });
      
      console.log(`✅ Обработано размеров с ценами: ${allSizes.length}`);
      console.log(`💰 Цены размеров:`, allSizes.map((s: any) => `${s.size}: ${s.price}₽`));
    }

    // Извлекаем связанные данные
    const brand = item.brand?.name ? String(item.brand.name) : 'Nike';
    const category = item.category?.name ? String(item.category.name) : 'Кроссовки';
    const gender = item.gender?.name ? String(item.gender.name) : 'Унисекс';

    // Обрабатываем фото
    const mainPhoto = item.mainPhoto || '/images/placeholder.jpg';
    let additionalPhotos = [];
    
    if (item.addTotalPhotos && Array.isArray(item.addTotalPhotos)) {
      additionalPhotos = item.addTotalPhotos;
    }

    // КЛЮЧЕВОЕ: Создаем размеры в правильном формате для фронтенда
    const sizesForFrontend = allSizes.length > 0 ? allSizes : [
      // Fallback только если действительно нет размеров с ценами
      { size: '41', price: 0, available: false, stockQuantity: 0, reservedQuantity: 0, availableQuantity: 0 }
    ];

    const product = {
      id: item.id?.toString() || '',
      article: item.article || '',
      brand: brand,
      name: item.name || '',
      
      // ДЛЯ СОВМЕСТИМОСТИ - размеры как строки (для старых компонентов)
      size: sizesForFrontend[0]?.size || '',
      sizes: sizesForFrontend.map((s: any) => s.size),
      
      // НОВОЕ: Размеры с полной информацией о ценах
      allSizes: allSizes, // ← Размеры с индивидуальными ценами
      
      category: category,
      gender: gender,
      price: allSizes.length > 0 ? Math.min(...allSizes.map((s: any) => s.price)) : 0,
      
      // Фото
      photo: mainPhoto,
      mainPhoto: mainPhoto,
      additionalPhotos: additionalPhotos,
      
      // Наличие
      stockQuantity: allSizes.reduce((sum: number, s: any) => sum + (s.stockQuantity || 0), 0),
      availableStock: allSizes.reduce((sum: number, s: any) => sum + (s.availableQuantity || 0), 0),
      inStock: allSizes.some((s: any) => s.available),
      
      isActive: item.isActive !== false,
      slug: item.slug || item.documentId || '',
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      
      description: `${brand} ${item.name} - ${category}`,
      deliveryInfo: 'Доставка 1-3 дня по России'
    };
    
    console.log(`✅ API: Товар ${id} обработан:`, {
      name: product.name,
      brand: product.brand,
      sizesWithPrices: product.allSizes.length,
      minPrice: product.price,
      sizesPreview: product.allSizes.slice(0, 3).map((s: any) => `${s.size}:${s.price}₽`)
    });
    
    return NextResponse.json({ product });

} catch (error) {
  console.error(`❌ API: Ошибка загрузки товара:`, error);
  return NextResponse.json(
    { error: 'Внутренняя ошибка сервера' },
    { status: 500 }
  );
}
}