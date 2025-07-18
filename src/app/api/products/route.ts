// src/app/api/products/route.ts - ИСПРАВЛЕНО СОПОСТАВЛЕНИЕ СТОЛБЦОВ
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

interface ApiResponse {
  success: boolean;
  count: number;
  data: Product[];
  error?: string;
}

// Функция для очистки строки
const cleanString = (str: string): string => {
  if (!str) return '';
  return str.trim().replace(/^["']+|["']+$/g, '').replace(/\s+/g, ' ');
};

// Функция для поиска URL изображений в соседних строках
const findPhotoInAdjacentLines = (lines: string[], currentIndex: number): string => {
  // Проверяем предыдущие 5 строк (где обычно находятся URL)
  for (let i = Math.max(0, currentIndex - 5); i < currentIndex; i++) {
    const line = lines[i];
    if (line.includes('https://cdn.poizon.com/') || 
        line.includes('https://cdn-img.thepoizon.ru/') ||
        line.includes('cdn.poizon.com') ||
        line.includes('https://')) {
      
      // Извлекаем URL из строки
      const urls = extractUrlsFromLine(line);
      if (urls.length > 0) {
        return urls[0];
      }
    }
  }
  
  return '';
};

// Функция для извлечения URL из строки
const extractUrlsFromLine = (line: string): string[] => {
  const urlPatterns = [
    /https:\/\/cdn\.poizon\.com\/[^\s,;"'\n\r\t]+/g,
    /https:\/\/cdn-img\.thepoizon\.ru\/[^\s,;"'\n\r\t]+/g,
    /https:\/\/[^\s,;"'\n\r\t]*\.jpg[^\s,;"'\n\r\t]*/g,
    /https:\/\/[^\s,;"'\n\r\t]*\.png[^\s,;"'\n\r\t]*/g,
    /https:\/\/[^\s,;"'\n\r\t]*\.jpeg[^\s,;"'\n\r\t]*/g,
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
    .map(url => {
      let cleanUrl = url.replace(/^[",;}\]\)\s]+/, '').trim();
      
      const httpsMatch = cleanUrl.match(/https:\/\/.+/);
      if (httpsMatch) {
        cleanUrl = httpsMatch[0];
      }
      
      cleanUrl = cleanUrl.replace(/[",;}\]\)\s]+$/, '');
      
      const queryIndex = cleanUrl.indexOf('?');
      if (queryIndex !== -1) {
        const baseUrl = cleanUrl.substring(0, queryIndex);
        const queryPart = cleanUrl.substring(queryIndex + 1);
        
        if (/^[a-zA-Z0-9=&_\-%.]+$/.test(queryPart)) {
          cleanUrl = baseUrl + '?' + queryPart;
        } else {
          const validQueryMatch = queryPart.match(/^[a-zA-Z0-9=&_\-%.]+/);
          if (validQueryMatch) {
            cleanUrl = baseUrl + '?' + validQueryMatch[0];
          } else {
            cleanUrl = baseUrl;
          }
        }
      }
      
      return cleanUrl;
    })
    .filter(url => url.length > 20)
    .filter(url => url.startsWith('https://'));
  
  return [...new Set(cleanUrls)];
};

// ИСПРАВЛЕННАЯ функция проверки валидности данных
const isValidProductData = (values: string[]): boolean => {
  if (values.length < 7) return false;
  
  const article = cleanString(values[0]); // Столбец A
  const brand = cleanString(values[1]);   // Столбец B
  const name = cleanString(values[2]);    // Столбец C
  const size = cleanString(values[3]);    // Столбец D  
  const category = cleanString(values[4]); // Столбец E
  const gender = cleanString(values[5]);  // Столбец F
  const price = cleanString(values[6]);   // Столбец G
  
  console.log(`🔍 Проверяем строку:`, {
    article: article.substring(0, 20),
    brand: brand.substring(0, 20),
    name: name.substring(0, 30),
    category: category.substring(0, 20),
    price: price
  });
  
  // Проверяем, что это НЕ служебные данные (номера телефонов, коды и т.д.)
  const isPhoneNumber = /^\d{8,}$/.test(article) || /^\d{8,}$/.test(brand);
  const isServiceCode = /^\d+$/.test(brand) && brand.length > 5;
  const isHeaderRow = name.toLowerCase().includes('название') || 
                     article.toLowerCase().includes('артикул');
  
  // Проверяем, что это валидный товар
  const hasRealArticle = article.length > 0 && !isPhoneNumber;
  const hasRealBrand = brand.length > 0 && 
                      !isServiceCode && 
                      !/^\d+$/.test(brand) && // Не только цифры
                      /[a-zA-Zа-яА-Я]/.test(brand); // Содержит буквы
  const hasRealName = name.length > 3 && 
                     /[a-zA-Zа-яА-Я]/.test(name) &&
                     !name.toLowerCase().includes('товар');
  const hasRealCategory = category.length > 0 && 
                         /[a-zA-Zа-яА-Я]/.test(category) &&
                         !category.toLowerCase().includes('категория');
  const hasValidPrice = price.length > 0 && 
                       !isNaN(parseFloat(price)) && 
                       parseFloat(price) > 0;
  
  const isValid = hasRealArticle && hasRealBrand && hasRealName && hasRealCategory && hasValidPrice && !isHeaderRow;
  
  if (isValid) {
    console.log(`✅ ВАЛИДНЫЙ товар: ${brand} - ${name.substring(0, 30)}... (${category})`);
  } else {
    console.log(`❌ Невалидные данные: причины - article: ${hasRealArticle}, brand: ${hasRealBrand}, name: ${hasRealName}, category: ${hasRealCategory}, price: ${hasValidPrice}`);
  }
  
  return isValid;
};

// Функция для парсинга многострочного CSV
const parseMultiLineCSV = (csvText: string): Product[] => {
  console.log('🚀 Начинаем многострочный парсинг CSV');
  
  const lines = csvText.split('\n');
  const products: Product[] = [];
  
  // Простой парсер CSV строки
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
  
  console.log(`📊 Всего строк для анализа: ${lines.length}`);
  
  // Проходим по всем строкам
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    try {
      const values = parseCSVLine(line);
      
      // ПРАВИЛЬНОЕ СОПОСТАВЛЕНИЕ СТОЛБЦОВ
      if (values.length >= 7 && isValidProductData(values)) {
        
        // Ищем фото в предыдущих строках
        const photoUrl = findPhotoInAdjacentLines(lines, i);
        
        const product: Product = {
          id: `product_${i}`,
          article: cleanString(values[0]),  // A: Артикул
          brand: cleanString(values[1]),    // B: Бренд
          name: cleanString(values[2]),     // C: Название  
          size: cleanString(values[3]),     // D: Размер
          category: cleanString(values[4]), // E: Категория
          gender: cleanString(values[5]),   // F: Пол
          price: parseFloat(cleanString(values[6])) || 0, // G: Цена
          photo: photoUrl
        };
        
        products.push(product);
        
        const photoStatus = photoUrl ? '✅ с фото' : '❌ без фото';
        console.log(`📦 Товар ${products.length}: [${product.category}] ${product.brand} - ${product.name.substring(0, 30)}... ${photoStatus}`);
      }
    } catch (error) {
      continue;
    }
  }
  
  console.log(`🎉 Найдено товаров: ${products.length}`);
  console.log(`📸 Товаров с фото: ${products.filter(p => p.photo).length}`);
  
  // Статистика по ПРАВИЛЬНЫМ категориям и брендам
  const categoryStats = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const brandStats = products.reduce((acc, product) => {
    acc[product.brand] = (acc[product.brand] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('📊 Статистика по КАТЕГОРИЯМ:');
  Object.entries(categoryStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .forEach(([category, count]) => {
      console.log(`  ${category}: ${count} товаров`);
    });
  
  console.log('📊 Статистика по БРЕНДАМ:');
  Object.entries(brandStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .forEach(([brand, count]) => {
      console.log(`  ${brand}: ${count} товаров`);
    });
  
  return products;
};

// Функция для проверки валидности товара (итоговая)
const isValidProductRow = (values: string[]): boolean => {
  if (values.length < 7) return false;
  
  const article: string = cleanString(values[0]);
  const brand: string = cleanString(values[1]);
  const name: string = cleanString(values[2]);
  const category: string = cleanString(values[4]); // Правильный столбец для категории
  const priceString: string = cleanString(values[6]);
  
  const hasValidArticle: boolean = Boolean(article && article.length > 0 && !/^\d{8,}$/.test(article));
  const hasValidBrand: boolean = Boolean(brand && brand.length > 0 && !/^\d+$/.test(brand) && /[a-zA-Zа-яА-Я]/.test(brand));
  const hasValidName: boolean = Boolean(name && name.length > 3 && /[a-zA-Zа-яА-Я]/.test(name));
  const hasValidCategory: boolean = Boolean(category && category.length > 0 && /[a-zA-Zа-яА-Я]/.test(category));
  const hasValidPrice: boolean = Boolean(priceString && !isNaN(parseFloat(priceString.replace(/[^\d.,]/g, '').replace(',', '.'))) && parseFloat(priceString.replace(/[^\d.,]/g, '').replace(',', '.')) > 0);
  
  return hasValidArticle && hasValidBrand && hasValidName && hasValidCategory && hasValidPrice;
};

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    console.log('🚀 Начало обработки API /products с правильным сопоставлением столбцов');
    
    const csvUrl: string = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;
    
    const response = await fetch(csvUrl, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText: string = await response.text();
    
    console.log(`📄 Загружен CSV размером: ${csvText.length.toLocaleString()} символов`);
    
    const multiLineProducts = parseMultiLineCSV(csvText);
    
    // Фильтруем валидные товары
    const validProducts = multiLineProducts.filter(product => {
      const values = [
        product.article,
        product.brand,
        product.name,
        product.size,
        product.category,
        product.gender,
        product.price.toString()
      ];
      return isValidProductRow(values);
    });
    
    // Ограничиваем количество товаров
    const limitedProducts = validProducts.slice(0, 1000);
    
    console.log(`✅ Валидных товаров: ${validProducts.length}`);
    console.log(`📦 Возвращаем товаров: ${limitedProducts.length}`);
    console.log(`📸 С фотографиями: ${limitedProducts.filter(p => p.photo).length}`);
    
    return NextResponse.json<ApiResponse>({
      success: true,
      count: limitedProducts.length,
      data: limitedProducts
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ Ошибка при получении товаров:', errorMessage);
    
    return NextResponse.json<ApiResponse>({
      success: false,
      count: 0,
      data: [],
      error: errorMessage
    }, { status: 500 });
  }
}