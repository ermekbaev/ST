// src/app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function GET() {
  try {
    console.log('🔄 API: Загружаем категории из Strapi...');
    
    const strapiUrl = `${STRAPI_URL}/api/categories?sort=name:asc`;
    console.log('📡 Запрос к Strapi:', strapiUrl);
    
    const strapiResponse = await fetch(strapiUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 } // Кеш на 5 минут
    });

    console.log('📡 Ответ от Strapi categories:', strapiResponse.status);

    if (!strapiResponse.ok) {
      console.error(`❌ Strapi categories недоступен: ${strapiResponse.status}`);
      return NextResponse.json(
        { 
          error: `Strapi недоступен (${strapiResponse.status})`,
          categories: []
        },
        { status: strapiResponse.status }
      );
    }

    const strapiData = await strapiResponse.json();
    console.log('📦 Получено категорий от Strapi:', strapiData.data?.length || 0);
    
    // Обрабатываем ответ от Strapi
    let categories = [];
    
    if (strapiData.data && Array.isArray(strapiData.data)) {
      categories = strapiData.data.map((item: any) => ({
        id: item.id,
        name: item.name || item.attributes?.name || 'Без названия',
        slug: item.slug || item.attributes?.slug || item.name?.toLowerCase()
      }));
    }

    console.log(`✅ API: Возвращаем ${categories.length} категорий`);
    
    return NextResponse.json({ 
      categories,
      total: categories.length 
    });

  } catch (error) {
    console.error('❌ API: Ошибка загрузки категорий:', error);
    
    return NextResponse.json(
      { 
        error: 'Ошибка подключения к Strapi',
        categories: [],
        message: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}