// src/app/api/products/[id]/route.ts - ОБНОВЛЕНО с csv-parse и очисткой URL
import { NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync'; // 👈 Импорт csv-parse

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
  photos: string[]; // Массив изображений
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

// 🔧 ИСПРАВЛЕННАЯ ФУНКЦИЯ: Очистка одного URL от мусора и проблемных параметров
const cleanImageUrl = (url: string): string => {
  console.log(`🧽 Очищаем URL: ${url.substring(0, 100)}...`);
  
  // 1. Убираем кавычки, запятые и прочие символы в начале и конце
  let cleanUrl = url.replace(/^[",;}\]\)\s]+/, '').replace(/[",;}\]\)\s]+$/, '').trim();
  
  // 2. Извлекаем только https:// часть (убираем префиксы типа "200_m_pad.")
  const httpsMatch = cleanUrl.match(/https:\/\/.+/);
  if (httpsMatch) {
    cleanUrl = httpsMatch[0];
  }
  
  // 3. Обрабатываем query параметры после ?
  const queryIndex = cleanUrl.indexOf('?');
  if (queryIndex !== -1) {
    const baseUrl = cleanUrl.substring(0, queryIndex);
    const queryPart = cleanUrl.substring(queryIndex + 1);
    
    console.log(`🔍 Найдены query параметры: ${queryPart}`);
    
    // Проверяем, содержит ли query только валидные символы для URL
    if (/^[a-zA-Z0-9=&_\-%.]+$/.test(queryPart)) {
      // Query параметры выглядят нормально, оставляем
      cleanUrl = baseUrl + '?' + queryPart;
      console.log(`✅ Query параметры валидные, оставляем`);
    } else {
      // Query содержит странные символы, пытаемся извлечь валидную часть
      const validQueryMatch = queryPart.match(/^[a-zA-Z0-9=&_\-%.]+/);
      if (validQueryMatch && validQueryMatch[0].length > 5) {
        cleanUrl = baseUrl + '?' + validQueryMatch[0];
        console.log(`⚠️ Частично валидные параметры`);
      } else {
        // Убираем query полностью, оставляем только базовый URL
        cleanUrl = baseUrl;
        console.log(`❌ Убираем невалидные параметры`);
      }
    }
  }
  
  // 4. ИСПРАВЛЕНО: Убираем trailing символы, используя правильное регулярное выражение
  cleanUrl = cleanUrl.replace(/[^\w\-._~:\/?#@!$&'()*+,;=%]+$/, '');
  
  console.log(`✅ Финальный URL: ${cleanUrl}`);
  return cleanUrl;
};

// Функция для извлечения и очистки URL от параметров
const extractAndCleanUrls = (line: string): string[] => {
  // Поиск всех URL в строке
  const urlPatterns = [
    /https:\/\/cdn\.poizon\.com\/[^\s,;"'\n\r\t]+/g,
    /https:\/\/cdn-img\.thepoizon\.ru\/[^\s,;"'\n\r\t]+/g,
    /https:\/\/[^\s,;"'\n\r\t]*\.(jpg|jpeg|png|gif|webp)[^\s,;"'\n\r\t]*/gi,
    /https:\/\/[^\s,;"'\n\r\t]+/g
  ];
  
  let allUrls: string[] = [];
  
  // Применяем все паттерны
  for (const pattern of urlPatterns) {
    const matches = line.match(pattern) || [];
    allUrls = allUrls.concat(matches);
  }
  
  // Также проверяем разделители
  if (line.includes(';')) {
    const parts = line.split(';');
    for (const part of parts) {
      if (part.includes('https://')) {
        allUrls.push(part.trim());
      }
    }
  }
  
  // Очищаем каждый URL
  const cleanUrls = allUrls
    .map(url => cleanImageUrl(url))
    .filter(url => url.length > 20) // Минимальная длина URL
    .filter(url => url.startsWith('https://'));
  
  // Удаляем дубликаты
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
        return cleanUrls.join(';'); // ВАЖНО: возвращаем ВСЕ URL через ';'
      }
    }
  }
  
  console.log(`❌ Фото не найдено для строки ${currentIndex + 1}`);
  return '';
};

// НОВАЯ ФУНКЦИЯ: Парсинг массива фото из строки с ';'
const parsePhotosArray = (photoString: string): string[] => {
  if (!photoString || photoString.trim() === '') {
    console.log('❌ Пустая строка фотографий');
    return [];
  }
  
  console.log('📸 === ПАРСИНГ МАССИВА ФОТОГРАФИЙ ===');
  console.log('Исходная строка:', photoString.substring(0, 200) + '...');
  
  let photos: string[] = [];
  
  // ПРИОРИТЕТ: Разделяем по точке с запятой
  if (photoString.includes(';')) {
    photos = photoString.split(';');
    console.log(`✂️ Разделение по ";" - найдено ${photos.length} частей`);
  }
  // Затем пробуем переносы строк
  else if (photoString.includes('\n') || photoString.includes('\r')) {
    photos = photoString.split(/[\r\n]+/);
    console.log(`✂️ Разделение по переносам строк - найдено ${photos.length} частей`);
  }
  // Потом запятые
  else if (photoString.includes(',')) {
    photos = photoString.split(',');
    console.log(`✂️ Разделение по запятым - найдено ${photos.length} частей`);
  }
  // Если разделителей нет, используем всю строку
  else {
    photos = [photoString];
    console.log('📦 Используем всю строку как один URL');
  }
  
  // Очищаем каждый URL
  const cleanPhotos = photos
    .map((url: string, index: number) => {
      console.log(`🧽 Очищаем URL ${index + 1}:`);
      console.log(`  Исходный: "${url}"`);
      
      const cleanUrl = cleanImageUrl(url.trim());
      console.log(`  Очищенный: "${cleanUrl}"`);
      
      return cleanUrl;
    })
    .filter((url: string) => url.length > 20) // Минимальная длина URL
    .filter((url: string) => url.startsWith('https://'));
  
  console.log(`✅ Итого очищенных URL: ${cleanPhotos.length}`);
  return [...new Set(cleanPhotos)]; // Удаляем дубликаты
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

// 🔧 НОВАЯ ФУНКЦИЯ: Парсинг CSV с помощью csv-parse
const parseMultiLineCSV = (csvText: string): Product[] => {
  console.log('🚀 [ID] Начинаем надёжный парсинг CSV через csv-parse');
  
  // Используем csv-parse для корректного парсинга многострочных полей
  const records: any[] = parse(csvText, {
    skip_empty_lines: true,   // Пропускаем пустые строки
    relax_quotes: true,       // Более гибкая обработка кавычек
    relax_column_count: true, // Позволяем разное количество колонок
    trim: true,              // Автоматически обрезаем пробелы
    quote: '"',              // Символ кавычек
    delimiter: ',',          // Разделитель
    escape: '"'              // Символ экранирования
  });
  
  console.log(`📊 [ID] Всего строк: ${records.length}`);
  
  const products: Product[] = [];
  
  // Проходим по всем записям (пропускаем заголовок)
  for (let i = 1; i < records.length; i++) {
    const row = records[i];
    
    // Проверяем, что строка содержит достаточно данных
    if (!row || row.length < 7) continue;
    
    // Преобразуем каждое значение в строку и очищаем
    const values = row.map((val: any) => cleanString(String(val || '')));
    
    // Проверяем валидность данных
    if (!isValidProductData(values)) continue;
    
    // Ищем фото в соседних строках
    // Преобразуем records обратно в строки для поиска фото
    const linesForPhotoSearch = records.map(r => r.join(','));
    const photoUrl = findPhotoInAdjacentLines(linesForPhotoSearch, i);
    
    const product: Product = {
      id: `product_${i}`,
      article: values[0],       // A: Артикул
      brand: values[1],         // B: Бренд
      name: values[2],          // C: Название  
      size: values[3],          // D: Размер
      category: values[4],      // E: Категория
      gender: values[5],        // F: Пол
      price: parseFloat(values[6]) || 0, // G: Цена
      photo: photoUrl
    };
    
    products.push(product);
  }
  
  console.log(`✅ [ID] Готово: найдено ${products.length} валидных товаров`);
  return products;
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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
    
    // 🎯 ИСПОЛЬЗУЕМ НОВУЮ ФУНКЦИЮ ПАРСИНГА
    const allProducts = parseMultiLineCSV(csvText);
    
    // Ищем конкретный товар
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
    
    // Ищем все размеры для этого товара (товары с тем же названием и брендом)
    const relatedProducts = allProducts.filter(product => 
      product.name === targetProduct.name && 
      product.brand === targetProduct.brand
    );
    
    console.log(`🔍 [ID] Найдено размеров для товара: ${relatedProducts.length}`);
    
    // Создаем массив размеров
    const uniqueSizes = relatedProducts.map(product => ({
      size: product.size,
      price: product.price,
      available: true // Предполагаем, что все размеры доступны
    }));
    
    // Собираем все фотографии из найденного товара
    console.log(`📸 [ID] Исходные фото товара: "${targetProduct.photo}"`);
    const allPhotos = parsePhotosArray(targetProduct.photo || '');
    console.log(`📸 [ID] Обработанные фото (${allPhotos.length}):`, allPhotos);
    
    // Формируем расширенную информацию о товаре
    const productWithSizes: ProductWithSizes = {
      id: targetProduct.id,
      article: targetProduct.article,
      brand: targetProduct.brand,
      name: targetProduct.name,
      category: targetProduct.category,
      gender: targetProduct.gender,
      description: `${targetProduct.name} от ${targetProduct.brand}. ${targetProduct.category}. 
        Высокое качество и стиль в одном товаре.`,
      photos: allPhotos, // Массив всех найденных и очищенных изображений
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