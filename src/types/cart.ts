// Базовый интерфейс товара
export interface Product {
  id?: string;
  article: string;
  brand: string;
  name: string;
  size: string;
  category: string;
  gender: string;
  price: number;
  photo: string;
}

// Интерфейс элемента корзины (товар + количество)
export interface CartItem extends Product {
  quantity: number;
  image?: string; // Алиас для photo для совместимости
}

// Интерфейс контекста корзины
export interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number; 
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

// Вспомогательные типы для расчетов
export interface CartSummary {
  subtotal: number;
  itemsCount: number;
  averageItemPrice: number;
}

// Состояние загрузки корзины
export interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  isHydrated: boolean;
}

// Убеждаемся что все типы экспортированы
export type { Product as CartProduct };
export type { CartItem as CartItemType };