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

// Функция для парсинга фото
const parsePhotoField = (photoField: string): string => {
  if (!photoField || !photoField.trim()) return '';
  
  // Ищем первый HTTP URL в строке
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
      cache: 'no-store' 
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText: string = await response.text();
    
    const lines: string[] = csvText.split('\n').filter((line: string) => line.trim());
    
    if (lines.length < 2) {
      throw new Error('Таблица пуста или содержит только заголовки');
    }
    
    // Функция для парсинга CSV строки с учётом кавычек
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
    
    const headers: string[] = parseCSVLine(lines[0]);
    console.log('Заголовки таблицы:', headers);
    console.log('Количество колонок:', headers.length);
    
    // Определяем индексы колонок
    const photoIndex = headers.findIndex(h => h.toLowerCase().includes('фото') || h.toLowerCase().includes('photo') || h.toLowerCase().includes('изображ'));
    console.log('Индекс колонки с фото:', photoIndex, '- колонка:', headers[photoIndex]);
    
    const products: Product[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line: string = lines[i].trim();
      if (!line) continue; 
      
      try {
        const values: string[] = parseCSVLine(line);
        
        if (values.length >= 7) { // Изменили с 8 на 7, так как колонка H может быть пустой
          const product: Product = {
            id: `product_${i}`,
            article: values[0] || `ART${i}`,        // Колонка A
            brand: values[1] || 'Неизвестный бренд', // Колонка B  
            name: values[2] || 'Товар без названия', // Колонка C
            size: values[3] || 'Universal',         // Колонка D
            category: values[4] || 'Прочее',        // Колонка E
            gender: values[5] || 'Унисекс',         // Колонка F
            price: parseFloat(values[6]) || 0,      // Колонка G
            photo: parsePhotoField(values[7] || '') // Парсим фото
          };
          
          if (product.name && product.name !== 'Товар без названия') {
            products.push(product);
          }
        }
      } catch (parseError: unknown) {
        const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
        console.error(`Ошибка парсинга строки ${i}:`, errorMessage);
        continue; 
      }
    }
    
    console.log(`Загружено ${products.length} товаров`);
    
    // Краткая статистика по изображениям
    const withImages = products.filter(p => p.photo && p.photo.trim() !== '').length;
    console.log(`Товаров с изображениями: ${withImages}/${products.length}`);
    
    // Показываем первые 3 товара для проверки
    if (products.length > 0) {
      console.log('=== ПЕРВЫЕ 3 ТОВАРА ===');
      products.slice(0, 3).forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   Фото: "${product.photo}"`);
        console.log(`   Есть фото: ${Boolean(product.photo && product.photo.trim())}`);
      });
      console.log('=== КОНЕЦ СПИСКА ===');
    }
    
    return NextResponse.json<ApiResponse>({
      success: true,
      count: products.length,
      data: products
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Ошибка при получении данных:', errorMessage);
    
    // Возвращаем тестовые данные при ошибке
    const mockData: Product[] = [
      {
        id: 'test_1',
        article: 'TEST001',
        brand: 'Nike',
        name: 'Air Max Test',
        size: '42',
        category: 'Обувь',
        gender: 'Мужской',
        price: 12990,
        photo: 'https://via.placeholder.com/300x200?text=Nike+Air+Max'
      },
      {
        id: 'test_2',
        article: 'TEST002',
        brand: 'Adidas',
        name: 'Stan Smith Test',
        size: '41',
        category: 'Обувь',
        gender: 'Унисекс',
        price: 8990,
        photo: 'https://via.placeholder.com/300x200?text=Adidas+Stan+Smith'
      }
    ];
    
    return NextResponse.json<ApiResponse>({
      success: false,
      error: errorMessage,
      count: mockData.length,
      data: mockData
    });
  }
}