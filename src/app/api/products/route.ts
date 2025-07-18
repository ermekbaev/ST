import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync'; // 👈 Импорт csv-parse

// Интерфейс для товара
interface Product {
  id: string;
  article: string;
  brand: string;
  name: string;
  size: string;
  category: string;
  gender: string;
  price: number;
  photo?: string;
}

interface ApiResponse {
  success: boolean;
  count: number;
  data: Product[];
  error?: string;
}

// ID и лист Google Sheets
const SHEET_ID = '1naTkxDrQFfj_d7Q2U46GOj24hSqTAqrt_Yz1ImaKyVc';
const SHEET_GID = 0;

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
  const searchRange = 3;
  const startIndex = Math.max(0, currentIndex - searchRange);
  const endIndex = Math.min(lines.length - 1, currentIndex + searchRange);
  
  for (let i = startIndex; i <= endIndex; i++) {
    const line = lines[i];
    if (line.includes('cdn-img.thepoizon.ru') || line.includes('cdn.poizon.com') || line.includes('https://')) {
      const cleanUrls = extractAndCleanUrls(line);
      if (cleanUrls.length > 0) {
        console.log(`✅ Найдено фото в строке ${i + 1}: ${cleanUrls[0]}`);
        return cleanUrls[0];
      }
    }
  }
  
  return '';
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
  
  const isValid = hasRealArticle && hasRealBrand && hasRealName && hasRealCategory && hasValidPrice && !isHeaderRow;
  
  if (isValid) {
    console.log(`✅ ВАЛИДНЫЙ товар: ${brand} - ${name.substring(0, 30)}... (${category})`);
  } else {
    console.log(`❌ Невалидные данные: причины - article: ${hasRealArticle}, brand: ${hasRealBrand}, name: ${hasRealName}, category: ${hasRealCategory}, price: ${hasValidPrice}`);
  }
  
  return isValid;
};

// 🔧 НОВАЯ ФУНКЦИЯ: Парсинг CSV с помощью csv-parse
const parseMultiLineCSV = (csvText: string): Product[] => {
  console.log('🚀 Начинаем надёжный парсинг CSV через csv-parse');
  
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
  
  console.log(`📊 Всего строк: ${records.length}`);
  
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
  
  console.log(`✅ Готово: найдено ${products.length} валидных товаров`);
  return products;
};

// GET метод для получения всех товаров
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Получаем список товаров...');
    
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;
    
    const response = await fetch(csvUrl, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText = await response.text();
    
    // 🎯 ИСПОЛЬЗУЕМ НОВУЮ ФУНКЦИЮ ПАРСИНГА
    const products = parseMultiLineCSV(csvText);
    
    console.log(`🎉 Возвращаем ${products.length} товаров`);
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data: products,
      count: products.length
    });

  } catch (error) {
    console.error('❌ Ошибка при получении товаров:', error);
    return NextResponse.json<ApiResponse>(
      { 
        success: false,
        count: 0,
        data: [],
        error: 'Не удалось получить данные товаров'
      }, 
      { status: 500 }
    );
  }
}