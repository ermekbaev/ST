// src/app/api/debug/route.ts
import { NextResponse } from 'next/server';

const SHEET_ID = '1naTkxDrQFfj_d7Q2U46GOj24hSqTAqrt_Yz1ImaKyVc';

interface DebugProduct {
  rowNumber: number;
  id: string;
  article: string;
  brand: string;
  name: string;
  size: string;
  category: string;
  gender: string;
  price: number;
  rawPhotoField: string;
  photoAnalysis: {
    original: string;
    hasContent: boolean;
    length: number;
    hasSemicolon: boolean;
    hasNewline: boolean;
    hasComma: boolean;
    splitBySemicolon: string[];
    splitByNewline: string[];
    splitByComma: string[];
    cleanedUrls: string[];
    finalUrl: string;
    errors: string[];
  };
  newLogicAnalysis: {
    foundInColumn: number;
    foundUrl: string;
    allUrls: string[];
    success: boolean;
  };
  validationErrors: string[];
}

interface DebugResponse {
  success: boolean;
  totalRows: number;
  productsAnalyzed: number;
  productsWithPhotosOld: number;
  productsWithPhotosNew: number;
  productsWithoutPhotos: number;
  data: DebugProduct[];
  csvSample: string[];
}

// НОВАЯ ЛОГИКА: Функция для поиска URL изображений во ВСЕХ столбцах
const findPhotoUrlInAllColumns = (values: string[]): { foundInColumn: number; foundUrl: string; allUrls: string[]; success: boolean } => {
  console.log('🧪 ТЕСТ: Ищем фото URL во всех столбцах...');
  console.log('📊 ТЕСТ: Всего столбцов:', values.length);
  
  // Проходим по всем столбцам и ищем тот, который содержит URL
  for (let i = 0; i < values.length; i++) {
    const column = values[i] || '';
    
    // Проверяем, содержит ли столбец URL изображений
    if (column.includes('https://') || column.includes('http://')) {
      console.log(`✅ ТЕСТ: Найден URL в столбце ${i + 1}:`, column.substring(0, 100) + '...');
      
      // Парсим найденные URL
      const urls = parsePhotoUrlsNew(column);
      if (urls.length > 0) {
        console.log(`✅ ТЕСТ: Извлечено ${urls.length} URL изображений`);
        return {
          foundInColumn: i + 1,
          foundUrl: urls[0],
          allUrls: urls,
          success: true
        };
      }
    }
  }
  
  console.log('❌ ТЕСТ: URL изображений не найдены ни в одном столбце');
  return {
    foundInColumn: -1,
    foundUrl: '',
    allUrls: [],
    success: false
  };
};

// НОВАЯ ЛОГИКА: Функция для парсинга множественных URL из строки
const parsePhotoUrlsNew = (photoString: string): string[] => {
  if (!photoString || photoString.trim() === '') {
    return [];
  }
  
  let photos: string[] = [];
  
  // Разделяем по разным разделителям
  if (photoString.includes(';')) {
    photos = photoString.split(';');
  } else if (photoString.includes('\n') || photoString.includes('\r')) {
    photos = photoString.split(/[\r\n]+/);
  } else if (photoString.includes(',')) {
    photos = photoString.split(',');
  } else {
    photos = [photoString];
  }
  
  // Очищаем URL (БЕЗ обрезки!)
  const cleanPhotos = photos
    .map((url: string) => url.trim().replace(/^["']+|["']+$/g, ''))
    .filter((url: string) => url.length > 0)
    .filter((url: string) => url.startsWith('https://') || url.startsWith('http://'));
  
  return cleanPhotos;
};

export async function GET() {
  try {
    console.log('=== НАЧАЛО ОТЛАДКИ С ТЕСТОМ НОВОЙ ЛОГИКИ ===');
    
    // Загружаем данные
    const response = await fetch(
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText = await response.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    
    console.log(`📊 Всего строк в CSV: ${lines.length}`);
    
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

    // СТАРАЯ ЛОГИКА: Детальный анализ фото (только столбец 9)
    const analyzePhotoOld = (photoString: string): DebugProduct['photoAnalysis'] => {
      const errors: string[] = [];
      
      if (!photoString || photoString.trim() === '') {
        return {
          original: photoString,
          hasContent: false,
          length: 0,
          hasSemicolon: false,
          hasNewline: false,
          hasComma: false,
          splitBySemicolon: [],
          splitByNewline: [],
          splitByComma: [],
          cleanedUrls: [],
          finalUrl: '',
          errors: ['Поле фото пустое']
        };
      }

      const original = photoString;
      const length = photoString.length;
      const hasSemicolon = photoString.includes(';');
      const hasNewline = photoString.includes('\n') || photoString.includes('\r');
      const hasComma = photoString.includes(',');

      // Разделяем по разным разделителям
      const splitBySemicolon = hasSemicolon ? photoString.split(';') : [];
      const splitByNewline = hasNewline ? photoString.split(/[\r\n]+/) : [];
      const splitByComma = hasComma ? photoString.split(',') : [];

      // Определяем какой разделитель использовать
      let photos: string[] = [];
      if (hasSemicolon) {
        photos = splitBySemicolon;
      } else if (hasNewline) {
        photos = splitByNewline;
      } else if (hasComma) {
        photos = splitByComma;
      } else {
        photos = [photoString];
      }

      // Очищаем URL
      const cleanedUrls = photos
        .map((url: string) => {
          let cleanUrl = url.trim().replace(/^["']+|["']+$/g, '');
          
          // Убираем префиксы
          const httpsMatch = cleanUrl.match(/https:\/\/.+/);
          if (httpsMatch) {
            cleanUrl = httpsMatch[0];
          }
          
          return cleanUrl;
        })
        .filter((url: string) => url.length > 0);

      // Фильтруем только валидные URL
      const validUrls = cleanedUrls.filter((url: string) => {
        const isValid = url.startsWith('https://') || url.startsWith('http://');
        if (!isValid && url.length > 0) {
          errors.push(`Невалидный URL: ${url.substring(0, 50)}...`);
        }
        return isValid;
      });

      const finalUrl = validUrls.length > 0 ? validUrls[0] : '';

      if (validUrls.length === 0 && photoString.length > 0) {
        errors.push('Не найдено валидных URL после очистки');
      }

      return {
        original,
        hasContent: true,
        length,
        hasSemicolon,
        hasNewline,
        hasComma,
        splitBySemicolon,
        splitByNewline,
        splitByComma,
        cleanedUrls,
        finalUrl,
        errors
      };
    };

    const debugProducts: DebugProduct[] = [];
    let productsWithPhotosOld = 0;
    let productsWithPhotosNew = 0;
    let productsWithoutPhotos = 0;

    // Анализируем только товары из коллекции (для фокуса на проблеме)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const values = parseCSVLine(line);
        const validationErrors: string[] = [];

        // Валидация данных
        if (values.length < 9) {
          validationErrors.push(`Недостаточно столбцов: ${values.length}/9`);
        }

        // Проверяем категорию
        const category = values[4]?.trim() || '';
        const isCollection = category.toLowerCase().includes('коллекци');
        
        // Анализируем только товары коллекции
        if (!isCollection) continue;

        const rawPhotoField = values[8] || '';
        
        // СТАРАЯ ЛОГИКА: анализ только 9-го столбца
        const photoAnalysis = analyzePhotoOld(rawPhotoField);
        
        // НОВАЯ ЛОГИКА: поиск во всех столбцах
        const newLogicAnalysis = findPhotoUrlInAllColumns(values);

        if (photoAnalysis.finalUrl) {
          productsWithPhotosOld++;
        }
        
        if (newLogicAnalysis.success) {
          productsWithPhotosNew++;
        } else {
          productsWithoutPhotos++;
        }

        const product: DebugProduct = {
          rowNumber: i,
          id: `product_${i}`,
          article: values[0] || '',
          brand: values[1] || '',
          name: values[2] || '',
          size: values[3] || '',
          category: category,
          gender: values[5] || '',
          price: parseFloat(values[6]) || 0,
          rawPhotoField,
          photoAnalysis,
          newLogicAnalysis,
          validationErrors
        };

        debugProducts.push(product);

        // Логируем в консоль для сервера
        console.log(`\n=== ПРОДУКТ ${i} ===`);
        console.log(`Название: ${product.name}`);
        console.log(`Старая логика (столбец 9): ${photoAnalysis.finalUrl || 'НЕТ'}`);
        console.log(`Новая логика (все столбцы): ${newLogicAnalysis.foundUrl || 'НЕТ'}`);
        if (newLogicAnalysis.success) {
          console.log(`Найдено в столбце: ${newLogicAnalysis.foundInColumn}`);
        }

      } catch (error) {
        console.error(`Ошибка парсинга строки ${i}:`, error);
      }
    }

    const result: DebugResponse = {
      success: true,
      totalRows: lines.length,
      productsAnalyzed: debugProducts.length,
      productsWithPhotosOld,
      productsWithPhotosNew,
      productsWithoutPhotos,
      data: debugProducts,
      csvSample: lines.slice(0, 5) // Первые 5 строк для примера
    };

    console.log('=== ИТОГОВАЯ СТАТИСТИКА СРАВНЕНИЯ ===');
    console.log(`Проанализировано товаров коллекции: ${debugProducts.length}`);
    console.log(`Старая логика нашла фото: ${productsWithPhotosOld}`);
    console.log(`Новая логика нашла фото: ${productsWithPhotosNew}`);
    console.log(`Улучшение: +${productsWithPhotosNew - productsWithPhotosOld} товаров`);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Ошибка в debug API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }, { status: 500 });
  }
}