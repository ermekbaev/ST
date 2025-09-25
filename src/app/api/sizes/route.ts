import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

const deduplicateAndSortSizes = (sizes: string[]): string[] => {
  const uniqueSizes = [...new Set(sizes)];
  
  const clothingSizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  
  return uniqueSizes.sort((a, b) => {
    const aUpper = a.toUpperCase();
    const bUpper = b.toUpperCase();
    
    const aIndex = clothingSizeOrder.indexOf(aUpper);
    const bIndex = clothingSizeOrder.indexOf(bUpper);
    
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    
    if (aIndex !== -1) return 1;
    if (bIndex !== -1) return -1;
    
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    
    if (!isNaN(numA)) return -1; 
    if (!isNaN(numB)) return 1;
    
    return a.localeCompare(b);
  });
};

const getAllSizesFromStrapi = async () => {
  
  const firstPageUrl = `${STRAPI_URL}/api/sizes?pagination[page]=1&pagination[pageSize]=100`;
  const firstResponse = await fetch(firstPageUrl, {
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 300 }
  });

  if (!firstResponse.ok) {
    throw new Error(`Ошибка получения размеров: ${firstResponse.status}`);
  }

  const firstData = await firstResponse.json();
  const totalItems = firstData.meta?.pagination?.total || 0;
  const pageSize = 100;
  const totalPages = Math.ceil(totalItems / pageSize);
  

  let allSizes = firstData.data || [];

  if (totalPages > 1) {
    
    const pagePromises = [];
    for (let page = 2; page <= totalPages; page++) {
      const pageUrl = `${STRAPI_URL}/api/sizes?pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
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
        allSizes = [...allSizes, ...pageData.data];
      }
    });
  }

  return allSizes;
};

export async function GET() {
  try {
    
    const allStrapiSizes = await getAllSizesFromStrapi();
    
    const sizeValues: string[] = [];
    
    allStrapiSizes.forEach((item: any) => {
      const sizeValue = item.value || item.attributes?.value;
      if (sizeValue) {
        sizeValues.push(sizeValue.toString());
      }
    });


    const uniqueSortedSizes = deduplicateAndSortSizes(sizeValues);
    
    const sizes = uniqueSortedSizes.map((size, index) => ({
      id: index + 1,
      name: size,
      slug: size.toString(),
      type: isNaN(parseFloat(size)) ? 'clothing' : 'shoe',
      order: index
    }));

    return NextResponse.json({
      sizes,
      total: sizes.length,
      debug: {
        strapiSizesCount: allStrapiSizes.length,
        rawSizesCount: sizeValues.length,
        uniqueSizesCount: uniqueSortedSizes.length,
        finalSizes: uniqueSortedSizes
      },
      message: `Загружено ${allStrapiSizes.length} размеров из Strapi, уникальных: ${uniqueSortedSizes.length}`
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