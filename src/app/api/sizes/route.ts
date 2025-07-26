// src/app/api/sizes/route.ts - ИСПРАВЛЕНО ДЛЯ КОЛЛЕКЦИИ SIZES
import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function GET() {
  try {
    console.log('🔄 API: Загружаем размеры из коллекции sizes...');
    
    // Правильный запрос к коллекции sizes
    const strapiUrl = `${STRAPI_URL}/api/sizes?sort=value:asc`;
    console.log('📡 Запрос к Strapi:', strapiUrl);
    
    const strapiResponse = await fetch(strapiUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 } // Кеш на 5 минут
    });

    console.log('📡 Ответ от Strapi sizes:', strapiResponse.status);

    if (!strapiResponse.ok) {
      console.error(`❌ Strapi sizes недоступен: ${strapiResponse.status}`);
      return NextResponse.json(
        { 
          error: `Strapi недоступен (${strapiResponse.status})`,
          sizes: []
        },
        { status: strapiResponse.status }
      );
    }

    const strapiData = await strapiResponse.json();
    console.log('📦 Получено размеров от Strapi:', strapiData.data?.length || 0);
    
    // Обрабатываем ответ от Strapi
    let sizes = [];
    
    if (strapiData.data && Array.isArray(strapiData.data)) {
      sizes = strapiData.data.map((item: any) => ({
        id: item.id,
        // Размер может быть в поле value или в attributes
        name: item.value || item.attributes?.value || 'Без названия',
        slug: (item.value || item.attributes?.value || '').toString(),
        type: item.type || item.attributes?.type || 'shoe',
        order: parseInt(item.value || item.attributes?.value || '0', 10)
      }));
      
      // Сортируем по численному значению
      sizes.sort((a: { order: number; }, b: { order: number; }) => a.order - b.order);
    }

    console.log(`✅ API: Возвращаем ${sizes.length} размеров:`, sizes.map((s: { name: any; }) => s.name));

    return NextResponse.json({ 
      sizes,
      total: sizes.length 
    });

  } catch (error) {
    console.error('❌ API: Ошибка загрузки размеров:', error);
    
    return NextResponse.json(
      { 
        error: 'Ошибка подключения к Strapi',
        sizes: [],
        message: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}