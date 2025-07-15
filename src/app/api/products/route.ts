// src/app/api/products/route.ts
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

// Функция для проверки, является ли строка корректными данными товара
const isValidProductRow = (values: string[]): boolean => {
  if (values.length < 7) return false;
  
  const article: string = cleanString(values[0]);
  const brand: string = cleanString(values[1]);
  const name: string = cleanString(values[2]);
  const priceString: string = cleanString(values[6]);
  
  const hasValidArticle: boolean = Boolean(article && /^TS-\d+/.test(article));
  const hasValidBrand: boolean = Boolean(brand && brand.length > 0 && !/^\d+$/.test(brand) && /[a-zA-Zа-яА-Я]/.test(brand));
  const hasValidName: boolean = Boolean(name && name.length > 3 && /[a-zA-Zа-яА-Я]/.test(name));
  const hasValidPrice: boolean = Boolean(priceString && !isNaN(parseFloat(priceString.replace(/[^\d.,]/g, '').replace(',', '.'))) && parseFloat(priceString.replace(/[^\d.,]/g, '').replace(',', '.')) > 0);
  
  return hasValidArticle && hasValidBrand && hasValidName && hasValidPrice;
};

// Функция для парсинга фото
const parsePhotoField = (photoField: string): string => {
  if (!photoField || !photoField.trim()) return '';
  
  console.log('🔍 Парсинг фото в каталоге:', photoField.substring(0, 100));
  
  let photos: string[] = [];
  
  // ПРИОРИТЕТ: Сначала пробуем точку с запятой как разделитель
  if (photoField.includes(';')) {
    photos = photoField.split(';');
    console.log('Разделение по ";" найдено:', photos.length, 'частей');
  }
  // Затем пробуем переносы строк
  else if (photoField.includes('\n') || photoField.includes('\r')) {
    photos = photoField.split(/[\r\n]+/);
    console.log('Разделение по переносам строк:', photos.length, 'частей');
  }
  // Потом запятые
  else if (photoField.includes(',')) {
    photos = photoField.split(',');
    console.log('Разделение по запятым:', photos.length, 'частей');
  }
  // Пробуем regex для поиска всех HTTP ссылок
  else {
    const urlRegex: RegExp = /https?:\/\/[^\s,;"'\n\r\t]+/g;
    const foundUrls: RegExpMatchArray | null = photoField.match(urlRegex);
    if (foundUrls && foundUrls.length > 0) {
      photos = foundUrls;
      console.log('Найдено через regex:', photos.length, 'URL');
    } else {
      // Возвращаем всю строку как один URL
      photos = [photoField];
      console.log('Используем всю строку как один URL');
    }
  }
  
  console.log('Сырые части:', photos);
  
  // Очищаем результат и берем первое изображение
  const cleanPhotos: string[] = photos
    .map((url: string) => url.trim().replace(/^["']+|["']+$/g, '')) // Убираем кавычки и пробелы
    .filter((url: string) => url.length > 0) // Убираем пустые строки
    .filter((url: string) => url.startsWith('http') || url.includes('cdn') || url.includes('imgur') || url.includes('image')); // Только URL
  
  const firstPhoto: string = cleanPhotos.length > 0 ? cleanPhotos[0] : '';
  console.log('✅ Первое фото для каталога:', firstPhoto);
  
  return firstPhoto;
};

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    console.log('🚀 Начало обработки API /products');
    
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
    const lines: string[] = csvText.split('\n').filter((line: string) => line.trim());
    
    if (lines.length < 3) {
      throw new Error('Таблица пуста или содержит только заголовки');
    }
    
    // Функция для парсинга CSV строки
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current: string = '';
      let inQuotes: boolean = false;
      
      for (let i = 0; i < line.length; i++) {
        const char: string = line[i];
        
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
    
    console.log('=== АНАЛИЗ СТРУКТУРЫ CSV ===');
    console.log(`📊 Всего строк в файле: ${lines.length}`);
    
    // Анализируем первые 10 строк для отладки
    console.log('=== ПЕРВЫЕ 10 СТРОК ===');
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const values: string[] = parseCSVLine(lines[i]);
      console.log(`Строка ${i + 1}: [${values.slice(0, 8).map((v: string) => `"${v.substring(0, 20)}"`).join(', ')}]`);
    }
    
    // Ищем строки, которые выглядят как корректные товары
    console.log('=== ПОИСК КОРРЕКТНЫХ ТОВАРОВ ===');
    let validRows: number = 0;
    let invalidRows: number = 0;
    const products: Product[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line: string = lines[i].trim();
      if (!line) continue;
      
      try {
        const values: string[] = parseCSVLine(line);
        
        if (isValidProductRow(values)) {
          validRows++;
          
          const article: string = cleanString(values[0]);
          const brand: string = cleanString(values[1]);
          const name: string = cleanString(values[2]);
          const size: string = cleanString(values[3]);
          const category: string = cleanString(values[4]);
          const gender: string = cleanString(values[5]);
          const priceString: string = cleanString(values[6]);
          const photoField: string = cleanString(values[7] || '');
          
          // Обработка цен с запятыми (российский формат)
          const price: number = parseFloat(priceString.replace(/[^\d.,]/g, '').replace(',', '.'));
          
          const product: Product = {
            id: article,
            article: article,
            brand: brand,
            name: name,
            size: size || 'Universal',
            category: category || 'Прочее',
            gender: gender || 'Унисекс',
            price: price,
            photo: parsePhotoField(photoField)
          };
          
          products.push(product);
          
          // Логируем первые 3 корректных товара
          if (validRows <= 3) {
            console.log(`✅ Корректный товар ${validRows} (строка ${i + 1}):`, {
              article: product.article,
              brand: product.brand,
              name: product.name.substring(0, 30) + (product.name.length > 30 ? '...' : ''),
              size: product.size,
              price: product.price
            });
          }
        } else {
          invalidRows++;
          
          // Логируем первые 3 некорректные строки с подробным анализом
          if (invalidRows <= 3) {
            const article: string = cleanString(values[0] || '');
            const brand: string = cleanString(values[1] || '');
            const name: string = cleanString(values[2] || '');
            const priceString: string = cleanString(values[6] || '');
            
            console.log(`❌ Некорректная строка ${i + 1}:`, {
              article: article,
              brand: brand,
              name: name.substring(0, 20) + (name.length > 20 ? '...' : ''),
              price: priceString,
              validationResults: {
                hasValidArticle: Boolean(article && /^TS-\d+/.test(article)),
                hasValidBrand: Boolean(brand && brand.length > 0 && !/^\d+$/.test(brand) && /[a-zA-Zа-яА-Я]/.test(brand)),
                hasValidName: Boolean(name && name.length > 3 && /[a-zA-Zа-яА-Я]/.test(name)),
                hasValidPrice: Boolean(priceString && !isNaN(parseFloat(priceString.replace(/[^\d.,]/g, '').replace(',', '.'))) && parseFloat(priceString.replace(/[^\d.,]/g, '').replace(',', '.')) > 0)
              }
            });
          }
        }
      } catch (parseError: unknown) {
        console.warn(`⚠️ Ошибка парсинга строки ${i + 1}:`, parseError);
        invalidRows++;
        continue;
      }
    }
    
    console.log(`📊 ФИНАЛЬНАЯ СТАТИСТИКА:`);
    console.log(`   ✅ Корректных строк: ${validRows}`);
    console.log(`   ❌ Некорректных строк: ${invalidRows}`);
    console.log(`   📦 Итого товаров в каталоге: ${products.length}`);
    
    return NextResponse.json<ApiResponse>({
      success: true,
      count: products.length,
      data: products
    });

  } catch (error: unknown) {
    const errorMessage: string = error instanceof Error ? error.message : 'Неизвестная ошибка сервера';
    console.error('💥 Критическая ошибка API /products:', errorMessage);
    
    return NextResponse.json<ApiResponse>({
      success: false,
      count: 0,
      data: [],
      error: errorMessage
    }, { status: 500 });
  }
}