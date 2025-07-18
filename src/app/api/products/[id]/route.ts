// src/app/api/products/[id]/route.ts - ПОЛНЫЙ ИСПРАВЛЕННЫЙ ФАЙЛ
import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';

const SHEET_ID = '1naTkxDrQFfj_d7Q2U46GOj24hSqTAqrt_Yz1ImaKyVc';

interface Product {
  id: string;
  article: string;
  brand: string;
  name: string;
  size: string;
  category: string;
  gender: string;
  price: number;
  photo: string;
}

interface ProductWithSizes {
  id: string;
  article: string;
  brand: string;
  name: string;
  category: string;
  gender: string;
  description: string;
  photos: string[];
  sizes: Array<{
    size: string;
    price: number;
    available: boolean;
  }>;
  inStock: boolean;
  deliveryInfo: string;
}

interface ApiResponse {
  success: boolean;
  data: ProductWithSizes | null;
  error?: string;
}

// Очистка строки от лишних символов
const cleanString = (str: string): string => {
  if (!str) return '';
  return str.trim().replace(/^["']+|["']+$/g, '').replace(/\s+/g, ' ');
};

// Очистка URL от мусора и проблемных параметров
const cleanImageUrl = (url: string): string => {
  console.log(`🧽 Очищаем URL: ${url.substring(0, 100)}...`);
  
  let cleanUrl = url.replace(/^[",;}\]\)\s]+/, '').replace(/[",;}\]\)\s]+$/, '').trim();
  
  const httpsMatch = cleanUrl.match(/https:\/\/.+/);
  if (httpsMatch) {
    cleanUrl = httpsMatch[0];
  }
  
  const queryIndex = cleanUrl.indexOf('?');
  if (queryIndex !== -1) {
    const baseUrl = cleanUrl.substring(0, queryIndex);
    const queryPart = cleanUrl.substring(queryIndex + 1);
    
    console.log(`🔍 Найдены query параметры: ${queryPart}`);
    
    if (/^[a-zA-Z0-9=&_\-%.]+$/.test(queryPart)) {
      cleanUrl = baseUrl + '?' + queryPart;
      console.log(`✅ Query параметры валидные, оставляем`);
    } else {
      const validQueryMatch = queryPart.match(/^[a-zA-Z0-9=&_\-%.]+/);
      if (validQueryMatch && validQueryMatch[0].length > 5) {
        cleanUrl = baseUrl + '?' + validQueryMatch[0];
        console.log(`⚠️ Частично валидные параметры`);
      } else {
        cleanUrl = baseUrl;
        console.log(`❌ Убираем невалидные параметры`);
      }
    }
  }
  
  cleanUrl = cleanUrl.replace(/[^\w\-._~:\/?#@!$&'()*+,;=%]+$/, '');
  
  console.log(`✅ Финальный URL: ${cleanUrl}`);
  return cleanUrl;
};

// Функция для извлечения и очистки URL от параметров
const extractAndCleanUrls = (line: string): string[] => {
  const urlPatterns = [
    /https:\/\/cdn\.poizon\.com\/[^\s,;"'\n\r\t]+/g,
    /https:\/\/cdn-img\.thepoizon\.ru\/[^\s,;"'\n\r\t]+/g,
    /https:\/\/[^\s,;"'\n\r\t]*\.(jpg|jpeg|png|gif|webp)[^\s,;"'\n\r\t]*/gi,
    /https:\/\/[^\s,;"'\n\r\t]+/g
  ];
  
  let allUrls: string[] = [];
  
  for (const pattern of urlPatterns) {
    const matches = line.match(pattern) || [];
    allUrls = allUrls.concat(matches);
  }
  
  if (line.includes(';')) {
    const parts = line.split(';');
    for (const part of parts) {
      if (part.includes('https://')) {
        allUrls.push(part.trim());
      }
    }
  }
  
  const cleanUrls = allUrls
    .map(url => cleanImageUrl(url))
    .filter(url => url.length > 20)
    .filter(url => url.startsWith('https://'));
  
  return [...new Set(cleanUrls)];
};

// 🔧 ИСПРАВЛЕНО: Получение фото ТОЛЬКО из правильных столбцов
const getPhotoFromCorrectColumn = (values: string[]): string => {
  const photoColumns = [8, 9, 10, 7]; // I, J, K, H
  
  for (const colIndex of photoColumns) {
    const columnValue = values[colIndex] || '';
    const letter = String.fromCharCode(65 + colIndex);
    
    console.log(`📸 Проверяем столбец ${letter} (${colIndex}): "${columnValue.substring(0, 60)}${columnValue.length > 60 ? '...' : ''}"`);
    
    if (columnValue && columnValue.trim()) {
      const cleanUrls = extractAndCleanUrls(columnValue);
      if (cleanUrls.length > 0) {
        console.log(`✅ Найдено фото в столбце ${letter}: ${cleanUrls[0].substring(0, 60)}...`);
        return cleanUrls[0];
      }
    }
  }
  
  console.log(`❌ Фото не найдено ни в одном столбце`);
  return '';
};

// 🔧 ИСПРАВЛЕНО: Очистка размера
const cleanSize = (sizeString: string): string => {
  if (!sizeString) return '';
  
  let cleaned = sizeString.trim();
  cleaned = cleaned.replace(/^["']+|["']+$/g, '');
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.replace(/^(размер|size|р\.?|s\.?)\s*/i, '');
  
  const numberMatch = cleaned.match(/^\d+(\.\d+)?$/);
  if (numberMatch) {
    return numberMatch[0];
  }
  
  const sizeMatch = cleaned.match(/^(\d+(\.\d+)?)\s/);
  if (sizeMatch) {
    return sizeMatch[1];
  }
  
  return cleaned.substring(0, 10);
};

// Парсинг массива фото из строки с ';'
const parsePhotosArray = (photoString: string): string[] => {
  if (!photoString || photoString.trim() === '') {
    console.log('❌ Пустая строка фотографий');
    return [];
  }
  
  console.log('📸 === ПАРСИНГ МАССИВА ФОТОГРАФИЙ ===');
  console.log('Исходная строка:', photoString.substring(0, 200) + '...');
  
  let photos: string[] = [];
  
  if (photoString.includes(';')) {
    photos = photoString.split(';');
    console.log(`✂️ Разделение по ";" - найдено ${photos.length} частей`);
  }
  else if (photoString.includes('\n') || photoString.includes('\r')) {
    photos = photoString.split(/[\r\n]+/);
    console.log(`✂️ Разделение по переносам строк - найдено ${photos.length} частей`);
  }
  else if (photoString.includes(',')) {
    photos = photoString.split(',');
    console.log(`✂️ Разделение по запятым - найдено ${photos.length} частей`);
  }
  else {
    photos = [photoString];
    console.log('📦 Используем всю строку как один URL');
  }
  
  const cleanPhotos = photos
    .map((url: string, index: number) => {
      console.log(`🧽 Очищаем URL ${index + 1}:`);
      console.log(`  Исходный: "${url}"`);
      
      const cleanUrl = cleanImageUrl(url.trim());
      console.log(`  Очищенный: "${cleanUrl}"`);
      
      return cleanUrl;
    })
    .filter((url: string) => url.length > 20)
    .filter((url: string) => url.startsWith('https://'));
  
  console.log(`✅ Итого очищенных URL: ${cleanPhotos.length}`);
  return [...new Set(cleanPhotos)];
};

// Проверка валидности данных товара
const isValidProductData = (values: string[]): boolean => {
  if (values.length < 7) return false;
  
  const article = cleanString(values[0]);
  const brand = cleanString(values[1]);
  const name = cleanString(values[2]);
  const category = cleanString(values[4]);
  const price = cleanString(values[6]);
  
  const hasRealArticle = article.length > 0 && article.startsWith('TS-');
  const hasRealBrand = brand.length > 0 && brand !== 'Бренд';
  const hasRealName = name.length > 5 && name !== 'Название товара';
  const hasRealCategory = category.length > 0 && category !== 'Категория';
  const hasValidPrice = !isNaN(parseFloat(price)) && parseFloat(price) > 0;
  const isHeaderRow = name.toLowerCase().includes('название') || 
                      brand.toLowerCase().includes('бренд') || 
                      category.toLowerCase().includes('категория');
  
  return hasRealArticle && hasRealBrand && hasRealName && hasRealCategory && hasValidPrice && !isHeaderRow;
};

// Парсинг CSV с помощью csv-parse
const parseMultiLineCSV = (csvText: string): Product[] => {
  console.log('🚀 [ID] Начинаем надёжный парсинг CSV через csv-parse');
  
  const records: any[] = parse(csvText, {
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: true,
    quote: '"',
    delimiter: ',',
    escape: '"'
  });
  
  console.log(`📊 [ID] Всего строк: ${records.length}`);
  
  const products: Product[] = [];
  const usedIds = new Set<string>();
  
  for (let i = 1; i < records.length; i++) {
    const row = records[i];
    
    if (!row || row.length < 7) continue;
    
    const values = row.map((val: any) => cleanString(String(val || '')));
    
    if (!isValidProductData(values)) continue;
    
    // 🔧 ИСПРАВЛЕНО: Получаем фото из правильных столбцов
    const photoUrl = getPhotoFromCorrectColumn(values);
    
    // 🔧 ИСПРАВЛЕНО: Очищаем размер
    const cleanedSize = cleanSize(values[3]);
    
    // Создаем стабильный ID
    let productId = cleanString(values[0]);
    let counter = 1;
    let originalId = productId;
    while (usedIds.has(productId)) {
      productId = `${originalId}_${counter}`;
      counter++;
    }
    usedIds.add(productId);
    
    const product: Product = {
      id: productId,
      article: values[0],
      brand: values[1],
      name: values[2],
      size: cleanedSize,
      category: values[4],
      gender: values[5],
      price: parseFloat(values[6]) || 0,
      photo: photoUrl
    };
    
    products.push(product);
  }
  
  console.log(`✅ [ID] Готово: найдено ${products.length} валидных товаров`);
  return products;
};

// ✅ ИСПРАВЛЕНО: Правильный синтаксис для Next.js 15
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ ИСПРАВЛЕНО: Ожидаем Promise параметров
    const { id } = await context.params;
    
    // ========================================================================
    // 🔧 ДЕТАЛЬНОЕ ЛОГИРОВАНИЕ ПОИСКА
    // ========================================================================
    console.group(`🔍 [ID] API /products/${id}`);
    console.log('⏰ Request time:', new Date().toISOString());
    console.log('🎯 Searching for ID:', id);
    console.log('📊 ID analysis:', {
      length: id.length,
      isArticleFormat: id.startsWith('TS-'),
      isProductFormat: id.startsWith('product_'),
      isNumeric: /^\d+$/.test(id),
      originalValue: id
    });
    
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;
    
    const response = await fetch(csvUrl, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText: string = await response.text();
    console.log(`📄 [ID] Загружен CSV размером: ${csvText.length.toLocaleString()} символов`);
    
    const allProducts = parseMultiLineCSV(csvText);
    console.log(`📦 [ID] Total products loaded: ${allProducts.length}`);
    
    // ========================================================================
    // 🔧 ИСПРАВЛЕНО: ТОЧНАЯ ЛОГИКА ПОИСКА
    // ========================================================================
    console.log('🔍 Starting precise search...');
    
    // 1. Поиск по точному ID (приоритет #1)
    let targetProduct = allProducts.find(product => product.id === id);
    console.log(`🆔 Found by exact ID: ${targetProduct ? '✅' : '❌'}`);
    
    // 2. Если не найден по ID, ищем по точному артикулу (приоритет #2)
    if (!targetProduct) {
      targetProduct = allProducts.find(product => product.article === id);
      console.log(`📝 Found by exact article: ${targetProduct ? '✅' : '❌'}`);
    }
    
    if (!targetProduct) {
      console.log(`❌ [ID] Товар с ID "${id}" не найден`);
      
      // Для отладки показываем похожие товары (но НЕ используем их)
      const similar = allProducts.filter(p => 
        p.id.toLowerCase().includes(id.toLowerCase()) || 
        p.article.toLowerCase().includes(id.toLowerCase())
      ).slice(0, 5);
      
      console.log('🔍 Similar products (for debugging only):', similar.length);
      similar.forEach(p => {
        console.log(`  - ID: ${p.id} | Article: ${p.article} | Name: ${p.name.substring(0, 30)}...`);
      });
      
      console.groupEnd();
      return NextResponse.json<ApiResponse>({
        success: false,
        data: null,
        error: `Товар с ID "${id}" не найден`
      }, { status: 404 });
    }
    
    console.log(`✅ [ID] Selected product:`, {
      id: targetProduct.id,
      article: targetProduct.article,
      name: targetProduct.name.substring(0, 40) + '...',
      brand: targetProduct.brand,
      category: targetProduct.category,
      hasPhoto: !!targetProduct.photo
    });
    
    // Собираем все размеры этого товара
    const relatedProducts = allProducts.filter(product => 
      product.name === targetProduct.name && 
      product.brand === targetProduct.brand
    );
    
    console.log(`🔍 [ID] Найдено размеров для товара: ${relatedProducts.length}`);
    
    // Создаем уникальные размеры
    const uniqueSizes = relatedProducts
      .map(product => ({
        size: product.size,
        price: product.price,
        available: true
      }))
      .filter((size, index, self) => index === self.findIndex(s => s.size === size.size))
      .sort((a, b) => {
        const aNum = parseFloat(a.size.replace(/[^\d.]/g, ''));
        const bNum = parseFloat(b.size.replace(/[^\d.]/g, ''));
        return aNum - bNum;
      });
    
    console.log(`📏 [ID] Уникальные размеры (${uniqueSizes.length}):`, uniqueSizes.map(s => s.size));
    
    // Парсим фотографии
    console.log(`📸 [ID] Исходные фото товара: "${targetProduct.photo}"`);
    const allPhotos = parsePhotosArray(targetProduct.photo || '');
    console.log(`📸 [ID] Обработанные фото (${allPhotos.length}):`, allPhotos);
    
    // Собираем фото из связанных товаров
    const relatedPhotos: string[] = [];
    for (const product of relatedProducts) {
      if (product.photo && product.photo !== targetProduct.photo) {
        const additionalPhotos = parsePhotosArray(product.photo);
        relatedPhotos.push(...additionalPhotos);
      }
    }
    
    // Объединяем все фото и убираем дубликаты
    const finalPhotos = [...new Set([...allPhotos, ...relatedPhotos])].slice(0, 10);
    console.log(`📸 [ID] Итого фото с учетом связанных товаров: ${finalPhotos.length}`);
    
    const productWithSizes: ProductWithSizes = {
      id: targetProduct.id,
      article: targetProduct.article,
      brand: targetProduct.brand,
      name: targetProduct.name,
      category: targetProduct.category,
      gender: targetProduct.gender,
      description: `${targetProduct.name} от ${targetProduct.brand}. ${targetProduct.category}. Высокое качество и стиль в одном товаре.`,
      photos: finalPhotos,
      sizes: uniqueSizes,
      inStock: uniqueSizes.some(s => s.available),
      deliveryInfo: 'Среднее время стандартной доставки: 15-20 рабочих дней.'
    };
    
    console.log(`✅ [ID] Возвращаем товар с ${finalPhotos.length} фото и ${uniqueSizes.length} размерами`);
    console.groupEnd();
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data: productWithSizes
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ [ID] Ошибка при получении товара:', errorMessage);
    
    return NextResponse.json<ApiResponse>({
      success: false,
      data: null,
      error: errorMessage
    }, { status: 500 });
  }
}