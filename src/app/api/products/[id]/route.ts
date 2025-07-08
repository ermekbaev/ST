// src/app/api/products/[id]/route.ts
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
  photo: string;
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

// Изменяем сигнатуру функции для Next.js 15
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    // Ждем params в Next.js 15
    const { id: productId } = await context.params;
    
    // Получаем все товары из Google Sheets
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
    
    const headers: string[] = parseCSVLine(lines[0]);
    console.log('Заголовки таблицы:', headers);
    console.log('Количество колонок:', headers.length);
    
    // Определяем индексы колонок
    const photoIndex = headers.findIndex(h => h.toLowerCase().includes('фото') || h.toLowerCase().includes('photo') || h.toLowerCase().includes('изображ'));
    console.log('Индекс колонки с фото:', photoIndex, '- колонка:', headers[photoIndex]);
    
    const products: Product[] = [];
    
    // Парсим все товары
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
            photo: values[7] || ''                  // Колонка H (может быть пустой)
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
    
    // Ищем товар по ID или article
    let foundProducts = products.filter(p => 
      p.id === productId || p.article === productId
    );
    
    // Если не найден по точному совпадению, ищем по имени (для совместимости)
    if (foundProducts.length === 0) {
      foundProducts = products.filter(p => 
        p.name.toLowerCase().includes(productId.toLowerCase()) ||
        p.brand.toLowerCase().includes(productId.toLowerCase())
      );
    }
    
    if (foundProducts.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        data: null,
        error: 'Товар не найден'
      }, { status: 404 });
    }
    
    // Берем первый найденный товар
    const baseProduct = foundProducts[0];
    
    // Группируем все размеры этого товара (по имени и бренду)
    const allSizes = products
      .filter(p => 
        p.name === baseProduct.name && 
        p.brand === baseProduct.brand
      )
      .map(p => ({
        size: p.size,
        price: p.price,
        available: true // В реальности здесь будет проверка наличия
      }));
    
    // Убираем дубликаты размеров и сортируем
    const uniqueSizes = allSizes
      .filter((size, index, self) => 
        index === self.findIndex(s => s.size === size.size)
      )
      .sort((a, b) => {
        const aNum = parseFloat(a.size.replace(/[^\d.]/g, ''));
        const bNum = parseFloat(b.size.replace(/[^\d.]/g, ''));
        return aNum - bNum;
      });
    
    // Формируем итоговый объект товара
    const productWithSizes: ProductWithSizes = {
      id: baseProduct.id,
      article: baseProduct.article,
      brand: baseProduct.brand,
      name: baseProduct.name,
      category: baseProduct.category,
      gender: baseProduct.gender,
      description: `${baseProduct.brand} ${baseProduct.name}. Высокое качество и стиль в одном товаре.`,
      photo: baseProduct.photo,
      sizes: uniqueSizes,
      inStock: uniqueSizes.some(s => s.available),
      deliveryInfo: 'Среднее время стандартной доставки: 15-20 рабочих дней.'
    };
    
    console.log(`Найден товар: ${baseProduct.name} с ${uniqueSizes.length} размерами`);
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data: productWithSizes
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Ошибка при получении товара:', errorMessage);
    
    return NextResponse.json<ApiResponse>({
      success: false,
      data: null,
      error: errorMessage
    }, { status: 500 });
  }
}