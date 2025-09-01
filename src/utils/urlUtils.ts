export const cleanImageUrl = (url: string): string => {
  if (!url || url.trim() === '') return '';
  
  
  let cleanUrl = url.replace(/^[",;}\]\)\s]+/, '').replace(/[",;}\]\)\s]+$/, '').trim();
  
  const httpsMatch = cleanUrl.match(/https:\/\/.+/);
  if (httpsMatch) {
    cleanUrl = httpsMatch[0];
  }
  
  const queryIndex = cleanUrl.indexOf('?');
  if (queryIndex !== -1) {
    const baseUrl = cleanUrl.substring(0, queryIndex);
    const queryPart = cleanUrl.substring(queryIndex + 1);
    
    
    if (/^[a-zA-Z0-9=&_\-%.]+$/.test(queryPart)) {
      cleanUrl = baseUrl + '?' + queryPart;
    } else {
      const validQueryMatch = queryPart.match(/^[a-zA-Z0-9=&_\-%.]+/);
      if (validQueryMatch && validQueryMatch[0].length > 5) {
        cleanUrl = baseUrl + '?' + validQueryMatch[0];
      } else {
        cleanUrl = baseUrl;
      }
    }
  }
  
  cleanUrl = cleanUrl.replace(/[^\w\-._~:\/?#@!$&'()*+,;=%]+$/, '');
  
  return cleanUrl;
};

export const extractAndCleanUrls = (line: string): string[] => {
  if (!line || line.trim() === '') return [];
  
  const urlPatterns = [
    /https:\/\/cdn\.poizon\.com\/[^\s,;"'\n\r\t]+/g,
    /https:\/\/cdn-img\.thepoizon\.ru\/[^\s,;"'\n\r\t]+/g,
    /https:\/\/[^\s,;"'\n\r\t]*\.(jpg|jpeg|png|gif|webp)[^\s,;"'\n\r\t]*/gi,
    /https:\/\/[^\s,;"'\n\r\t]+/g
  ];
  
  let allUrls: string[] = [];
  
  for (const pattern of urlPatterns) {
    const matches = line.match(pattern) || [];
    allUrls = allUrls.concat(matches);
  }
  
  if (line.includes(';')) {
    const parts = line.split(';');
    for (const part of parts) {
      if (part.includes('https://')) {
        allUrls.push(part.trim());
      }
    }
  }
  
  const cleanUrls = allUrls
    .map(url => cleanImageUrl(url))
    .filter(url => url.length > 20) 
    .filter(url => url.startsWith('https://'));
  
  return [...new Set(cleanUrls)];
};

export const parseMultiplePhotoUrls = (photoString: string): string[] => {
  if (!photoString || photoString.trim() === '') {
    return [];
  }
  
  
  let photos: string[] = [];
  
  if (photoString.includes(';')) {
    photos = photoString.split(';');
  }
  else if (photoString.includes('\n') || photoString.includes('\r')) {
    photos = photoString.split(/[\r\n]+/);
  }
  else if (photoString.includes(',')) {
    photos = photoString.split(',');
  }
  else {
    photos = [photoString];
  }
  
  const cleanPhotos = photos
    .map((url: string, index: number) => {
      return cleanImageUrl(url.trim());
    })
    .filter((url: string) => url.length > 20) 
    .filter((url: string) => url.startsWith('https://'));
  
  return [...new Set(cleanPhotos)]; 
};

export const isValidImageUrl = (url: string): boolean => {
  if (!url || url.trim() === '') return false;
  
  const trimmedUrl = url.trim();
  
  const isHttp = trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://');
  
  const hasDomain = trimmedUrl.includes('.') && trimmedUrl.length > 10;
  
  const hasImageIndicator = 
    trimmedUrl.includes('cdn') || 
    trimmedUrl.includes('image') ||
    trimmedUrl.includes('photo') ||
    trimmedUrl.includes('pic') ||
    /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(trimmedUrl);
  
  return isHttp && hasDomain && hasImageIndicator;
};

export const cleanUrlParameters = (url: string): string => {
  if (!url || !url.includes('?')) return url;
  
  const [baseUrl, queryString] = url.split('?');
  const params = new URLSearchParams(queryString);
  
  const allowedParams = ['w', 'h', 'width', 'height', 'q', 'quality', 'format', 'fit', 'crop'];
  
  const cleanParams = new URLSearchParams();
  
  for (const [key, value] of params.entries()) {
    if (allowedParams.includes(key.toLowerCase()) && /^[a-zA-Z0-9]+$/.test(value)) {
      cleanParams.set(key, value);
    }
  }
  
  const cleanQuery = cleanParams.toString();
  return cleanQuery ? `${baseUrl}?${cleanQuery}` : baseUrl;
};

export const getFirstValidUrl = (photoString: string): string => {
  const urls = parseMultiplePhotoUrls(photoString);
  return urls.length > 0 ? urls[0] : '';
};

export const logUrlProcessing = (originalUrl: string, cleanedUrl: string, context?: string): void => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔍 URL Processing ${context ? `(${context})` : ''}`);
    console.groupEnd();
  }
};