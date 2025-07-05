import { NextResponse } from 'next/server';

// ID вашей Google Таблицы
const SHEET_ID = '1naTkxDrQFfj_d7Q2U46GOj24hSqTAqrt_Yz1ImaKyVc';

export async function GET() {
  try {
    // Используем публичный доступ к таблице через CSV экспорт
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;
    
    const response = await fetch(csvUrl, {
      cache: 'no-store' // Отключаем кэш для получения свежих данных
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText = await response.text();
    
    // Парсим CSV данные более надёжно
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('Таблица пуста или содержит только заголовки');
    }
    
    // Функция для парсинга CSV строки с учётом кавычек
    const parseCSVLine = (line) => {
      const result = [];
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
      result.push(current.trim()); // Добавляем последний элемент
      return result;
    };
    
    const headers = parseCSVLine(lines[0]);
    console.log('Заголовки таблицы:', headers);
    
    const products = [];
    
    // Обрабатываем каждую строку данных (пропускаем заголовок)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Пропускаем пустые строки
      
      try {
        const values = parseCSVLine(line);
        
        if (values.length >= 8) { // Проверяем что есть все необходимые поля
          const product = {
            id: `product_${i}`,
            article: values[0] || `ART${i}`,
            brand: values[1] || 'Неизвестный бренд',
            name: values[2] || 'Товар без названия',
            size: values[3] || 'Universal',
            category: values[4] || 'Прочее',
            gender: values[5] || 'Унисекс',
            price: parseFloat(values[6]) || 0,
            photo: '' // Просто пустая строка, без всяких placeholder'ов
          };
          
          // Добавляем только если есть название
          if (product.name && product.name !== 'Товар без названия') {
            products.push(product);
          }
        }
      } catch (parseError) {
        console.error(`Ошибка парсинга строки ${i}:`, parseError);
        continue; // Пропускаем проблемную строку
      }
    }
    
    console.log(`Загружено ${products.length} товаров`);
    console.log('Первые 2 товара:', products.slice(0, 2));
    
    return NextResponse.json({
      success: true,
      count: products.length,
      data: products
    });
    
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
    
    // Возвращаем тестовые данные при ошибке
    const mockData = [
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
    
    return NextResponse.json({
      success: false,
      error: error.message,
      count: mockData.length,
      data: mockData
    });
  }
}