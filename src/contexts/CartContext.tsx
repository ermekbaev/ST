'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  quantity: number;
}

// Интерфейс для контекста корзины
interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

// Создаем контекст с дефолтным значением
const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalPrice: 0,
});

// Провайдер корзины
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Добавить товар в корзину
  const addToCart = (product: Product) => {
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

  // Подсчет общего количества товаров
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  // Подсчет общей стоимости
  const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice
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