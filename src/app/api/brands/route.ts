import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

const sortBrands = (brands: string[]): string[] => {
  const uniqueBrands = [...new Set(brands)];
  
  return uniqueBrands.sort((a, b) => {
    return a.localeCompare(b, 'ru', { sensitivity: 'base' });
  });
};

const getAllBrandsFromStrapi = async () => {
  
  const firstPageUrl = `${STRAPI_URL}/api/brands?pagination[page]=1&pagination[pageSize]=100`;
  const firstResponse = await fetch(firstPageUrl, {
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 300 }
  });

  if (!firstResponse.ok) {
    throw new Error(`Ошибка получения брендов: ${firstResponse.status}`);
  }

  const firstData = await firstResponse.json();
  const totalItems = firstData.meta?.pagination?.total || 0;
  const pageSize = 100;
  const totalPages = Math.ceil(totalItems / pageSize);
  

  let allBrands = firstData.data || [];

  if (totalPages > 1) {
    
    const pagePromises = [];
    for (let page = 2; page <= totalPages; page++) {
      const pageUrl = `${STRAPI_URL}/api/brands?pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
      pagePromises.push(
        fetch(pageUrl, {
          headers: { 'Content-Type': 'application/json' },
          next: { revalidate: 300 }
        }).then(response => response.json())
      );
    }
    
    const pagesData = await Promise.all(pagePromises);
    pagesData.forEach((pageData, index) => {
      if (pageData.data && Array.isArray(pageData.data)) {
        allBrands = [...allBrands, ...pageData.data];
      }
    });
  }

  return allBrands;
};

export async function GET() {
  try {
    const allStrapiBrands = await getAllBrandsFromStrapi();
    
    console.log(`📦 Всего загружено брендов из Strapi: ${allStrapiBrands.length}`);

    const brandNames: string[] = [];
    
    allStrapiBrands.forEach((item: any) => {
      const brandName = item.name || item.attributes?.name;
      if (brandName) {
        brandNames.push(brandName.toString());
      }
    });

    const uniqueSortedBrands = sortBrands(brandNames);
    
    const brands = uniqueSortedBrands.map((brand, index) => ({
      id: index + 1,
      name: brand,
      slug: brand.toLowerCase().replace(/\s+/g, '-'),
      order: index
    }));

    return NextResponse.json({
      brands,
      total: brands.length,
      debug: {
        strapiBrandsCount: allStrapiBrands.length,
        rawBrandsCount: brandNames.length,
        uniqueBrandsCount: uniqueSortedBrands.length,
        finalBrands: uniqueSortedBrands
      },
      message: `Загружено ${allStrapiBrands.length} брендов из Strapi, уникальных: ${uniqueSortedBrands.length}`
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