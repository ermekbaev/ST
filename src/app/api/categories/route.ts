// src/app/api/categories/route.ts - УПРОЩЕННАЯ ВЕРСИЯ
import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// Функция для сортировки категорий
const sortCategories = (categories: string[]): string[] => {
  // Убираем дубли и сортируем по алфавиту
  const uniqueCategories = [...new Set(categories)];
  
  return uniqueCategories.sort((a, b) => {
    return a.localeCompare(b, 'ru', { sensitivity: 'base' });
  });
};

// Функция для загрузки всех категорий из всех страниц
const getAllCategoriesFromStrapi = async () => {
  console.log('📦 Загружаем ВСЕ категории из Strapi...');
  
  // Получаем первую страницу, чтобы узнать общее количество
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
  
  console.log(`📊 Найдено ${totalItems} категорий на ${totalPages} страницах`);

  let allCategories = firstData.data || [];

  // Если есть еще страницы, загружаем их параллельно
  if (totalPages > 1) {
    console.log(`🔄 Загружаем остальные ${totalPages - 1} страниц...`);
    
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
        console.log(`📊 Страница ${index + 2}: +${pageData.data.length} категорий`);
      }
    });
  }

  return allCategories;
};

export async function GET() {
  try {
    console.log('🔄 API: Загружаем категории из коллекции categories...');
    
    // Загружаем ВСЕ категории из Strapi
    const allStrapiCategories = await getAllCategoriesFromStrapi();
    
    console.log(`📦 Всего загружено категорий из Strapi: ${allStrapiCategories.length}`);

    // Извлекаем названия категорий
    const categoryNames: string[] = [];
    
    allStrapiCategories.forEach((item: any) => {
      const categoryName = item.name || item.attributes?.name;
      if (categoryName) {
        categoryNames.push(categoryName.toString());
      }
    });

    console.log('📊 Извлеченные категории:', categoryNames);

    // Применяем дедупликацию и сортировку
    const uniqueSortedCategories = sortCategories(categoryNames);
    
    // Формируем финальный ответ
    const categories = uniqueSortedCategories.map((category, index) => ({
      id: index + 1,
      name: category,
      slug: category.toLowerCase().replace(/\s+/g, '-'),
      order: index
    }));

    console.log(`✅ API: Возвращаем ${categories.length} уникальных категорий:`, uniqueSortedCategories);
    console.log('🔍 До дедупликации было категорий:', categoryNames.length);
    console.log('🎯 После дедупликации стало:', uniqueSortedCategories.length);
    console.log('📋 Финальный список категорий:', uniqueSortedCategories);

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