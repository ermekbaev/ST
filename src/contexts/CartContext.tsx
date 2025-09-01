'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

interface CartItem extends Product {
  image: any;
  title: string;
  images: any;
  quantity: number;
}

interface CartContextType {
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

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  getTotalPrice: () => 0, 
  totalItems: 0,
  totalPrice: 0,
  isCartOpen: false,
  openCart: () => {},
  closeCart: () => {},
  toggleCart: () => {},
});

const CART_STORAGE_KEY = 'tigr_shop_cart';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

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

  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error('Ошибка сохранения корзины в localStorage:', error);
      }
    }
  }, [items, isHydrated]);

const addToCart = (product: Product) => {
  
  //@ts-ignore
  setItems(currentItems => {
    const uniqueKey = `${product.id || product.article}-${product.size}`;
    
    const existingItem = currentItems.find(item => 
      `${item.id || item.article}-${item.size}` === uniqueKey
    );

    if (existingItem) {
      return currentItems.map(item =>
        `${item.id || item.article}-${item.size}` === uniqueKey
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      return [...currentItems, { ...product, quantity: 1 }];
    }
  });
};

  const removeFromCart = (productId: string) => {
    setItems(currentItems =>
      currentItems.filter(item => (item.id || item.article) !== productId)
    );
  };

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

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = (): number => {
    return isHydrated ? items.reduce((total, item) => total + (item.price * item.quantity), 0) : 0;
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const totalItems = isHydrated ? items.reduce((total, item) => total + item.quantity, 0) : 0;

  const totalPrice = isHydrated ? items.reduce((total, item) => total + (item.price * item.quantity), 0) : 0;

  const value: CartContextType = {
    items: isHydrated ? items : [], 
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice, 
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

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};