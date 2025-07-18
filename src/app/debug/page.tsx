// src/app/debug/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface RawProduct {
  id: string;
  article: string;
  brand: string;
  name: string;
  size: string;
  category: string;
  gender: string;
  price: number;
  photo: string;
  rawPhotoField: string; // Для отладки - сырые данные
}

interface ParsedPhoto {
  original: string;
  cleaned: string[];
  final: string;
}

export default function DebugPage() {
  const [products, setProducts] = useState<RawProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photoDebug, setPhotoDebug] = useState<Map<string, ParsedPhoto>>(new Map());
  const [categoriesFound, setCategoriesFound] = useState<Set<string>>(new Set());

    // Детальный анализ фото с поиском паттернов
    const debugParsePhotos = (photoString: string, productId: string): ParsedPhoto => {
      if (!photoString || photoString.trim() === '') {
        return {
          original: photoString,
          cleaned: [],
          final: ''
        };
      }

      console.log(`=== ОТЛАДКА ФОТО ДЛЯ ${productId} ===`);
      console.log('Исходная строка:', JSON.stringify(photoString));
      
      // Проверяем разные паттерны
      const patterns = {
        isUrl: /^https?:\/\//.test(photoString),
        hasCloudinary: photoString.includes('cloudinary'),
        hasResCloudinary: photoString.includes('res.cloudinary'),
        hasUpload: photoString.includes('/upload/'),
        isImageId: /^[A-Z0-9]{10,20}$/.test(photoString.trim()),
        isParameter: /^w_\d+$/.test(photoString.trim()),
        hasImageExtension: /\.(jpg|jpeg|png|gif|webp)$/i.test(photoString),
        containsMultipleUrls: (photoString.match(/https?:\/\//g) || []).length > 1
      };
      
      console.log('Паттерны:', patterns);

      let photos: string[] = [];
      
      // Если это уже полный URL
      if (patterns.isUrl) {
        if (patterns.containsMultipleUrls) {
          // Несколько URL в строке
          photos = photoString.match(/https?:\/\/[^\s,;"'\n\r\t]+/g) || [];
        } else {
          photos = [photoString];
        }
      }
      // Если это ID изображения, пытаемся построить URL
      else if (patterns.isImageId) {
        // Пример построения URL для Cloudinary (нужно будет скорректировать под ваш сервис)
        const possibleUrl = `https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/${photoString}`;
        photos = [possibleUrl];
        console.log('Построен URL из ID:', possibleUrl);
      }
      // Пропускаем параметры типа w_1200
      else if (patterns.isParameter) {
        console.log('Пропускаем параметр:', photoString);
        photos = [];
      }
      else {
        // Разделяем по разделителям
        if (photoString.includes(';')) {
          photos = photoString.split(';');
        } else if (photoString.includes('\n') || photoString.includes('\r')) {
          photos = photoString.split(/[\r\n]+/);
        } else if (photoString.includes(',')) {
          photos = photoString.split(',');
        } else {
          photos = [photoString];
        }
      }

      // Очищаем URL
      const cleanPhotos = photos
        .map((url: string) => {
          let cleanUrl = url.trim().replace(/^["']+|["']+$/g, '');
          
          // Убираем префиксы
          const httpsMatch = cleanUrl.match(/https:\/\/.+/);
          if (httpsMatch) {
            cleanUrl = httpsMatch[0];
          }
          
          return cleanUrl;
        })
        .filter((url: string) => url.length > 0)
        .filter((url: string) => url.startsWith('https://') || url.startsWith('http://'));

      const result: ParsedPhoto = {
        original: photoString,
        cleaned: cleanPhotos,
        final: cleanPhotos.length > 0 ? cleanPhotos[0] : ''
      };

      console.log('Финальный результат:', result);
      return result;
    };

  useEffect(() => {
    const fetchDebugData = async () => {
      try {
        setLoading(true);
        
        // Загружаем данные напрямую из Google Sheets
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
        
        console.log('=== АНАЛИЗ CSV (КАТЕГОРИЯ "КОЛЛЕКЦИЯ") ===');
        console.log(`Всего строк: ${lines.length}`);
        console.log('Ищем продукты в категории "Коллекция"...');

        // Парсим CSV
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

        const debugProducts: RawProduct[] = [];
        const debugPhotos = new Map<string, ParsedPhoto>();
        const categoriesFound = new Set<string>();

        // Сначала найдем все категории для справки
        for (let i = 1; i < Math.min(lines.length, 100); i++) {
          try {
            const values = parseCSVLine(lines[i]);
            if (values.length >= 5) {
              const category = values[4]?.trim() || '';
              if (category && category !== 'Категория') {
                categoriesFound.add(category);
              }
            }
          } catch (error) {
            // Игнорируем ошибки парсинга
          }
        }

        console.log('Найденные категории:', Array.from(categoriesFound));

        // Анализируем только продукты из категории "Коллекция"
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          try {
            const values = parseCSVLine(line);
            
            if (values.length >= 8) {
              const category = values[4]?.trim() || '';
              
              // Фильтруем только продукты из категории "Коллекция"
              if (category.toLowerCase().includes('коллекци') || 
                  category.toLowerCase().includes('коллаборац') ||
                  category.toLowerCase().includes('collection')) {
                
                const productId = `product_${i}`;
                const rawPhotoField = values[8] || '';
                
                // Детальный анализ фото
                const photoAnalysis = debugParsePhotos(rawPhotoField, productId);
                debugPhotos.set(productId, photoAnalysis);

                const product: RawProduct = {
                  id: productId,
                  article: values[0] || '',
                  brand: values[1] || '',
                  name: values[2] || '',
                  size: values[3] || '',
                  category: category,
                  gender: values[5] || '',
                  price: parseFloat(values[6]) || 0,
                  photo: photoAnalysis.final,
                  rawPhotoField: rawPhotoField
                };

                debugProducts.push(product);
                
                console.log(`Найден продукт из коллекции: ${product.name} (строка ${i})`);
                console.log(`  Категория: ${category}`);
                console.log(`  Фото поле: "${rawPhotoField}"`);
              }
            }
          } catch (error) {
            console.error(`Ошибка парсинга строки ${i}:`, error);
          }
        }

        setProducts(debugProducts);
        setPhotoDebug(debugPhotos);
        setCategoriesFound(categoriesFound);
        
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        setError(error instanceof Error ? error.message : 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchDebugData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-900">Загрузка отладочных данных...</div>
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
          Отладка данных из Google Sheets (категория "Коллекция")
        </h1>
        
        <div className="mb-6 p-4 bg-green-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-gray-900">Найденные категории в таблице:</h2>
          <div className="flex flex-wrap gap-2">
            {Array.from(categoriesFound).map((cat, i) => (
              <span key={i} className="bg-green-200 px-2 py-1 rounded text-sm text-gray-800">
                {cat}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-gray-900">Статистика (только категория "Коллекция"):</h2>
          <p className="text-gray-800">Всего продуктов в коллекции: {products.length}</p>
          <p className="text-gray-800">Продуктов с фото: {products.filter(p => p.photo).length}</p>
          <p className="text-gray-800">Продуктов без фото: {products.filter(p => !p.photo).length}</p>
        </div>

        <div className="grid gap-6">
          {products.map((product) => {
            const photoData = photoDebug.get(product.id);
            
            return (
              <div key={product.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Основная информация */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-blue-600">
                      {product.name || 'Без названия'}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-800">
                      <p><strong className="text-gray-900">ID:</strong> {product.id}</p>
                      <p><strong className="text-gray-900">Артикул:</strong> {product.article}</p>
                      <p><strong className="text-gray-900">Бренд:</strong> {product.brand}</p>
                      <p><strong className="text-gray-900">Размер:</strong> {product.size}</p>
                      <p><strong className="text-gray-900">Категория:</strong> {product.category}</p>
                      <p><strong className="text-gray-900">Цена:</strong> {product.price}₽</p>
                    </div>
                  </div>

                  {/* Отладка фото */}
                  <div>
                    <h4 className="font-semibold mb-3 text-red-600">
                      Анализ поля фото:
                    </h4>
                    
                    {photoData && (
                      <div className="space-y-3 text-sm text-gray-800">
                        <div>
                          <strong className="text-gray-900">Исходные данные:</strong>
                          <div className="bg-gray-100 p-2 rounded mt-1 break-all text-gray-800">
                            {photoData.original || 'Пусто'}
                          </div>
                        </div>

                        <div>
                          <strong className="text-gray-900">Очищенные URL ({photoData.cleaned.length}):</strong>
                          <div className="bg-gray-100 p-2 rounded mt-1 text-gray-800">
                            {photoData.cleaned.length > 0 ? (
                              photoData.cleaned.map((url, i) => (
                                <div key={i} className="mb-1 break-all">
                                  {i + 1}. {url}
                                </div>
                              ))
                            ) : (
                              'Нет валидных URL'
                            )}
                          </div>
                        </div>

                        <div>
                          <strong className="text-gray-900">Паттерны:</strong>
                          <div className="bg-gray-100 p-2 rounded mt-1 text-xs text-gray-800">
                            {photoData.original && (
                              <>
                                <div>URL: {/^https?:\/\//.test(photoData.original) ? '✅' : '❌'}</div>
                                <div>Cloudinary: {photoData.original.includes('cloudinary') ? '✅' : '❌'}</div>
                                <div>Image ID: {/^[A-Z0-9]{10,20}$/.test(photoData.original.trim()) ? '✅' : '❌'}</div>
                                <div>Parameter: {/^w_\d+$/.test(photoData.original.trim()) ? '✅' : '❌'}</div>
                                <div>Extension: {/\.(jpg|jpeg|png|gif|webp)$/i.test(photoData.original) ? '✅' : '❌'}</div>
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          <strong className="text-gray-900">Финальный URL:</strong>
                          <div className="bg-gray-100 p-2 rounded mt-1 break-all text-gray-800">
                            {photoData.final || 'Нет'}
                          </div>
                        </div>

                        {/* Превью изображения */}
                        {photoData.final && (
                          <div>
                            <strong className="text-gray-900">Превью:</strong>
                            <div className="mt-2">
                              <img 
                                src={photoData.final} 
                                alt={product.name}
                                className="w-32 h-32 object-cover rounded border"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling!.textContent = 'Ошибка загрузки';
                                }}
                              />
                              <div className="text-red-500 text-xs mt-1"></div>
                            </div>
                          </div>
                        )}
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