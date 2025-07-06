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
    
    const products: Product[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line: string = lines[i].trim();
      if (!line) continue; 
      
      try {
        const values: string[] = parseCSVLine(line);
        
        if (values.length >= 8) { 
          const product: Product = {
            id: `product_${i}`,
            article: values[0] || `ART${i}`,
            brand: values[1] || 'Неизвестный бренд',
            name: values[2] || 'Товар без названия',
            size: values[3] || 'Universal',
            category: values[4] || 'Прочее',
            gender: values[5] || 'Унисекс',
            price: parseFloat(values[6]) || 0,
            photo: values[7] || '' 
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
    console.log('Первые 2 товара:', products.slice(0, 2));
    
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