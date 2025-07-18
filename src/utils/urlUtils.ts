// src/utils/urlUtils.ts - Утилиты для очистки URL изображений

/**
 * Очищает URL изображения от проблемных параметров и символов
 * @param url - исходный URL
 * @returns очищенный URL
 */
export const cleanImageUrl = (url: string): string => {
  if (!url || url.trim() === '') return '';
  
  console.log(`🧽 Очищаем URL: ${url.substring(0, 100)}...`);
  
  // 1. Убираем кавычки, запятые и прочие символы в начале и конце
  let cleanUrl = url.replace(/^[",;}\]\)\s]+/, '').replace(/[",;}\]\)\s]+$/, '').trim();
  
  // 2. Извлекаем только https:// часть (убираем префиксы типа "200_m_pad.")
  const httpsMatch = cleanUrl.match(/https:\/\/.+/);
  if (httpsMatch) {
    cleanUrl = httpsMatch[0];
  }
  
  // 3. Обрабатываем query параметры после ?
  const queryIndex = cleanUrl.indexOf('?');
  if (queryIndex !== -1) {
    const baseUrl = cleanUrl.substring(0, queryIndex);
    const queryPart = cleanUrl.substring(queryIndex + 1);
    
    console.log(`🔍 Найдены query параметры: ${queryPart}`);
    
    // Проверяем, содержит ли query только валидные символы для URL
    if (/^[a-zA-Z0-9=&_\-%.]+$/.test(queryPart)) {
      // Query параметры выглядят нормально, оставляем
      cleanUrl = baseUrl + '?' + queryPart;
      console.log(`✅ Query параметры валидные, оставляем`);
    } else {
      // Query содержит странные символы, пытаемся извлечь валидную часть
      const validQueryMatch = queryPart.match(/^[a-zA-Z0-9=&_\-%.]+/);
      if (validQueryMatch && validQueryMatch[0].length > 5) {
        cleanUrl = baseUrl + '?' + validQueryMatch[0];
        console.log(`⚠️ Частично валидные параметры`);
      } else {
        // Убираем query полностью, оставляем только базовый URL
        cleanUrl = baseUrl;
        console.log(`❌ Убираем невалидные параметры`);
      }
    }
  }
  
  // 4. ИСПРАВЛЕНО: Убираем trailing символы, используя правильное регулярное выражение
  cleanUrl = cleanUrl.replace(/[^\w\-._~:\/?#@!$&'()*+,;=%]+$/, '');
  
  console.log(`✅ Финальный URL: ${cleanUrl}`);
  return cleanUrl;
};

/**
 * Извлекает и очищает все URL изображений из строки
 * @param line - строка с потенциальными URL
 * @returns массив очищенных URL
 */
export const extractAndCleanUrls = (line: string): string[] => {
  if (!line || line.trim() === '') return [];
  
  // Поиск всех URL в строке
  const urlPatterns = [
    /https:\/\/cdn\.poizon\.com\/[^\s,;"'\n\r\t]+/g,
    /https:\/\/cdn-img\.thepoizon\.ru\/[^\s,;"'\n\r\t]+/g,
    /https:\/\/[^\s,;"'\n\r\t]*\.(jpg|jpeg|png|gif|webp)[^\s,;"'\n\r\t]*/gi,
    /https:\/\/[^\s,;"'\n\r\t]+/g
  ];
  
  let allUrls: string[] = [];
  
  // Применяем все паттерны
  for (const pattern of urlPatterns) {
    const matches = line.match(pattern) || [];
    allUrls = allUrls.concat(matches);
  }
  
  // Также проверяем разделители
  if (line.includes(';')) {
    const parts = line.split(';');
    for (const part of parts) {
      if (part.includes('https://')) {
        allUrls.push(part.trim());
      }
    }
  }
  
  // Очищаем каждый URL
  const cleanUrls = allUrls
    .map(url => cleanImageUrl(url))
    .filter(url => url.length > 20) // Минимальная длина URL
    .filter(url => url.startsWith('https://'));
  
  // Удаляем дубликаты
  return [...new Set(cleanUrls)];
};

/**
 * Парсит строку с множественными URL (разделенными ; , или переносами строк)
 * @param photoString - строка с URL
 * @returns массив очищенных URL
 */
export const parseMultiplePhotoUrls = (photoString: string): string[] => {
  if (!photoString || photoString.trim() === '') {
    return [];
  }
  
  console.log('📸 Парсинг множественных URL:', photoString.substring(0, 100) + '...');
  
  let photos: string[] = [];
  
  // ПРИОРИТЕТ: Разделяем по точке с запятой
  if (photoString.includes(';')) {
    photos = photoString.split(';');
    console.log(`✂️ Разделение по ";" - найдено ${photos.length} частей`);
  }
  // Затем пробуем переносы строк
  else if (photoString.includes('\n') || photoString.includes('\r')) {
    photos = photoString.split(/[\r\n]+/);
    console.log(`✂️ Разделение по переносам строк - найдено ${photos.length} частей`);
  }
  // Потом запятые
  else if (photoString.includes(',')) {
    photos = photoString.split(',');
    console.log(`✂️ Разделение по запятым - найдено ${photos.length} частей`);
  }
  // Если разделителей нет, используем всю строку
  else {
    photos = [photoString];
    console.log('📦 Используем всю строку как один URL');
  }
  
  // Очищаем каждый URL
  const cleanPhotos = photos
    .map((url: string, index: number) => {
      console.log(`🧽 Очищаем URL ${index + 1}:`, url.substring(0, 50) + '...');
      return cleanImageUrl(url.trim());
    })
    .filter((url: string) => url.length > 20) // Минимальная длина URL
    .filter((url: string) => url.startsWith('https://'));
  
  console.log(`✅ Итого очищенных URL: ${cleanPhotos.length}`);
  return [...new Set(cleanPhotos)]; // Удаляем дубликаты
};

/**
 * Проверяет, является ли URL валидным для изображения
 * @param url - URL для проверки
 * @returns true если URL валидный
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url || url.trim() === '') return false;
  
  const trimmedUrl = url.trim();
  
  // Проверяем, что это валидный HTTP URL
  const isHttp = trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://');
  
  // Проверяем, что URL содержит домен
  const hasDomain = trimmedUrl.includes('.') && trimmedUrl.length > 10;
  
  // Проверяем популярные домены изображений или расширения
  const hasImageIndicator = 
    trimmedUrl.includes('cdn') || 
    trimmedUrl.includes('image') ||
    trimmedUrl.includes('photo') ||
    trimmedUrl.includes('pic') ||
    /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(trimmedUrl);
  
  return isHttp && hasDomain && hasImageIndicator;
};

/**
 * Удаляет проблемные query параметры из URL, оставляя только полезные
 * @param url - исходный URL
 * @returns URL с очищенными параметрами
 */
export const cleanUrlParameters = (url: string): string => {
  if (!url || !url.includes('?')) return url;
  
  const [baseUrl, queryString] = url.split('?');
  const params = new URLSearchParams(queryString);
  
  // Список полезных параметров, которые стоит оставить
  const allowedParams = ['w', 'h', 'width', 'height', 'q', 'quality', 'format', 'fit', 'crop'];
  
  // Создаем новый URLSearchParams только с разрешенными параметрами
  const cleanParams = new URLSearchParams();
  
  for (const [key, value] of params.entries()) {
    if (allowedParams.includes(key.toLowerCase()) && /^[a-zA-Z0-9]+$/.test(value)) {
      cleanParams.set(key, value);
    }
  }
  
  const cleanQuery = cleanParams.toString();
  return cleanQuery ? `${baseUrl}?${cleanQuery}` : baseUrl;
};

/**
 * Получает первый валидный URL из строки с множественными URL
 * @param photoString - строка с URL
 * @returns первый валидный URL или пустую строку
 */
export const getFirstValidUrl = (photoString: string): string => {
  const urls = parseMultiplePhotoUrls(photoString);
  return urls.length > 0 ? urls[0] : '';
};

/**
 * Логирует информацию об обработке URL для отладки
 * @param originalUrl - исходный URL
 * @param cleanedUrl - очищенный URL
 * @param context - контекст (например, название товара)
 */
export const logUrlProcessing = (originalUrl: string, cleanedUrl: string, context?: string): void => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔍 URL Processing ${context ? `(${context})` : ''}`);
    console.log('Original:', originalUrl.substring(0, 100) + (originalUrl.length > 100 ? '...' : ''));
    console.log('Cleaned:', cleanedUrl.substring(0, 100) + (cleanedUrl.length > 100 ? '...' : ''));
    console.log('Valid:', isValidImageUrl(cleanedUrl));
    console.groupEnd();
  }
};