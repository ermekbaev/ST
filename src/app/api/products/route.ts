// src/app/api/products/route.ts - ПОЛНЫЙ ИСПРАВЛЕННЫЙ ФАЙЛ
import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';

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

// 🔧 НОВАЯ ФУНКЦИЯ: Получение фото ТОЛЬКО из правильного столбца
const getPhotoFromCorrectColumn = (values: string[]): string => {
  // Проверяем разные столбцы по очереди
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

// 🔧 НОВАЯ ФУНКЦИЯ: Очистка размера от лишних символов
const cleanSize = (sizeString: string): string => {
  if (!sizeString) return '';
  
  let cleaned = sizeString.trim();
  
  // Убираем лишние символы и префиксы
  cleaned = cleaned.replace(/^["']+|["']+$/g, ''); // Кавычки
  cleaned = cleaned.replace(/\s+/g, ' '); // Множественные пробелы
  cleaned = cleaned.replace(/^(размер|size|р\.?|s\.?)\s*/i, ''); // Префиксы "размер", "size" и т.д.
  
  // Если остался только номер, возвращаем его
  const numberMatch = cleaned.match(/^\d+(\.\d+)?$/);
  if (numberMatch) {
    return numberMatch[0];
  }
  
  // Если есть размер + что-то еще, берем только размерную часть
  const sizeMatch = cleaned.match(/^(\d+(\.\d+)?)\s/);
  if (sizeMatch) {
    return sizeMatch[1];
  }
  
  // Возвращаем очищенную строку (максимум 10 символов)
  return cleaned.substring(0, 10);
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

// 🔍 ДИАГНОСТИЧЕСКАЯ ФУНКЦИЯ: Анализ структуры столбцов
const diagnoseColumns = (records: any[]): void => {
  console.log('🔍 === ДИАГНОСТИКА СТОЛБЦОВ ===');
  
  if (records.length < 2) {
    console.log('❌ Недостаточно данных для диагностики');
    return;
  }
  
  // Анализируем заголовки
  const headers = records[0] || [];
  console.log('📋 Заголовки столбцов:');
  headers.forEach((header: any, index: number) => {
    const letter = String.fromCharCode(65 + index); // A, B, C, D...
    console.log(`  ${letter} (${index}): "${header}"`);
  });
  
  // Анализируем первые 3 строки данных
  console.log('\n📊 Первые 3 строки данных:');
  for (let i = 1; i <= Math.min(3, records.length - 1); i++) {
    const row = records[i] || [];
    console.log(`\nСтрока ${i}:`);
    row.forEach((value: any, index: number) => {
      const letter = String.fromCharCode(65 + index);
      const displayValue = String(value || '').substring(0, 50);
      console.log(`  ${letter} (${index}): "${displayValue}${String(value || '').length > 50 ? '...' : ''}"`);
    });
  }
  
  // Ищем столбцы с фотографиями
  console.log('\n📸 Поиск столбцов с фотографиями:');
  for (let colIndex = 0; colIndex < Math.max(...records.map(r => r.length)); colIndex++) {
    const letter = String.fromCharCode(65 + colIndex);
    let photoCount = 0;
    
    for (let rowIndex = 1; rowIndex < Math.min(10, records.length); rowIndex++) {
      const value = String(records[rowIndex][colIndex] || '');
      if (value.includes('https://') || value.includes('cdn')) {
        photoCount++;
      }
    }
    
    if (photoCount > 0) {
      console.log(`  Столбец ${letter} (${colIndex}): найдено ${photoCount} строк с URL`);
    }
  }
  
  console.log('=== КОНЕЦ ДИАГНОСТИКИ ===\n');
};

// 🔧 ПОЛНОСТЬЮ ИСПРАВЛЕННАЯ ФУНКЦИЯ: Парсинг CSV с правильными фото и размерами
const parseMultiLineCSV = (csvText: string): Product[] => {
  console.log('🚀 Начинаем надёжный парсинг CSV через csv-parse');
  
  const records: any[] = parse(csvText, {
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: true,
    quote: '"',
    delimiter: ',',
    escape: '"'
  });
  
  console.log(`📊 Всего строк: ${records.length}`);
  
  // 🔍 ДОБАВЛЯЕМ ДИАГНОСТИКУ
  diagnoseColumns(records);
  
  const products: Product[] = [];
  const usedIds = new Set<string>();
  
  // Проходим по всем записям (пропускаем заголовок)
  for (let i = 1; i < records.length; i++) {
    const row = records[i];
    
    if (!row || row.length < 7) continue;
    
    const values = row.map((val: any) => cleanString(String(val || '')));
    
    if (!isValidProductData(values)) continue;
    
    // ========================================================================
    // 🔧 ИСПРАВЛЕНО: Получаем фото ТОЛЬКО из правильных столбцов
    // ========================================================================
    console.log(`🔍 Анализ фото для строки ${i}:`);
    const photoUrl = getPhotoFromCorrectColumn(values);
    
    // ========================================================================
    // 🔧 ИСПРАВЛЕНО: Очищаем размер от лишних данных
    // ========================================================================
    console.log(`📏 Анализ размера:`);
    console.log(`  Столбец D (3): "${values[3]}"`);
    const cleanedSize = cleanSize(values[3]);
    console.log(`  Очищенный размер: "${cleanedSize}"`);
    
    // Создаем стабильный ID на основе артикула
    let productId = cleanString(values[0]);
    let counter = 1;
    let originalId = productId;
    while (usedIds.has(productId)) {
      productId = `${originalId}_${counter}`;
      counter++;
    }
    usedIds.add(productId);
    
    const product: Product = {
      id: productId,            // 🎯 Артикул как ID
      article: values[0],       // A: Артикул ✅
      brand: values[1],         // B: Бренд ✅  
      name: values[2],          // C: Название ✅
      size: cleanedSize,        // D: Размер 🔧 ИСПРАВЛЕНО
      category: values[4],      // E: Категория ✅
      gender: values[5],        // F: Пол ✅
      price: parseFloat(values[6]) || 0, // G: Цена ✅
      photo: photoUrl           // H-K: Фото 🔧 ИСПРАВЛЕНО
    };
    
    products.push(product);
    
    // Подробное логирование каждого товара
    console.log(`📦 Создан товар ${products.length}:`);
    console.log(`  ID: ${product.id}`);
    console.log(`  Артикул: ${product.article}`);
    console.log(`  Название: ${product.name.substring(0, 40)}...`);
    console.log(`  Бренд: ${product.brand}`);
    console.log(`  Размер: "${product.size}"`);
    console.log(`  Категория: ${product.category}`);
    console.log(`  Цена: ${product.price}`);
    console.log(`  Фото: ${product.photo ? product.photo.substring(0, 60) + '...' : 'НЕТ'}`);
    console.log(`  ---`);
  }
  
  console.log(`✅ Готово: найдено ${products.length} валидных товаров`);
  
  // Проверка на дубликаты ID
  const idCounts = new Map<string, number>();
  products.forEach(p => {
    idCounts.set(p.id, (idCounts.get(p.id) || 0) + 1);
  });
  
  const duplicates = Array.from(idCounts.entries()).filter(([_, count]) => count > 1);
  if (duplicates.length > 0) {
    console.warn('⚠️ Найдены дубликаты ID:', duplicates);
  } else {
    console.log('✅ Все ID уникальны');
  }
  
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
    
    // 🎯 ИСПОЛЬЗУЕМ ИСПРАВЛЕННУЮ ФУНКЦИЮ ПАРСИНГА
    const products = parseMultiLineCSV(csvText);
    
    console.log(`🎉 Возвращаем ${products.length} товаров`);
    
    // Статистика для отладки
    const withPhotos = products.filter(p => p.photo && p.photo.trim()).length;
    const withoutPhotos = products.length - withPhotos;
    
    console.log(`📊 Статистика товаров:`);
    console.log(`  - Всего: ${products.length}`);
    console.log(`  - С фото: ${withPhotos}`);
    console.log(`  - Без фото: ${withoutPhotos}`);
    
    // Показываем первые 3 товара для проверки
    console.log(`📋 Первые 3 товара:`);
    products.slice(0, 3).forEach((p, i) => {
      console.log(`  ${i + 1}. ID: ${p.id} | Article: ${p.article} | Name: ${p.name.substring(0, 30)}... | Size: ${p.size} | Photo: ${p.photo ? 'Есть' : 'Нет'}`);
    });
    
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