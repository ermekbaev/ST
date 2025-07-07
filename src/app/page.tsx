'use client';

import React, { useState, useEffect } from 'react';
import HeroSlider from '../components/HeroSlider';
import ProductCard from '../components/ProductCard';
import HowItWorksModal from '../components/HowItWorksModal';
import CustomOrderSection from '@/components/CustomOrder/CustomOrderSection';

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

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Все useEffect должны быть в одном месте
  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      const result = await response.json();
      
      if (result.success) {
        const productsData = Array.isArray(result.data) ? result.data : [];
        setProducts(productsData);
        console.log('Загружено товаров:', result.count);
      } else {
        throw new Error(result.error || 'Ошибка загрузки данных');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Ошибка:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchProducts();
    }
  }, [mounted]);

  // Функция для получения последних товаров из категории
  const getLatestProductsFromCategory = (categoryFilter: string[], count: number = 4) => {
    const filteredProducts = products.filter(product => 
      categoryFilter.some(filter => 
        product.category.toLowerCase().includes(filter.toLowerCase())
      )
    );
    
    // Убираем дубликаты по названию
    const uniqueProducts = filteredProducts.filter((product, index, self) => 
      index === self.findIndex(p => p.name === product.name)
    );
    
    // Возвращаем последние добавленные (последние в массиве)
    return uniqueProducts.slice(-count).reverse();
  };

  // Группировка товаров по категориям (оставляем для совместимости)
  const groupedProducts = Array.isArray(products) ? products.reduce((acc: Record<string, Product[]>, product) => {
    const category = product.category || 'Прочее';
    if (!acc[category]) acc[category] = [];
    
    const existingProduct = acc[category].find(p => p.name === product.name);
    if (!existingProduct) {
      acc[category].push(product);
    }
    
    return acc;
  }, {}) : {};

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <HeroSlider />
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <span className="text-gray-600">Загружаем данные из Google Таблиц...</span>
        </div>
      </div>
    );
  }

  // Компонент секции товаров с поддержкой последних товаров
  const ProductSection = ({ title, categoryKey, categoryFilters, linkText = "все модели" }: { 
    title: string; 
    categoryKey?: string;
    categoryFilters?: string[];
    linkText?: string;
  }) => {
    let displayProducts: Product[] = [];

    if (categoryFilters) {
      // Новая логика - берем последние товары из указанных категорий
      displayProducts = getLatestProductsFromCategory(categoryFilters, 4);
    } else if (categoryKey) {
      // Старая логика - первые товары из конкретной категории
      const categoryProducts = groupedProducts[categoryKey] || [];
      displayProducts = categoryProducts.slice(0, 4);
    }

    return (
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6 lg:mb-8">
          <h2 className="section-title text-[22px] lg:text-[35px] text-black">
            {title}
          </h2>
          <a 
            href="#" 
            className="text-black text-[16px] lg:text-[20px] hover:text-gray-600 transition-colors flex items-center gap-2 font-product"
          >
            {/* Десктопная версия */}
            <span className="hidden lg:inline">
              {linkText}
            </span>
            <img src="/utils/Vector3.svg" alt="" className="hidden lg:block w-3 h-3 lg:w-4 lg:h-4" />
            {/* Мобильная версия - своя иконка стрелки */}
            <img src="/utils/arrow_right.svg" alt="" className="lg:hidden w-4 h-4" />
          </a>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {displayProducts.length > 0 ? (
            displayProducts.map((product, index) => (
              <ProductCard key={product.id || index} product={product} />
            ))
          ) : (
            // Показываем заглушки если нет товаров
            Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="bg-white w-full">
                <div className="w-full h-[200px] bg-gray-50 flex items-center justify-center">
                  <span className="text-gray-400 text-sm font-product">Скоро товары</span>
                </div>
                <div className="w-full h-px bg-brand-dark"></div>
                <div className="py-2">
                  <div className="h-[31px] bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-[20px] bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Герой секция */}
      <HeroSlider />
      
      {/* Основной контент */}
      <div className="w-full px-5 py-12">
        {/* px-5 = 20px отступы с каждой стороны */}
        
        {/* Ошибка загрузки */}
        {error && (
          <div className="text-center text-red-600 p-8 mb-8 bg-red-50 rounded-lg">
            <p className="mb-4 font-product">Ошибка загрузки товаров: {error}</p>
            <button 
              onClick={fetchProducts}
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-product"
            >
              Попробовать снова
            </button>
          </div>
        )}

        {/* Секция "ОБУВЬ" - показывает 4 последних товара из категорий обуви */}
        <ProductSection 
          title="ОБУВЬ" 
          categoryFilters={["кроссовки", "кеды", "ботинки", "обувь", "угги", "слэды"]}
        />

        {/* Секция "ОДЕЖДА" - показывает 4 последних товара из категорий одежды */}
        <ProductSection 
          title="ОДЕЖДА" 
          categoryFilters={["толстовки", "свитшоты", "футболки", "одежда", "куртки", "штаны", "шорты"]}
        />

        {/* Секция "АКСЕССУАРЫ" - показывает 4 последних товара из категорий аксессуаров */}
        <ProductSection 
          title="АКСЕССУАРЫ" 
          categoryFilters={["аксессуары", "сумки", "рюкзаки", "головные", "очки", "кошельки", "белье"]}
        />

        {/* Секция "КОЛЛЕКЦИИ" */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-6 lg:mb-8">
            <h2 className="section-title text-[22px] lg:text-[35px] text-black">
              КОЛЛЕКЦИИ
            </h2>
            <a 
              href="#" 
              className="text-black text-[16px] lg:text-[20px] hover:text-gray-600 transition-colors flex items-center gap-2 font-product"
            >
              {/* Десктопная версия */}
              <span className="hidden lg:inline">
                все модели
              </span>
              <img src="/utils/Vector3.svg" alt="" className="hidden lg:block w-3 h-3 lg:w-4 lg:h-4" />
              {/* Мобильная версия - своя иконка стрелки */}
              <img src="/utils/arrow_right.svg" alt="" className="lg:hidden w-4 h-4" />
            </a>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[
              { name: 'НАЗВАНИЕ' },
              { name: 'НАЗВАНИЕ' },
              { name: 'НАЗВАНИЕ' },
              { name: 'НАЗВАНИЕ' }
            ].map((collection, index) => (
              <div key={index} className="cursor-pointer group bg-white w-full hover-lift">
                <div className="w-full h-[200px] bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                  <span className="text-gray-400 text-sm font-product">png?</span>
                </div>
                <div className="w-full h-px bg-brand-dark"></div>
                <div className="py-2">
                  <div className="product-name text-brand-dark text-[25px] leading-[31px]">
                    {collection.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
{/* Секция индивидуального заказа */}
      <CustomOrderSection 
        onHowItWorksClick={() => {
          if (mounted) {
            setIsModalOpen(true);
          }
        }}
      />
    </div>
  );
}