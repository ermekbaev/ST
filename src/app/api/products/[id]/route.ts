// src/app/api/products/[id]/route.ts - С ЛОГИКОЙ ИЗ ГЛАВНОЙ СТРАНИЦЫ
import { NextResponse } from 'next/server';

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

// ВЗЯТО ИЗ ГЛАВНОЙ СТРАНИЦЫ: Функция для поиска URL изображений в соседних строках
const findPhotoInAdjacentLines = (lines: string[], currentIndex: number): string => {
  console.log(`🔍 Ищем фото для строки ${currentIndex + 1}...`);
  
  // Проверяем предыдущие 5 строк (где обычно находятся URL)
  for (let i = Math.max(0, currentIndex - 5); i < currentIndex; i++) {
    const line = lines[i];
    if (line.includes('https://cdn.poizon.com/') || 
        line.includes('https://cdn-img.thepoizon.ru/') ||
        line.includes('cdn.poizon.com')) {
      
      console.log(`✅ Найдено фото в строке ${i + 1}:`, line.substring(0, 100) + '...');
      
      // Извлекаем URL из строки
      const urls = extractUrlsFromLine(line);
      if (urls.length > 0) {
        console.log(`✅ Извлечен URL: ${urls[0].substring(0, 80)}...`);
        return urls.join(';'); // ВАЖНО: возвращаем ВСЕ URL через ';'
      }
    }
  }
  
  console.log(`❌ Фото не найдено для строки ${currentIndex + 1}`);
  return '';
};

// ВЗЯТО ИЗ ГЛАВНОЙ СТРАНИЦЫ: Функция для извлечения URL из строки
const extractUrlsFromLine = (line: string): string[] => {
  // Ищем все URL в строке (включая склеенные без разделителей)
  const urlPatterns = [
    /https:\/\/cdn\.poizon\.com\/[^\s,;"'\n\r\t]+/g,
    /https:\/\/cdn-img\.thepoizon\.ru\/[^\s,;"'\n\r\t]+/g,
    /https:\/\/[^\s,;"'\n\r\t]*\.jpg[^\s,;"'\n\r\t]*/g,
    /https:\/\/[^\s,;"'\n\r\t]*\.png[^\s,;"'\n\r\t]*/g,
    /https:\/\/[^\s,;"'\n\r\t]*\.jpeg[^\s,;"'\n\r\t]*/g
  ];
  
  let allUrls: string[] = [];
  
  // Применяем все паттерны
  for (const pattern of urlPatterns) {
    const matches = line.match(pattern) || [];
    allUrls = allUrls.concat(matches);
  }
  
  // Также пробуем разделить по разделителям
  if (line.includes(';')) {
    const parts = line.split(';');
    for (const part of parts) {
      if (part.includes('https://')) {
        allUrls.push(part.trim());
      }
    }
  }
  
  // Очищаем URL от лишних символов
  const cleanUrls = allUrls
    .map(url => {
      // Убираем кавычки, запятые и прочие символы в НАЧАЛЕ
      let cleanUrl = url.replace(/^[",;}\]\)\s]+/, '').trim();
      
      // Убираем префиксы перед https://
      const httpsMatch = cleanUrl.match(/https:\/\/.+/);
      if (httpsMatch) {
        cleanUrl = httpsMatch[0];
      }
      
      // ИСПРАВЛЕНИЕ: Очищаем окончание URL правильно
      // Убираем только лишние символы в конце, но оставляем валидные query параметры
      cleanUrl = cleanUrl.replace(/[",;}\]\)\s]+$/, ''); // Убираем только явно лишние символы
      
      // Если после знака ? есть невалидные символы, обрезаем до них
      // Но оставляем нормальные query параметры (содержащие буквы, цифры, =, &)
      const queryIndex = cleanUrl.indexOf('?');
      if (queryIndex !== -1) {
        const baseUrl = cleanUrl.substring(0, queryIndex);
        const queryPart = cleanUrl.substring(queryIndex + 1);
        
        // Проверяем, содержит ли query часть только валидные символы
        if (/^[a-zA-Z0-9=&_\-%.]+$/.test(queryPart)) {
          // Query параметры валидные, оставляем как есть
          cleanUrl = baseUrl + '?' + queryPart;
        } else {
          // Query содержит невалидные символы, находим первый невалидный
          const validQueryMatch = queryPart.match(/^[a-zA-Z0-9=&_\-%.]+/);
          if (validQueryMatch) {
            cleanUrl = baseUrl + '?' + validQueryMatch[0];
          } else {
            // Убираем query полностью
            cleanUrl = baseUrl;
          }
        }
      }
      
      return cleanUrl;
    })
    .filter(url => url.length > 20) // Минимальная длина URL
    .filter(url => url.startsWith('https://'));
  
  // Удаляем дубликаты
  return [...new Set(cleanUrls)];
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
      
      // Убираем пробелы и кавычки
      let cleanUrl = url.trim().replace(/^["']+|["']+$/g, '');
      
      // Извлекаем https:// из строк типа "200_m_pad.https://..."
      const httpsMatch = cleanUrl.match(/https:\/\/.+/);
      if (httpsMatch) {
        cleanUrl = httpsMatch[0];
        console.log(`  После извлечения https: "${cleanUrl}"`);
      }
      
      // ИСПРАВЛЕНИЕ: Очистка от лишних символов после ?
      const queryIndex = cleanUrl.indexOf('?');
      if (queryIndex !== -1) {
        const baseUrl = cleanUrl.substring(0, queryIndex);
        const queryPart = cleanUrl.substring(queryIndex + 1);
        
        console.log(`  Base URL: "${baseUrl}"`);
        console.log(`  Query часть: "${queryPart}"`);
        
        // Убираем лишние символы в конце query
        const cleanedQuery = queryPart.replace(/[",;}\]\)\s\n\r\t]+$/, '');
        
        // Проверяем валидность query параметров
        if (/^[a-zA-Z0-9=&_\-%.]+$/.test(cleanedQuery) && cleanedQuery.length > 0) {
          cleanUrl = baseUrl + '?' + cleanedQuery;
          console.log(`  ✅ Валидные query сохранены: "${cleanUrl}"`);
        } else {
          // Берем только валидную часть query
          const validQueryMatch = cleanedQuery.match(/^[a-zA-Z0-9=&_\-%.]+/);
          if (validQueryMatch && validQueryMatch[0].length > 0) {
            cleanUrl = baseUrl + '?' + validQueryMatch[0];
            console.log(`  ⚠️ Частично валидные query: "${cleanUrl}"`);
          } else {
            cleanUrl = baseUrl;
            console.log(`  ❌ Query удалены: "${cleanUrl}"`);
          }
        }
      } else {
        // Убираем лишние символы в конце без query
        const oldUrl = cleanUrl;
        cleanUrl = cleanUrl.replace(/[",;}\]\)\s\n\r\t]+$/, '');
        if (oldUrl !== cleanUrl) {
          console.log(`  Очищены символы в конце: "${cleanUrl}"`);
        }
      }
      
      console.log(`  ✅ Финальный URL: "${cleanUrl}"`);
      return cleanUrl;
    })
    .filter((url: string) => url.length > 0) // Убираем пустые строки
    .filter((url: string) => {
      const isValid = url.startsWith('https://') || url.startsWith('http://');
      if (!isValid) {
        console.log(`❌ Невалидный URL (не HTTP): "${url}"`);
      }
      return isValid;
    });
  
  console.log(`🎉 Итого валидных фото: ${cleanPhotos.length}`);
  cleanPhotos.forEach((url, i) => {
    console.log(`  ${i + 1}: ${url}`);
  });
  console.log('=== КОНЕЦ ПАРСИНГА МАССИВА ===');
  
  return cleanPhotos;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const resolvedParams = await params;
    const productId = resolvedParams.id;
    
    console.log('🔍 Поиск товара с ID:', productId);
    
    // Получаем CSV данные
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;
    const response = await fetch(csvUrl, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText: string = await response.text();
    const lines: string[] = csvText.split('\n').filter((line: string) => line.trim());
    
    if (lines.length < 2) {
      throw new Error('Таблица пуста или содержит только заголовки');
    }
    
    // Парсер CSV строки
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };
    
    // Функция проверки основной строки товара
    const isMainProductLine = (values: string[]): boolean => {
      if (values.length < 7) return false;
      
      const article = values[0]?.trim() || '';
      const brand = values[1]?.trim() || '';
      const name = values[2]?.trim() || '';
      const price = values[6]?.trim() || '';
      
      return (
        article.startsWith('TS-') &&
        brand.length > 0 &&
        name.length > 5 &&
        !isNaN(parseFloat(price)) &&
        parseFloat(price) > 0
      );
    };
    
    const products: Product[] = [];
    
    // ИСПОЛЬЗУЕМ ТУ ЖЕ ЛОГИКУ ЧТО И НА ГЛАВНОЙ СТРАНИЦЕ
    for (let i = 1; i < lines.length; i++) {
      const line: string = lines[i].trim();
      if (!line) continue;
      
      try {
        const values = parseCSVLine(line);
        
        // Проверяем, является ли это основной строкой товара
        if (isMainProductLine(values)) {
          
          // Ищем фото в предыдущих строках (ТА ЖЕ ЛОГИКА)
          const photoUrl = findPhotoInAdjacentLines(lines, i);
          
          const product: Product = {
            id: `product_${i}`,
            article: values[0]?.trim() || `ART${i}`,
            brand: values[1]?.trim() || 'Неизвестный бренд',
            name: values[2]?.trim() || 'Товар без названия',
            size: values[3]?.trim() || 'Universal',
            category: values[4]?.trim() || 'Прочее',
            gender: values[5]?.trim() || 'Унисекс',
            price: parseFloat(values[6]?.trim() || '0') || 0,
            photo: photoUrl // Может содержать несколько URL через ';'
          };
          
          if (product.name && product.name !== 'Товар без названия') {
            products.push(product);
          }
        }
      } catch (parseError: unknown) {
        continue;
      }
    }
    
    console.log(`📦 Всего найдено товаров: ${products.length}`);
    
    // Ищем товар по ID или article
    let foundProducts = products.filter(p => 
      p.id === productId || p.article === productId
    );
    
    // Если не найден, ищем по имени
    if (foundProducts.length === 0) {
      foundProducts = products.filter(p => 
        p.name.toLowerCase().includes(productId.toLowerCase()) ||
        p.brand.toLowerCase().includes(productId.toLowerCase())
      );
    }
    
    if (foundProducts.length === 0) {
      console.log('❌ Товар не найден');
      return NextResponse.json<ApiResponse>({
        success: false,
        data: null,
        error: 'Товар не найден'
      }, { status: 404 });
    }
    
    const baseProduct = foundProducts[0];
    console.log(`✅ Найден товар: ${baseProduct.name}`);
    console.log(`📸 Сырые фото: ${baseProduct.photo || 'НЕТ'}`);
    
    // Собираем все размеры этого товара
    const allSizes = products
      .filter(p => p.name === baseProduct.name && p.brand === baseProduct.brand)
      .map(p => ({ size: p.size, price: p.price, available: true }));
    
    const uniqueSizes = allSizes
      .filter((size, index, self) => index === self.findIndex(s => s.size === size.size))
      .sort((a, b) => {
        const aNum = parseFloat(a.size.replace(/[^\d.]/g, ''));
        const bNum = parseFloat(b.size.replace(/[^\d.]/g, ''));
        return aNum - bNum;
      });
    
    // ГЛАВНОЕ: Парсим массив фотографий из строки
    let allPhotos: string[] = [];
    
    // Из основного товара
    if (baseProduct.photo) {
      const photosFromBase = parsePhotosArray(baseProduct.photo);
      allPhotos = allPhotos.concat(photosFromBase);
    }
    
    // Из связанных товаров
    const relatedProducts = products.filter(p => 
      p.name === baseProduct.name && p.brand === baseProduct.brand && p.photo
    );
    
    for (const product of relatedProducts) {
      if (product.photo && product.photo !== baseProduct.photo) {
        const photosFromProduct = parsePhotosArray(product.photo);
        allPhotos = allPhotos.concat(photosFromProduct);
      }
    }
    
    // Убираем дубликаты и ограничиваем
    allPhotos = [...new Set(allPhotos)].slice(0, 10);
    
    console.log(`🎉 Итого фотографий для товара: ${allPhotos.length}`);
    
    // Формируем ответ
    const productWithSizes: ProductWithSizes = {
      id: baseProduct.id,
      article: baseProduct.article,
      brand: baseProduct.brand,
      name: baseProduct.name,
      category: baseProduct.category,
      gender: baseProduct.gender,
      description: `${baseProduct.brand} ${baseProduct.name}. Высокое качество и стиль в одном товаре.`,
      photos: allPhotos, // Массив всех найденных и очищенных изображений
      sizes: uniqueSizes,
      inStock: uniqueSizes.some(s => s.available),
      deliveryInfo: 'Среднее время стандартной доставки: 15-20 рабочих дней.'
    };
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data: productWithSizes
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ Ошибка при получении товара:', errorMessage);
    
    return NextResponse.json<ApiResponse>({
      success: false,
      data: null,
      error: errorMessage
    }, { status: 500 });
  }
}