// src/app/api/brands/route.ts
import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function GET() {
  try {
    console.log('🔄 API: Загружаем бренды из Strapi...');
    
    const strapiUrl = `${STRAPI_URL}/api/brands?sort=name:asc`;
    console.log('📡 Запрос к Strapi:', strapiUrl);
    
    const strapiResponse = await fetch(strapiUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 } // Кеш на 5 минут
    });

    console.log('📡 Ответ от Strapi brands:', strapiResponse.status);

    if (!strapiResponse.ok) {
      console.error(`❌ Strapi brands недоступен: ${strapiResponse.status}`);
      return NextResponse.json(
        { 
          error: `Strapi недоступен (${strapiResponse.status})`,
          brands: []
        },
        { status: strapiResponse.status }
      );
    }

    const strapiData = await strapiResponse.json();
    console.log('📦 Получено брендов от Strapi:', strapiData.data?.length || 0);
    
    // Обрабатываем ответ от Strapi
    let brands = [];
    
    if (strapiData.data && Array.isArray(strapiData.data)) {
      brands = strapiData.data.map((item: any) => ({
        id: item.id,
        name: item.name || item.attributes?.name || 'Без названия',
        slug: item.slug || item.attributes?.slug || item.name?.toLowerCase()
      }));
    }

    console.log(`✅ API: Возвращаем ${brands.length} брендов`);
    
    return NextResponse.json({ 
      brands,
      total: brands.length 
    });

  } catch (error) {
    console.error('❌ API: Ошибка загрузки брендов:', error);
    
    return NextResponse.json(
      { 
        error: 'Ошибка подключения к Strapi',
        brands: [],
        message: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}