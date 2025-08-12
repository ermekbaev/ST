// src/app/api/sizes/route.ts - УПРОЩЕННАЯ ВЕРСИЯ
import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// Функция для дедупликации и сортировки размеров
const deduplicateAndSortSizes = (sizes: string[]): string[] => {
  // Убираем дубли
  const uniqueSizes = [...new Set(sizes)];
  
  // Порядок для размеров одежды
  const clothingSizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  
  // Сортируем размеры
  return uniqueSizes.sort((a, b) => {
    const aUpper = a.toUpperCase();
    const bUpper = b.toUpperCase();
    
    // Если оба размера - это размеры одежды
    const aIndex = clothingSizeOrder.indexOf(aUpper);
    const bIndex = clothingSizeOrder.indexOf(bUpper);
    
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    
    // Если один из размеров - размер одежды, он идет после числовых
    if (aIndex !== -1) return 1;
    if (bIndex !== -1) return -1;
    
    // Пробуем парсить как числа
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    
    // Если оба числа - сортируем как числа
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    
    // Если одно число, а другое нет
    if (!isNaN(numA)) return -1; // числа идут первыми
    if (!isNaN(numB)) return 1;
    
    // Иначе как строки
    return a.localeCompare(b);
  });
};

// Функция для загрузки всех размеров из всех страниц
const getAllSizesFromStrapi = async () => {
  console.log('📦 Загружаем ВСЕ размеры из Strapi...');
  
  // Получаем первую страницу, чтобы узнать общее количество
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
  
  console.log(`📊 Найдено ${totalItems} размеров на ${totalPages} страницах`);

  let allSizes = firstData.data || [];

  // Если есть еще страницы, загружаем их параллельно
  if (totalPages > 1) {
    console.log(`🔄 Загружаем остальные ${totalPages - 1} страниц...`);
    
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
        console.log(`📊 Страница ${index + 2}: +${pageData.data.length} размеров`);
      }
    });
  }

  return allSizes;
};

export async function GET() {
  try {
    console.log('🔄 API: Загружаем размеры из коллекции sizes...');
    
    // Загружаем ВСЕ размеры из Strapi
    const allStrapiSizes = await getAllSizesFromStrapi();
    
    console.log(`📦 Всего загружено размеров из Strapi: ${allStrapiSizes.length}`);

    // Извлекаем значения размеров
    const sizeValues: string[] = [];
    
    allStrapiSizes.forEach((item: any) => {
      const sizeValue = item.value || item.attributes?.value;
      if (sizeValue) {
        sizeValues.push(sizeValue.toString());
      }
    });

    console.log('📊 Извлеченные размеры:', sizeValues);

    // Применяем дедупликацию и сортировку
    const uniqueSortedSizes = deduplicateAndSortSizes(sizeValues);
    
    // Формируем финальный ответ
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