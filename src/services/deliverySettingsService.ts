import { DeliveryOption, PaymentOption, PromoCode } from '@/types/checkout';

interface GeneralSettings {
  deliveryTimeGeneral: string;
  minOrderFreeDelivery: number;
  currency: string;
}

export interface DeliverySettingsData {
  deliveryOptions: DeliveryOption[];
  paymentOptions: PaymentOption[];
  promoCodes: PromoCode[];
  generalSettings: GeneralSettings;
}

const SHEET_ID = '1naTkxDrQFfj_d7Q2U46GOj24hSqTAqrt_Yz1ImaKyVc';

const DEFAULT_SETTINGS: DeliverySettingsData = {
  deliveryOptions: [
    {
      id: 'store_pickup',
      name: 'Доставить в магазин TS',
      price: 0,
      estimatedDays: '5-7 дней',
      description: 'Бесплатный самовывоз из магазина во Владивостоке'
    },
    {
      id: 'courier_ts',
      name: 'Доставка курьером TS',
      price: 0,
      estimatedDays: '5-7 дней',
      description: 'Бесплатная доставка курьером по Владивостоку'
    },
    {
      id: 'cdek_pickup',
      name: 'СДЭК - доставка до пункта выдачи',
      price: 300,
      estimatedDays: '3-5 дней',
      description: 'Доставка до ближайшего пункта СДЭК'
    },
    {
      id: 'cdek_courier',
      name: 'СДЭК - доставка курьером',
      price: 500,
      estimatedDays: '3-5 дней',
      description: 'Доставка курьером СДЭК на дом'
    },
    {
      id: 'post_russia',
      name: 'Почта России',
      price: 250,
      estimatedDays: '7-14 дней',
      description: 'Доставка Почтой России'
    },
    {
      id: 'boxberry',
      name: 'BoxBerry',
      price: 350,
      estimatedDays: '4-6 дней',
      description: 'Доставка до пункта BoxBerry'
    }
  ],
  paymentOptions: [
    {
      id: 'card',
      name: 'Оплата картой (МИР, VISA, MasterCard)',
      description: 'Онлайн оплата банковской картой'
    },
    {
      id: 'cash_vladivostok',
      name: 'Оплата наличными в городе Владивосток',
      description: 'Оплата наличными при получении'
    }
  ],
  promoCodes: [
    {
      code: 'WELCOME10',
      discount: 10,
      type: 'percentage'
    },
    {
      code: 'SAVE500',
      discount: 500,
      type: 'amount'
    },
    {
      code: 'FREESHIP',
      discount: 0,
      type: 'free_shipping'
    }
  ],
  generalSettings: {
    deliveryTimeGeneral: '16-21 дней',
    minOrderFreeDelivery: 5000,
    currency: '₽'
  }
};

const parseSettingsFromCSV = (csvText: string): Partial<DeliverySettingsData> => {
  const lines = csvText.split('\n').filter(line => line.trim());
  
  const deliveryOptions: DeliveryOption[] = [];
  const paymentOptions: PaymentOption[] = [];
  const promoCodes: PromoCode[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Формат 1: Специальные строки с разделителем |
    if (line.includes('|')) {
      const parts = line.split('|').map(part => part.trim());
      
      // Парсим настройки доставки
      if (parts[0] === 'DELIVERY_SETTING' && parts.length >= 5) {
        const option: DeliveryOption = {
          id: parts[1] as any,
          name: parts[2],
          price: parseInt(parts[3]) || 0,
          estimatedDays: parts[4],
          description: parts[5] || ''
        };
        deliveryOptions.push(option);
      }
      
      // Парсим настройки оплаты
      if (parts[0] === 'PAYMENT_SETTING' && parts.length >= 3) {
        paymentOptions.push({
          id: parts[1] as any,
          name: parts[2],
          description: parts[3] || ''
        });
      }
      
      // Парсим промокоды
      if (parts[0] === 'PROMO_SETTING' && parts.length >= 4) {
        promoCodes.push({
          code: parts[1].toUpperCase(),
          discount: parseFloat(parts[2]) || 0,
          type: parts[3] as any
        });
      }
    }
    
    // Формат 2: CSV с заголовками (если первая строка содержит delivery_id, name, price, etc.)
    else if (i === 0 && line.toLowerCase().includes('delivery_id') && line.toLowerCase().includes('price')) {
      
      const headers = line.split(',').map(h => h.trim().toLowerCase());
      const idIndex = headers.findIndex(h => h.includes('delivery_id') || h.includes('id'));
      const nameIndex = headers.findIndex(h => h.includes('name'));
      const priceIndex = headers.findIndex(h => h.includes('price'));
      const daysIndex = headers.findIndex(h => h.includes('days') || h.includes('time'));
      const descIndex = headers.findIndex(h => h.includes('description') || h.includes('desc'));
      
      // Парсим остальные строки как данные доставки
      for (let j = i + 1; j < lines.length; j++) {
        const dataLine = lines[j].trim();
        if (!dataLine) continue;
        
        const values = dataLine.split(',').map(v => v.trim().replace(/^["']+|["']+$/g, ''));
        
        if (values.length > Math.max(idIndex, nameIndex, priceIndex)) {
          const option: DeliveryOption = {
            id: values[idIndex] as any,
            name: values[nameIndex] || '',
            price: parseInt(values[priceIndex]) || 0,
            estimatedDays: daysIndex >= 0 ? values[daysIndex] : '',
            description: descIndex >= 0 ? values[descIndex] : ''
          };
          
          if (option.id && option.name) {
            deliveryOptions.push(option);
          }
        }
      }
      break; // Прекращаем обработку остальных строк
    }
  }
  
  const result: Partial<DeliverySettingsData> = {};
  
  if (deliveryOptions.length > 0) {
    result.deliveryOptions = deliveryOptions;
  }
  if (paymentOptions.length > 0) {
    result.paymentOptions = paymentOptions;
  }
  if (promoCodes.length > 0) {
    result.promoCodes = promoCodes;
  }
  
  return result;
};

export const fetchDeliverySettings = async (): Promise<DeliverySettingsData> => {
  const attempts = [
    { name: 'Основная вкладка', gid: 0 },
    { name: 'Вкладка Доставка', gid: 1 },
    { name: 'Вкладка Settings', gid: 2 }
  ];
  
  let finalSettings = { ...DEFAULT_SETTINGS };
  let foundAnySettings = false;
  
  for (const attempt of attempts) {
    try {
      
      const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${attempt.gid}`;
      
      const response = await fetch(csvUrl, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!response.ok) {
        continue;
      }

      const csvText = await response.text();
      
      if (!csvText || csvText.trim().length < 10) {
        continue;
      }
      
      const customSettings = parseSettingsFromCSV(csvText);
      
      // Объединяем найденные настройки
      if (customSettings.deliveryOptions && customSettings.deliveryOptions.length > 0) {
        finalSettings.deliveryOptions = customSettings.deliveryOptions;
        foundAnySettings = true;
      }
      
      if (customSettings.paymentOptions && customSettings.paymentOptions.length > 0) {
        finalSettings.paymentOptions = customSettings.paymentOptions;
        foundAnySettings = true;
      }
      
      if (customSettings.promoCodes && customSettings.promoCodes.length > 0) {
        finalSettings.promoCodes = customSettings.promoCodes;
        foundAnySettings = true;
      }
      
    } catch (error) {
      continue;
    }
  }
  
  return finalSettings;
};

let cachedSettings: DeliverySettingsData | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

export const getDeliverySettings = async (forceRefresh = false): Promise<DeliverySettingsData> => {
  const now = Date.now();
  
  // Возвращаем кешированные данные, если они актуальны
  if (!forceRefresh && cachedSettings && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedSettings;
  }
  
  // Загружаем новые данные
  const settings = await fetchDeliverySettings();
  cachedSettings = settings;
  cacheTimestamp = now;
  
  return settings;
};