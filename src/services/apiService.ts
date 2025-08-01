// ==================== ИНТЕРФЕЙСЫ ====================

export interface Product {
  id: string;
  article: string;
  brand: string;
  name: string;
  sizes: string[];
  category: string;
  gender: string;
  price: number;
  stockQuantity: number;
  availableStock: number;
  mainPhoto: string;
  additionalPhotos: string[];
  isActive: boolean;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

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
 * Получить все товары
 */
export const getProducts = async (filters?: {
  category?: string;
  brand?: string;
  gender?: string;
  limit?: number;
}): Promise<Product[]> => {
  try {
    console.log('🔄 Загружаем товары через API...');
    
    // Строим URL с параметрами
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
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const products = data.products || [];
    
    console.log(`✅ Загружено ${products.length} товаров через API`);
    return products;

  } catch (error) {
    console.error('❌ Ошибка загрузки товаров через API:', error);
    throw error;
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
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const product = data.product;
    
    console.log(`✅ Товар ${id} загружен через API`);
    return product;

  } catch (error) {
    console.error(`❌ Ошибка загрузки товара ${id} через API:`, error);
    return null;
  }
};

/**
 * Создать заказ
 */
export const createOrder = async (orderData: CreateOrderData): Promise<CreateOrderResponse> => {
  try {
    console.log('🔄 Создаем заказ через API...', orderData);
    const token = localStorage.getItem('authToken');

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}) // ВАЖНО
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
    const response = await fetch('/api/brands', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.brands || [];

  } catch (error) {
    console.error('❌ Ошибка загрузки брендов через API:', error);
    return [];
  }
};

/**
 * Получить все категории
 */
export const getCategories = async () => {
  try {
    const response = await fetch('/api/categories', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.categories || [];

  } catch (error) {
    console.error('❌ Ошибка загрузки категорий через API:', error);
    return [];
  }
};

/**
 * Получить все размеры
 */
export const getSizes = async () => {
  try {
    const response = await fetch('/api/sizes', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.sizes || [];

  } catch (error) {
    console.error('❌ Ошибка загрузки размеров через API:', error);
    return [];
  }
};

// ==================== СЛУЖЕБНЫЕ ФУНКЦИИ ====================

/**
 * Проверка здоровья системы
 */
export const getSystemHealth = async () => {
  try {
    const response = await fetch('/api/health', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

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

// ==================== СОВМЕСТИМОСТЬ С СУЩЕСТВУЮЩИМ КОДОМ ====================

// Для совместимости с компонентами, которые могут ожидать эти функции
export const testConnection = async (): Promise<boolean> => {
  try {
    const health = await getSystemHealth();
    return health.status === 'healthy';
  } catch {
    return false;
  }
};

// Алиасы для совместимости
export const testStrapiConnection = testConnection;
export const testGoogleSheetsConnection = testConnection;

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