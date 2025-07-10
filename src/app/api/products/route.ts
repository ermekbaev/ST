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
  
  const article = cleanString(values[0]);
  const brand = cleanString(values[1]);
  const name = cleanString(values[2]);
  const priceString = cleanString(values[6]);
  
  const hasValidArticle = /^TS-\d+/.test(article);
  const hasValidBrand = brand && !/^\d+$/.test(brand) && /[a-zA-Zа-яА-Я]/.test(brand);
  const hasValidName = name && name.length > 3 && /[a-zA-Zа-яА-Я]/.test(name);
  const hasValidPrice = !isNaN(parseFloat(priceString.replace(/[^\d.]/g, ''))) && parseFloat(priceString.replace(/[^\d.]/g, '')) > 0;
  //@ts-ignore
  return hasValidArticle && hasValidBrand && hasValidName && hasValidPrice;
};

// Функция для парсинга фото
const parsePhotoField = (photoField: string): string => {
  if (!photoField || !photoField.trim()) return '';
  
  const urlRegex = /https?:\/\/[^\s,;"'\n\r\t]+/;
  const match = photoField.match(urlRegex);
  if (match) {
    return match[0];
  }
  
  return '';
};

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;
    
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
    
    console.log('=== АНАЛИЗ СТРУКТУРЫ CSV ===');
    console.log(`Всего строк: ${lines.length}`);
    
    // Анализируем первые 10 строк
    console.log('=== ПЕРВЫЕ 10 СТРОК ===');
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const values = parseCSVLine(lines[i]);
      console.log(`Строка ${i}: [${values.slice(0, 8).map(v => `"${v.substring(0, 20)}"`).join(', ')}]`);
    }
    
    // Ищем строки, которые выглядят как корректные товары
    console.log('=== ПОИСК КОРРЕКТНЫХ ТОВАРОВ ===');
    let validRows = 0;
    let invalidRows = 0;
    const products: Product[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line: string = lines[i].trim();
      if (!line) continue;
      
      try {
        const values: string[] = parseCSVLine(line);
        
        if (isValidProductRow(values)) {
          validRows++;
          
          const article = cleanString(values[0]);
          const brand = cleanString(values[1]);
          const name = cleanString(values[2]);
          const size = cleanString(values[3]);
          const category = cleanString(values[4]);
          const gender = cleanString(values[5]);
          const priceString = cleanString(values[6]);
          const photoField = cleanString(values[7] || '');
          
          const price = parseFloat(priceString.replace(/[^\d.]/g, ''));
          
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
            console.log(`✅ Корректный товар ${validRows} (строка ${i}):`, {
              article: product.article,
              brand: product.brand,
              name: product.name.substring(0, 30),
              size: product.size,
              price: product.price
            });
          }
        } else {
          invalidRows++;
          
          // Логируем первые 3 некорректные строки
          if (invalidRows <= 3) {
            console.log(`❌ Некорректная строка ${i}:`, {
              first3Cols: values.slice(0, 3),
              reasons: {
                hasTS: /^TS-\d+/.test(cleanString(values[0] || '')),
                validBrand: values[1] && !/^\d+$/.test(cleanString(values[1])),
                validName: values[2] && values[2].length > 3,
                validPrice: !isNaN(parseFloat((values[6] || '').replace(/[^\d.]/g, '')))
              }
            });
          }
        }
      } catch (parseError) {
        console.warn(`Ошибка парсинга строки ${i}:`, parseError);
        continue;
      }
    }
    
    console.log(`📊 СТАТИСТИКА:`);
    console.log(`   ✅ Корректных строк: ${validRows}`);
    console.log(`   ❌ Некорректных строк: ${invalidRows}`);
    console.log(`   📦 Итого товаров: ${products.length}`);
    
    return NextResponse.json<ApiResponse>({
      success: true,
      count: products.length,
      data: products
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
    console.error('Ошибка API /products:', errorMessage);
    
    return NextResponse.json<ApiResponse>({
      success: false,
      count: 0,
      data: [],
      error: errorMessage
    }, { status: 500 });
  }
}