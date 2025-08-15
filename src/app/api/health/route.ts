import { NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;

export async function GET() {
  try {
    const strapiResponse = await fetch(`${STRAPI_URL}/api/products?pagination[limit]=1`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const isStrapiHealthy = strapiResponse.ok;

    let stats = {
      totalProducts: 0,
      totalBrands: 0,
      totalCategories: 0
    };

    if (isStrapiHealthy) {
      try {
        const data = await strapiResponse.json();
        stats.totalProducts = data.meta?.pagination?.total || 0;
        
        const [brandsRes, categoriesRes] = await Promise.all([
          fetch(`${STRAPI_URL}/api/brands?pagination[limit]=1`),
          fetch(`${STRAPI_URL}/api/categories?pagination[limit]=1`)
        ]);

        if (brandsRes.ok) {
          const brandsData = await brandsRes.json();
          stats.totalBrands = brandsData.meta?.pagination?.total || 0;
        }

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          stats.totalCategories = categoriesData.meta?.pagination?.total || 0;
        }
      } catch (error) {
        console.warn('⚠️ Не удалось получить полную статистику:', error);
      }
    }

    return NextResponse.json({
      status: isStrapiHealthy ? 'healthy' : 'unhealthy',
      strapi: {
        connected: isStrapiHealthy,
        url: STRAPI_URL,
        httpStatus: strapiResponse.status
      },
      stats,
      timestamp: new Date().toISOString(),
      nextjs: {
        status: 'healthy',
        version: process.version
      }
    });

  } catch (error) {
    console.error('❌ Ошибка проверки здоровья:', error);
    
    return NextResponse.json({
      status: 'error',
      error: 'Не удалось проверить состояние системы',
      strapi: {
        connected: false,
        url: STRAPI_URL,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}