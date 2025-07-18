// src/app/api/products/[id]/route.ts - ИСПРАВЛЕНО для Next.js 15
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

// Поиск фото в соседних строках с улучшенной очисткой URL
const findPhotoInAdjacentLines = (lines: string[], currentIndex: number): string => {
  console.log(`🔍 Ищем фото для строки ${currentIndex + 1}...`);
  
  const searchRange = 5;
  const startIndex = Math.max(0, currentIndex - searchRange);
  const endIndex = Math.min(lines.length - 1, currentIndex + searchRange);
  
  for (let i = startIndex; i <= endIndex; i++) {
    const line = lines[i];
    if (line.includes('cdn-img.thepoizon.ru') || 
        line.includes('cdn.poizon.com') || 
        line.includes('https://')) {
      
      console.log(`✅ Найдено фото в строке ${i + 1}:`, line.substring(0, 100) + '...');
      
      const cleanUrls = extractAndCleanUrls(line);
      if (cleanUrls.length > 0) {
        console.log(`✅ Извлечено ${cleanUrls.length} URL:`, cleanUrls[0].substring(0, 80) + '...');
        return cleanUrls.join(';');
      }
    }
  }
  
  console.log(`❌ Фото не найдено для строки ${currentIndex + 1}`);
  return '';
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
  
  for (let i = 1; i < records.length; i++) {
    const row = records[i];
    
    if (!row || row.length < 7) continue;
    
    const values = row.map((val: any) => cleanString(String(val || '')));
    
    if (!isValidProductData(values)) continue;
    
    const linesForPhotoSearch = records.map(r => r.join(','));
    const photoUrl = findPhotoInAdjacentLines(linesForPhotoSearch, i);
    
    const product: Product = {
      id: `product_${i}`,
      article: values[0],
      brand: values[1],
      name: values[2],
      size: values[3],
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
    console.log(`🔍 [ID] Поиск товара с ID: ${id}`);
    
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
    
    const targetProduct = allProducts.find(product => 
      product.id === id || product.article === id
    );
    
    if (!targetProduct) {
      console.log(`❌ [ID] Товар с ID "${id}" не найден`);
      return NextResponse.json<ApiResponse>({
        success: false,
        data: null,
        error: `Товар с ID "${id}" не найден`
      }, { status: 404 });
    }
    
    console.log(`✅ [ID] Найден товар:`, targetProduct.name);
    
    const relatedProducts = allProducts.filter(product => 
      product.name === targetProduct.name && 
      product.brand === targetProduct.brand
    );
    
    console.log(`🔍 [ID] Найдено размеров для товара: ${relatedProducts.length}`);
    
    const uniqueSizes = relatedProducts.map(product => ({
      size: product.size,
      price: product.price,
      available: true
    }));
    
    console.log(`📸 [ID] Исходные фото товара: "${targetProduct.photo}"`);
    const allPhotos = parsePhotosArray(targetProduct.photo || '');
    console.log(`📸 [ID] Обработанные фото (${allPhotos.length}):`, allPhotos);
    
    const productWithSizes: ProductWithSizes = {
      id: targetProduct.id,
      article: targetProduct.article,
      brand: targetProduct.brand,
      name: targetProduct.name,
      category: targetProduct.category,
      gender: targetProduct.gender,
      description: `${targetProduct.name} от ${targetProduct.brand}. ${targetProduct.category}. 
        Высокое качество и стиль в одном товаре.`,
      photos: allPhotos,
      sizes: uniqueSizes,
      inStock: uniqueSizes.some(s => s.available),
      deliveryInfo: 'Среднее время стандартной доставки: 15-20 рабочих дней.'
    };
    
    console.log(`✅ [ID] Возвращаем товар с ${allPhotos.length} фото и ${uniqueSizes.length} размерами`);
    
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