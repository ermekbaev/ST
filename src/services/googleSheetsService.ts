// src/services/googleSheetsService.ts
// ОБНОВЛЕНО: работает с Strapi через Next.js API routes
// ПОЛНАЯ СОВМЕСТИМОСТЬ с существующими компонентами

// ==================== ИНТЕРФЕЙСЫ (совместимые с существующим кодом) ====================

export interface Product {
  id?: string; // Опционально для совместимости
  article: string;
  brand: string;
  name: string;
  
  // ДЛЯ СОВМЕСТИМОСТИ - оба формата:
  size: string;         // Первый размер (старый формат)
  sizes: string[];      // Массив размеров (новый формат)
  
  category: string;
  gender: string;
  price: number;
  
  // ДЛЯ СОВМЕСТИМОСТИ - оба формата фото:
  photo: string;        // Основное фото (старый формат)
  mainPhoto: string;    // Основное фото (новый формат)
  additionalPhotos: string[];
  
  stockQuantity: number;
  availableStock: number;
  isActive: boolean;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

// Дополнительные интерфейсы
export interface OrderItem {
  productId: string;
  size: string;
  quantity: number;
  priceAtTime: number;
}

export interface CreateOrderData {
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  deliveryAddress?: string;
  notes?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  orderId?: string;
  error?: string;
  processedItems?: number;
  totalItems?: number;
}

// ==================== ОСНОВНЫЕ ФУНКЦИИ ====================

/**
 * Получить все товары (теперь из Strapi через API)
 */
export const getProducts = async (filters?: {
  category?: string;
  brand?: string;
  gender?: string;
  limit?: number;
}): Promise<Product[]> => {
  try {
    console.log('🔄 Загружаем товары через Next.js API...');
    
    // Строим URL с параметрами (если нужны фильтры)
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.brand) params.append('brand', filters.brand);
    if (filters?.gender) params.append('gender', filters.gender);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const url = `/api/products${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // Всегда свежие данные
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API ошибка:', errorData);
      // Для совместимости возвращаем пустой массив вместо throw
      return [];
    }

    const data = await response.json();
    const strapiProducts = data.products || [];
    
    // ВАЖНО: Преобразуем в формат, совместимый с существующими компонентами
    const products: Product[] = strapiProducts.map((product: any) => ({
      id: product.id,
      article: product.article,
      brand: product.brand,
      name: product.name,
      
      // Совместимость размеров:
      size: product.sizes?.[0] || '',  // Первый размер для старых компонентов
      sizes: product.sizes || [],      // Полный массив для новых компонентов
      
      category: product.category,
      gender: product.gender,
      price: product.price,
      
      // Совместимость фото:
      photo: product.mainPhoto || '/images/placeholder.jpg',  // Для старых компонентов
      mainPhoto: product.mainPhoto || '/images/placeholder.jpg', // Для новых компонентов
      additionalPhotos: product.additionalPhotos || [],
      
      stockQuantity: product.stockQuantity || 0,
      availableStock: product.availableStock || 0,
      isActive: product.isActive !== false,
      slug: product.slug || '',
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }));
    
    console.log(`✅ Загружено ${products.length} товаров из Strapi`);
    return products;

  } catch (error) {
    console.error('❌ Ошибка загрузки товаров:', error);
    // Для совместимости возвращаем пустой массив
    return [];
  }
};

/**
 * Получить товар по ID
 */
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    console.log(`🔄 Загружаем товар ${id} через API...`);
    
    const response = await fetch(`/api/products/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`⚠️ Товар ${id} не найден`);
        return null;
      }
      
      const errorData = await response.json();
      console.error('❌ API ошибка:', errorData);
      return null;
    }

    const data = await response.json();
    const strapiProduct = data.product;
    
    if (!strapiProduct) {
      return null;
    }
    
    // Преобразуем в совместимый формат
    const product: Product = {
      id: strapiProduct.id,
      article: strapiProduct.article,
      brand: strapiProduct.brand,
      name: strapiProduct.name,
      
      // Совместимость размеров:
      size: strapiProduct.sizes?.[0] || '',
      sizes: strapiProduct.sizes || [],
      
      category: strapiProduct.category,
      gender: strapiProduct.gender,
      price: strapiProduct.price,
      
      // Совместимость фото:
      photo: strapiProduct.mainPhoto || '/images/placeholder.jpg',
      mainPhoto: strapiProduct.mainPhoto || '/images/placeholder.jpg',
      additionalPhotos: strapiProduct.additionalPhotos || [],
      
      stockQuantity: strapiProduct.stockQuantity || 0,
      availableStock: strapiProduct.availableStock || 0,
      isActive: strapiProduct.isActive !== false,
      slug: strapiProduct.slug || ''
    };
    
    console.log(`✅ Товар ${id} загружен`);
    return product;

  } catch (error) {
    console.error(`❌ Ошибка загрузки товара ${id}:`, error);
    return null;
  }
};

/**
 * Создать заказ
 */
export const createOrder = async (orderData: CreateOrderData): Promise<CreateOrderResponse> => {
  try {
    console.log('🔄 Создаем заказ через API...', orderData);

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Ошибка создания заказа:', data);
      return {
        success: false,
        error: data.error || `HTTP error! status: ${response.status}`
      };
    }

    console.log(`✅ Заказ создан через API:`, data);
    return data;

  } catch (error) {
    console.error('❌ Ошибка создания заказа через API:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка при создании заказа'
    };
  }
};

// ==================== СПРАВОЧНИКИ ====================

/**
 * Получить все бренды
 */
export const getBrands = async () => {
  try {
    const response = await fetch('/api/brands');
    const data = await response.json();
    return data.brands || [];
  } catch (error) {
    console.error('❌ Ошибка загрузки брендов:', error);
    return [];
  }
};

/**
 * Получить все категории
 */
export const getCategories = async () => {
  try {
    const response = await fetch('/api/categories');
    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.error('❌ Ошибка загрузки категорий:', error);
    return [];
  }
};

/**
 * Получить все размеры
 */
export const getSizes = async () => {
  try {
    const response = await fetch('/api/sizes');
    const data = await response.json();
    return data.sizes || [];
  } catch (error) {
    console.error('❌ Ошибка загрузки размеров:', error);
    return [];
  }
};

// ==================== СЛУЖЕБНЫЕ ФУНКЦИИ ====================

/**
 * Проверка здоровья системы
 */
export const getSystemHealth = async () => {
  try {
    const response = await fetch('/api/health');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Ошибка проверки состояния системы:', error);
    return {
      status: 'error',
      error: 'Не удалось проверить состояние системы',
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Получить статистику системы
 */
export const getSystemStats = async () => {
  try {
    const health = await getSystemHealth();
    return health.stats || {
      totalProducts: 0,
      totalBrands: 0,
      totalCategories: 0
    };
  } catch (error) {
    console.error('❌ Ошибка получения статистики:', error);
    return {
      totalProducts: 0,
      totalBrands: 0,
      totalCategories: 0
    };
  }
};

// ==================== LEGACY ФУНКЦИИ (для совместимости) ====================

/**
 * Проверка подключения (для совместимости)
 */
export const testGoogleSheetsConnection = async (): Promise<boolean> => {
  try {
    const health = await getSystemHealth();
    return health.status === 'healthy';
  } catch {
    return false;
  }
};

// Алиасы для совместимости
export const testConnection = testGoogleSheetsConnection;
export const testStrapiConnection = testGoogleSheetsConnection;

/**
 * Сохранение пользователя (legacy)
 */
export const saveUserToGoogleSheetsAPI = async (userData: any): Promise<boolean> => {
  console.log('⚠️ saveUserToGoogleSheetsAPI deprecated - используйте новую систему авторизации');
  return false;
};

/**
 * Обновление даты входа (legacy)
 */
export const updateLastLoginDate = async (email: string): Promise<boolean> => {
  console.log('⚠️ updateLastLoginDate deprecated - будет реализовано через Strapi');
  return false;
};

// ==================== ТИПЫ ДЛЯ ЭКСПОРТА ====================

export interface Brand {
  id: number;
  name: string;
  slug: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Size {
  id: number;
  value: string;
}

export interface SystemHealth {
  status: 'healthy' | 'unhealthy' | 'error';
  strapi?: {
    connected: boolean;
    url: string;
  };
  stats?: {
    totalProducts: number;
    totalBrands: number;
    totalCategories: number;
  };
  timestamp: string;
  error?: string;
}
