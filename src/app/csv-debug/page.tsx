// Создайте новый файл src/app/csv-debug/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface CSVRow {
  rowNumber: number;
  allColumns: string[];
  parsedData: {
    article: string;
    brand: string;
    name: string;
    size: string;
    category: string;
    gender: string;
    price: string;
    description: string;
    photo: string;
  };
}

export default function CSVDebugPage() {
  const [csvRows, setCsvRows] = useState<CSVRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('все');
  const [showOnlyWithPhotos, setShowOnlyWithPhotos] = useState(false);
  const [testNewLogic, setTestNewLogic] = useState(false);

  // Функция для поиска URL изображений во ВСЕХ столбцах (НОВАЯ ЛОГИКА)
  const findPhotoUrl = (values: string[]): string => {
    console.log('🔍 ТЕСТ: Ищем фото URL во всех столбцах...');
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
          return urls[0]; // Возвращаем первый URL
        }
      }
    }
    
    console.log('❌ ТЕСТ: URL изображений не найдены ни в одном столбце');
    return '';
  };

  // Функция для парсинга множественных URL из строки (НОВАЯ ЛОГИКА)
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

  useEffect(() => {
    const fetchCSVData = async () => {
      try {
        setLoading(true);
        
        const SHEET_ID = '1naTkxDrQFfj_d7Q2U46GOj24hSqTAqrt_Yz1ImaKyVc';
        const response = await fetch(
          `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`,
          { cache: 'no-store' }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const csvText = await response.text();
        const lines = csvText.split('\n').filter(line => line.trim());
        
        console.log('=== ДЕТАЛЬНЫЙ АНАЛИЗ CSV ===');
        console.log(`Всего строк: ${lines.length}`);
        
        // Анализируем заголовки
        const headers = parseCSVLine(lines[0]);
        console.log('Заголовки:', headers);
        
        const debugRows: CSVRow[] = [];

        // Ищем конкретно продукты из коллекции
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          try {
            const allColumns = parseCSVLine(line);
            
            // Безопасно извлекаем данные
            const parsedData = {
              article: allColumns[0] || '',
              brand: allColumns[1] || '',
              name: allColumns[2] || '',
              size: allColumns[3] || '',
              category: allColumns[4] || '',
              gender: allColumns[5] || '',
              price: allColumns[6] || '',
              description: allColumns[7] || '',
              photo: allColumns[8] || ''
            };

            // ТЕСТИРУЕМ НОВУЮ ЛОГИКУ
            let newLogicPhoto = '';
            if (testNewLogic) {
              newLogicPhoto = findPhotoUrl(allColumns);
              console.log(`🧪 ТЕСТ для строки ${i}: Старая логика="${parsedData.photo ? 'найдено' : 'не найдено'}" vs Новая логика="${newLogicPhoto ? 'найдено' : 'не найдено'}"`);
            }

            // Фильтруем по категориям если нужно
            const isCollection = parsedData.category.toLowerCase().includes('коллекци');
            const hasValidName = parsedData.name.length > 5;
            
            // ИЗМЕНЕНИЕ: показываем больше товаров для анализа
            if (hasValidName) {
              // Если фильтр "коллекция", показываем только коллекцию
              if (filterCategory === 'коллекция' && !isCollection) {
                continue;
              }
              
              debugRows.push({
                rowNumber: i,
                allColumns,
                parsedData: {
                  ...parsedData,
                  photo: testNewLogic ? newLogicPhoto : parsedData.photo // Используем новую логику если включена
                }
              });
            }

          } catch (error) {
            console.error(`Ошибка парсинга строки ${i}:`, error);
          }
        }

        console.log(`Найдено ${debugRows.length} товаров для анализа`);
        setCsvRows(debugRows);
        
      } catch (error) {
        console.error('Ошибка загрузки CSV:', error);
        setError(error instanceof Error ? error.message : 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchCSVData();
  }, [filterCategory, testNewLogic]); // Добавляем testNewLogic в зависимости

  const filteredRows = csvRows.filter(row => {
    if (showOnlyWithPhotos) {
      // Проверяем наличие URL в любом из столбцов
      return row.allColumns.some(col => 
        col.includes('https://') || col.includes('http://')
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-900">Загрузка CSV данных...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Ошибка: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">
          Детальный анализ CSV данных
        </h1>
        
        {/* Фильтры */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <div className="flex gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Категория:
              </label>
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="все">Все товары</option>
                <option value="коллекция">Только коллекция</option>
              </select>
            </div>
            
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showOnlyWithPhotos}
                  onChange={(e) => setShowOnlyWithPhotos(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Только с фото URL</span>
              </label>
            </div>
            
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={testNewLogic}
                  onChange={(e) => setTestNewLogic(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-bold text-blue-700">🧪 Тест новой логики поиска фото</span>
              </label>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-gray-900">
            Статистика {testNewLogic ? '(с новой логикой поиска фото)' : '(со старой логикой)'}:
          </h2>
          <p className="text-gray-800">Всего товаров: {filteredRows.length}</p>
          <p className="text-gray-800">
            Товаров в категории "Коллекция": {filteredRows.filter(row => 
              row.parsedData.category.toLowerCase().includes('коллекци')
            ).length}
          </p>
          <p className="text-gray-800">
            С URL в столбце "Фото": {filteredRows.filter(row => 
              row.parsedData.photo.includes('http')
            ).length}
          </p>
          <p className="text-gray-800">
            С URL в любом столбце: {filteredRows.filter(row => 
              row.allColumns.some(col => col.includes('http'))
            ).length}
          </p>
          {testNewLogic && (
            <div className="mt-2 p-2 bg-green-100 rounded">
              <p className="text-green-800 font-medium">
                🧪 Новая логика активна! Фото ищется во всех столбцах.
              </p>
            </div>
          )}
        </div>

        {/* Данные */}
        <div className="space-y-6">
          {filteredRows.slice(0, 50).map((row) => {
            const hasPhotoInCorrectColumn = row.parsedData.photo.includes('http');
            const photosInOtherColumns = row.allColumns
              .map((col, index) => ({ index, col }))
              .filter(({ col }) => col.includes('http'));

            return (
              <div key={row.rowNumber} className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Основная информация */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-blue-600">
                      Строка {row.rowNumber}: {row.parsedData.name || 'Без названия'}
                    </h3>
                    
                    <div className="space-y-2 text-sm text-gray-800">
                      <p><strong>Артикул:</strong> {row.parsedData.article}</p>
                      <p><strong>Бренд:</strong> {row.parsedData.brand}</p>
                      <p><strong>Категория:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          row.parsedData.category.toLowerCase().includes('коллекци') 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {row.parsedData.category}
                        </span>
                      </p>
                      <p><strong>Размер:</strong> {row.parsedData.size}</p>
                      <p><strong>Цена:</strong> {row.parsedData.price}</p>
                    </div>

                    <div className="mt-4">
                      <strong className="text-gray-900">
                        {testNewLogic ? 'Фото (новая логика - поиск во всех столбцах):' : 'Столбец "Фото" (№9):'}
                      </strong>
                      <div className={`bg-gray-100 p-2 rounded mt-1 text-xs break-all ${
                        hasPhotoInCorrectColumn ? 'border-green-500 border-2' : 'border-red-300 border'
                      }`}>
                        {row.parsedData.photo || 'Пусто'}
                      </div>
                      {testNewLogic && row.parsedData.photo && (
                        <div className="mt-2 p-2 bg-green-50 rounded">
                          <span className="text-green-600 text-xs">
                            ✅ Новая логика нашла фото!
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Анализ всех столбцов */}
                  <div>
                    <h4 className="font-semibold mb-3 text-red-600">
                      Все столбцы ({row.allColumns.length}):
                    </h4>
                    
                    <div className="space-y-2 text-xs max-h-96 overflow-y-auto">
                      {row.allColumns.map((col, index) => {
                        const hasUrl = col.includes('http');
                        return (
                          <div key={index} className={`p-2 rounded ${
                            hasUrl ? 'bg-green-100 border-green-500 border' : 'bg-gray-50'
                          }`}>
                            <div className="font-medium text-gray-700">
                              Столбец {index + 1}:
                            </div>
                            <div className="break-all text-gray-800">
                              {col || '(пусто)'}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Найденные URL в других столбцах */}
                    {photosInOtherColumns.length > 0 && (
                      <div className="mt-4 p-3 bg-green-50 rounded">
                        <strong className="text-green-600">
                          🎯 URL найдены в столбцах: {photosInOtherColumns.map(p => p.index + 1).join(', ')}
                        </strong>
                        <div className="mt-2 text-xs">
                          {photosInOtherColumns.map(({ index, col }) => (
                            <div key={index} className="mb-1">
                              <span className="font-medium">Столбец {index + 1}:</span>
                              <div className="text-gray-700 break-all">
                                {col.substring(0, 100)}...
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Если нет URL вообще */}
                    {photosInOtherColumns.length === 0 && !hasPhotoInCorrectColumn && (
                      <div className="mt-4 p-3 bg-red-50 rounded">
                        <span className="text-red-600">❌ URL изображений не найдены ни в одном столбце</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}