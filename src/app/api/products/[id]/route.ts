// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log(`🔄 API: Загружаем товар ${id}`);

    // Определяем, что передано - числовой ID, documentId или slug
    let strapiUrl: string;
    
    if (!isNaN(Number(id))) {
      // Если передан числовой ID
      strapiUrl = `${STRAPI_URL}/api/products/${id}`;
    } else if (id.length > 10 && id.match(/^[a-z0-9]+$/)) {
      // Если передан documentId (длинная строка из букв и цифр)
      strapiUrl = `${STRAPI_URL}/api/products?filters[documentId][$eq]=${id}`;
    } else {
      // Если передан slug
      strapiUrl = `${STRAPI_URL}/api/products?filters[slug][$eq]=${id}`;
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
    const sizes = ['40', '41', '42', '43']; // Временно статично
    const mainPhoto = item.mainPhoto || '/images/placeholder.jpg';
    
    const product = {
      id: item.id?.toString() || '',
      article: item.article || '',
      brand: 'Nike', // Временно статично
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
    
    console.log(`✅ API: Товар ${id} найден:`, product.name);
    
    return NextResponse.json({ product });

  } catch (error) {
    console.error(`❌ API: Ошибка загрузки товара ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}