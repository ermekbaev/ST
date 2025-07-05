'use client';

import React, { useState, useEffect } from 'react';
import HeroSlider from '../components/HeroSlider';
import ProductCard from '../components/ProductCard';

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

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Предотвращаем рендеринг до монтирования
  useEffect(() => {
    setMounted(true);
  }, []);

  // Функция для получения данных из Google Sheets
  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Загружаем данные из Google Sheets...');
      
      const response = await fetch('/api/products');
      const result = await response.json();
      
      console.log('Результат API:', result);
      
      if (result.success) {
        const productsData = Array.isArray(result.data) ? result.data : [];
        setProducts(productsData);
        console.log('Загружено товаров:', result.count);
        console.log('Тип данных:', typeof result.data, Array.isArray(result.data));
        console.log('Первые товары:', productsData.slice(0, 2));
        
        // Проверяем какие категории есть в данных
        const categories = [...new Set(productsData.map(p => p.category))];
        console.log('Найденные категории:', categories);
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
      // Временно отключаем автообновление для стабильности
      // const interval = setInterval(fetchProducts, 5 * 60 * 1000);
      // return () => clearInterval(interval);
    }
  }, [mounted]);

  // Группировка товаров по категориям и уникальным моделям
  const groupedProducts = Array.isArray(products) ? products.reduce((acc: Record<string, Product[]>, product) => {
    const category = product.category || 'Прочее';
    if (!acc[category]) acc[category] = [];
    
    // Проверяем, есть ли уже такая модель в категории
    const existingProduct = acc[category].find(p => p.name === product.name);
    if (!existingProduct) {
      // Добавляем первую найденную модель
      acc[category].push(product);
    }
    
    return acc;
  }, {}) : {};

  // Показываем статистику загруженных данных
  const totalProducts = products.length;
  const uniqueModels = Object.values(groupedProducts).flat().length;
  
  // Отладочная информация
  console.log('Группированные товары:', groupedProducts);
  console.log('Категории в групповых данных:', Object.keys(groupedProducts));

  // Не рендерим ничего до монтирования компонента
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

  return (
    <div className="min-h-screen bg-white">
      {/* Герой секция с баннером */}
      <HeroSlider />
      
      {/* Основной контент */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Ошибка загрузки */}
        {error && (
          <div className="text-center text-red-600 p-8 mb-8">
            <p>Ошибка загрузки товаров: {error}</p>
            <button 
              onClick={fetchProducts}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        )}

        {/* Секция "КРОССОВКИ И КЕДЫ" */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">КРОССОВКИ И КЕДЫ</h2>
            <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
              все товары →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(groupedProducts['Кроссовки и кеды'] || []).slice(0, 4).map((product, index) => (
              <ProductCard key={product.id || index} product={product} />
            ))}
          </div>
        </section>

        {/* Секция "ТОЛСТОВКИ И СВИТШОТЫ" */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">ТОЛСТОВКИ И СВИТШОТЫ</h2>
            <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
              все товары →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(groupedProducts['Толстовки и свитшоты'] || []).slice(0, 4).map((product, index) => (
              <ProductCard key={product.id || index} product={product} />
            ))}
          </div>
        </section>

        {/* Секция "ШТАНЫ И БРЮКИ" */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">ШТАНЫ И БРЮКИ</h2>
            <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
              все товары →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(groupedProducts['Штаны и брюки'] || []).slice(0, 4).map((product, index) => (
              <ProductCard key={product.id || index} product={product} />
            ))}
          </div>
        </section>

        {/* Секция "КОЛЛЕКЦИИ" */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">КОЛЛЕКЦИИ</h2>
            <a 
              href="/collections"
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              все коллекции →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Коллекция Spring', image: '/collections/spring.jpg' },
              { name: 'Коллекция Summer', image: '/collections/summer.jpg' },
              { name: 'Коллекция Autumn', image: '/collections/autumn.jpg' },
              { name: 'Коллекция Winter', image: '/collections/winter.jpg' }
            ].map((collection, index) => (
              <div key={index} className="bg-gray-100 rounded-lg p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <div className="w-full h-32 bg-gray-200 rounded mb-4 flex items-center justify-center overflow-hidden">
                  <img 
                    src={collection.image}
                    alt={collection.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling!.textContent = 'png?';
                    }}
                  />
                  <span className="text-gray-600 hidden">png?</span>
                </div>
                <h3 className="font-semibold text-gray-900">коллекция</h3>
                <p className="text-sm text-gray-600">{collection.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Секция индивидуального заказа */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">В КАТАЛОГЕ НЕТ ИНТЕРЕСУЮЩЕЙ МОДЕЛИ?</h2>
          <p className="text-xl mb-2">ВЫ ВСЕГДА МОЖЕТЕ ОФОРМИТЬ</p>
          <p className="text-3xl font-bold mb-6">ИНДИВИДУАЛЬНЫЙ ЗАКАЗ</p>
          <button 
            onClick={() => {
              // Пока заглушка, позже можно добавить модальное окно или переход на страницу
              console.log('Открыть форму индивидуального заказа');
            }}
            className="bg-transparent border-2 border-white text-white px-8 py-3 rounded hover:bg-white hover:text-gray-900 transition-colors font-semibold"
          >
            ОФОРМИТЬ ИНДИВИДУАЛЬНЫЙ ЗАКАЗ
          </button>
        </section>
      </div>
    </div>
  );
}