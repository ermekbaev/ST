'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Интерфейс для товара
interface Product {
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

// Интерфейс для элемента корзины
interface CartItem extends Product {
  image: any;
  title: string;
  images: any;
  quantity: number;
}

// Интерфейс для контекста корзины
interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number; // ✅ Добавляем эту функцию
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

// Создаем контекст с дефолтным значением
const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  getTotalPrice: () => 0, // ✅ Добавляем в дефолтное значение
  totalItems: 0,
  totalPrice: 0,
  isCartOpen: false,
  openCart: () => {},
  closeCart: () => {},
  toggleCart: () => {},
});

// Ключ для localStorage
const CART_STORAGE_KEY = 'tigr_shop_cart';

// Провайдер корзины
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Загрузка корзины из localStorage при инициализации
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setItems(parsedCart);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки корзины из localStorage:', error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Сохранение корзины в localStorage при изменении
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error('Ошибка сохранения корзины в localStorage:', error);
      }
    }
  }, [items, isHydrated]);

  // Добавить товар в корзину
  const addToCart = (product: Product) => {
    //@ts-ignore
    setItems(currentItems => {
      const productId = product.id || product.article;
      const existingItem = currentItems.find(item => (item.id || item.article) === productId);

      if (existingItem) {
        // Если товар уже есть в корзине, увеличиваем количество
        return currentItems.map(item =>
          (item.id || item.article) === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Если товара нет в корзине, добавляем его
        return [...currentItems, { ...product, quantity: 1 }];
      }
    });
  };

  // Удалить товар из корзины
  const removeFromCart = (productId: string) => {
    setItems(currentItems =>
      currentItems.filter(item => (item.id || item.article) !== productId)
    );
  };

  // Обновить количество товара
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        (item.id || item.article) === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Очистить корзину
  const clearCart = () => {
    setItems([]);
  };

  // ✅ Добавляем функцию getTotalPrice
  const getTotalPrice = (): number => {
    return isHydrated ? items.reduce((total, item) => total + (item.price * item.quantity), 0) : 0;
  };

  // Управление состоянием корзины
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(!isCartOpen);

  // Подсчет общего количества товаров (только после гидратации)
  const totalItems = isHydrated ? items.reduce((total, item) => total + item.quantity, 0) : 0;

  // Подсчет общей стоимости (только после гидратации)
  const totalPrice = isHydrated ? items.reduce((total, item) => total + (item.price * item.quantity), 0) : 0;

  const value: CartContextType = {
    items: isHydrated ? items : [], // Показываем товары только после гидратации
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice, // ✅ Добавляем функцию в value
    totalItems,
    totalPrice,
    isCartOpen,
    openCart,
    closeCart,
    toggleCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Хук для использования контекста корзины
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};