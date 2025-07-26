// src/app/api/sizes/route.ts
import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

export async function GET() {
  try {
    console.log('🔄 API: Загружаем размеры из Strapi...');
    
    const strapiUrl = `${STRAPI_URL}/api/sizes?sort=order:asc,name:asc`;
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
        name: item.name || item.attributes?.name || 'Без названия',
        slug: item.slug || item.attributes?.slug || item.name?.toLowerCase(),
        type: item.type || item.attributes?.type || 'general',
        order: item.order || item.attributes?.order || 0
      }));
    }

    console.log(`✅ API: Возвращаем ${sizes.length} размеров`);
    
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