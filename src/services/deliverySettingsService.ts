// services/deliverySettingsService.ts
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

// Настройки по умолчанию
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

/**
 * Парсит настройки из CSV данных таблицы
 */
const parseSettingsFromCSV = (csvText: string): Partial<DeliverySettingsData> => {
  const lines = csvText.split('\n').filter(line => line.trim());
  
  const deliveryOptions: DeliveryOption[] = [];
  const paymentOptions: PaymentOption[] = [];
  const promoCodes: PromoCode[] = [];
  
  for (const line of lines) {
    const parts = line.split('|');
    
    // Парсим настройки доставки
    if (parts[0] === 'DELIVERY_SETTING' && parts.length >= 5) {
      deliveryOptions.push({
        id: parts[1] as any,
        name: parts[2],
        price: parseInt(parts[3]) || 0,
        estimatedDays: parts[4],
        description: parts[5] || ''
      });
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

/**
 * Загружает настройки доставки из Google Sheets
 */
export const fetchDeliverySettings = async (): Promise<DeliverySettingsData> => {
  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;
    
    const response = await fetch(csvUrl, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sheet data');
    }

    const csvText = await response.text();
    const customSettings = parseSettingsFromCSV(csvText);
    
    // Объединяем настройки по умолчанию с кастомными
    const finalSettings: DeliverySettingsData = {
      deliveryOptions: customSettings.deliveryOptions || DEFAULT_SETTINGS.deliveryOptions,
      paymentOptions: customSettings.paymentOptions || DEFAULT_SETTINGS.paymentOptions,
      promoCodes: customSettings.promoCodes || DEFAULT_SETTINGS.promoCodes,
      generalSettings: customSettings.generalSettings || DEFAULT_SETTINGS.generalSettings
    };
    
    return finalSettings;
    
  } catch (error) {
    console.warn('Не удалось загрузить настройки из таблицы, используем значения по умолчанию:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * Получает настройки доставки с кешированием
 */
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