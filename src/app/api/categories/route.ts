import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

const sortCategories = (categories: string[]): string[] => {
  const uniqueCategories = [...new Set(categories)];
  
  return uniqueCategories.sort((a, b) => {
    return a.localeCompare(b, 'ru', { sensitivity: 'base' });
  });
};

const getAllCategoriesFromStrapi = async () => {
  const firstPageUrl = `${STRAPI_URL}/api/categories?pagination[page]=1&pagination[pageSize]=100`;
  const firstResponse = await fetch(firstPageUrl, {
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 300 }
  });

  if (!firstResponse.ok) {
    throw new Error(`Ошибка получения категорий: ${firstResponse.status}`);
  }

  const firstData = await firstResponse.json();
  const totalItems = firstData.meta?.pagination?.total || 0;
  const pageSize = 100;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  let allCategories = firstData.data || [];

  if (totalPages > 1) {
    
    const pagePromises = [];
    for (let page = 2; page <= totalPages; page++) {
      const pageUrl = `${STRAPI_URL}/api/categories?pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
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
        allCategories = [...allCategories, ...pageData.data];
      }
    });
  }

  return allCategories;
};

export async function GET() {
  try {
    const allStrapiCategories = await getAllCategoriesFromStrapi();
    
    const categoryNames: string[] = [];
    
    allStrapiCategories.forEach((item: any) => {
      const categoryName = item.name || item.attributes?.name;
      if (categoryName) {
        categoryNames.push(categoryName.toString());
      }
    });

    const uniqueSortedCategories = sortCategories(categoryNames);
    
    const categories = uniqueSortedCategories.map((category, index) => ({
      id: index + 1,
      name: category,
      slug: category.toLowerCase().replace(/\s+/g, '-'),
      order: index
    }));

    return NextResponse.json({
      categories,
      total: categories.length,
      debug: {
        strapiCategoriesCount: allStrapiCategories.length,
        rawCategoriesCount: categoryNames.length,
        uniqueCategoriesCount: uniqueSortedCategories.length,
        finalCategories: uniqueSortedCategories
      },
      message: `Загружено ${allStrapiCategories.length} категорий из Strapi, уникальных: ${uniqueSortedCategories.length}`
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