// src/app/catalog/page.tsx - ВАШ КОД С ДОБАВЛЕННЫМ ПЕРЕМЕШИВАНИЕМ
'use client'

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DesktopFilters from '../../components/Catalog/DesktopFilters';
import MobileFilters from '../../components/Catalog/MobileFilters';
import MobileFilterButton from '../../components/Catalog/MobileFilterButton';
import CatalogSearch from '../../components/Catalog/CatalogSearch';
import CatalogSort from '../../components/Catalog/CatalogSort';
import ProductGrid from '../../components/Catalog/ProductGrid';
import CatalogPagination from '../../components/Catalog/CatalogPagination';
import ActiveFilters from '../../components/Catalog/ActiveFilters';

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

interface FilterState {
  brands: string[];
  genders: string[];
  categories: string[];
  sizes: string[];
  priceRange: {
    min: string;
    max: string;
  };
}

// Компонент загрузки
function CatalogLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка каталога...</p>
        </div>
      </div>
    </div>
  );
}

// Основной компонент каталога
function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const itemsPerPage = 36;

  // Состояние фильтров
  const [filters, setFilters] = useState<FilterState>({
    brands: [],
    genders: [],
    categories: [],
    sizes: [],
    priceRange: { min: '', max: '' }
  });

  // Доступные опции для фильтров
  const [filterOptions, setFilterOptions] = useState({
    brands: [] as string[],
    genders: [] as string[],
    categories: [] as string[],
    sizes: [] as string[]
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ ДОБАВЛЯЕМ ФУНКЦИЮ ПЕРЕМЕШИВАНИЯ (без генериков)
  const shuffleArray = (array: Product[]): Product[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Читаем фильтры из URL при загрузке
  useEffect(() => {
    if (mounted && isInitialLoad) {
      const urlFilters = readFiltersFromURL();
      setFilters(urlFilters);
      setIsInitialLoad(false);
    }
  }, [mounted, isInitialLoad]);

  // Функция для чтения фильтров из URL
  const readFiltersFromURL = (): FilterState => {
    const newFilters: FilterState = {
      brands: [],
      genders: [],
      categories: [],
      sizes: [],
      priceRange: { min: '', max: '' }
    };

    // Читаем параметры из URL
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const gender = searchParams.get('gender');
    const size = searchParams.get('size');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    // Заполняем фильтры из URL
    if (category) {
      newFilters.categories = category.split(',').filter(Boolean);
    }
    if (brand) {
      newFilters.brands = brand.split(',').filter(Boolean);
    }
    if (gender) {
      newFilters.genders = gender.split(',').filter(Boolean);
    }
    if (size) {
      newFilters.sizes = size.split(',').filter(Boolean);
    }
    if (search) {
      setSearchQuery(search);
    }
    if (minPrice || maxPrice) {
      newFilters.priceRange = {
        min: minPrice || '',
        max: maxPrice || ''
      };
    }

    return newFilters;
  };

  // Функция для обновления URL
  const updateURL = (newFilters: FilterState, newSearchQuery?: string) => {
    const params = new URLSearchParams();

    // Добавляем активные фильтры в URL
    if (newFilters.categories.length > 0) {
      params.set('category', newFilters.categories.join(','));
    }
    if (newFilters.brands.length > 0) {
      params.set('brand', newFilters.brands.join(','));
    }
    if (newFilters.genders.length > 0) {
      params.set('gender', newFilters.genders.join(','));
    }
    if (newFilters.sizes.length > 0) {
      params.set('size', newFilters.sizes.join(','));
    }
    if (newFilters.priceRange.min) {
      params.set('minPrice', newFilters.priceRange.min);
    }
    if (newFilters.priceRange.max) {
      params.set('maxPrice', newFilters.priceRange.max);
    }
    if (newSearchQuery && newSearchQuery.trim()) {
      params.set('search', newSearchQuery.trim());
    }

    // Обновляем URL без перезагрузки страницы
    const newURL = `/catalog${params.toString() ? '?' + params.toString() : ''}`;
    router.replace(newURL, { scroll: false });
  };

  // ✅ ОБНОВЛЯЕМ ФУНКЦИЮ ГРУППИРОВКИ С ПЕРЕМЕШИВАНИЕМ
  const groupProductsByName = (products: Product[]): Product[] => {
    console.log('🔄 [CATALOG] Группируем товары по названию...');
    console.log('📊 [CATALOG] Исходное количество записей:', products.length);
    
    // Группируем по уникальной комбинации: бренд + название
    const grouped = products.reduce((acc, product) => {
      const key = `${product.brand.toLowerCase()}_${product.name.toLowerCase()}`;
      
      if (!acc[key]) {
        // Первый товар в группе
        acc[key] = {
          ...product,
          allSizes: [{ size: product.size, price: product.price }]
        };
      } else {
        // Добавляем размер к существующему товару
        acc[key].allSizes.push({ size: product.size, price: product.price });
        
        // Берем лучшее фото (самый длинный URL)
        if (product.photo && product.photo.length > acc[key].photo.length) {
          acc[key].photo = product.photo;
        }
      }
      
      return acc;
    }, {} as Record<string, Product & { allSizes: Array<{size: string, price: number}> }>);
    
    // Преобразуем в массив уникальных товаров
    const uniqueProducts = Object.values(grouped).map(product => {
      // Сортируем размеры
      const sortedSizes = (product.allSizes || []).sort((a, b) => {
        const aNum = parseFloat(a.size.replace(/[^\d.]/g, ''));
        const bNum = parseFloat(b.size.replace(/[^\d.]/g, ''));
        return aNum - bNum;
      });
      
      // Берем минимальный размер и цену для отображения
      const minSize = sortedSizes[0] || { size: product.size, price: product.price };
      
      return {
        id: product.id,
        article: product.article,
        brand: product.brand,
        name: product.name,
        size: minSize.size,
        category: product.category,
        gender: product.gender,
        price: minSize.price,
        photo: product.photo
      };
    });
    
    console.log('📊 [CATALOG] Уникальных товаров после группировки:', uniqueProducts.length);
    
    // ✅ ДОБАВЛЯЕМ ПЕРЕМЕШИВАНИЕ для разнообразия
    const shuffledProducts = shuffleArray(uniqueProducts);
    console.log('🎲 [CATALOG] Товары перемешаны для разнообразия');
    
    return shuffledProducts;
  };

  // ✅ ИСПРАВЛЕННАЯ ФУНКЦИЯ ЗАГРУЗКИ ТОВАРОВ
  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 [CATALOG] Загружаем товары через API...');
      
      const response = await fetch('/api/products', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log('📡 [CATALOG] Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // ✅ Обрабатываем JSON ответ от API
      const result = await response.json();
      console.log('📦 [CATALOG] API Result:', {
        success: result.success,
        count: result.count,
        dataLength: result.data?.length || 0
      });
      
      if (result.success && result.data) {
        // Обеспечиваем ID и базовые поля
        const productsWithId = result.data.map((product: any, index: number) => ({
          ...product,
          id: product.id || product.article || `product_${index}`,
          article: product.article || '',
          brand: product.brand || '',
          name: product.name || '',
          size: product.size || '',
          category: product.category || '',
          gender: product.gender || '',
          price: Number(product.price) || 0,
          photo: product.photo || ''
        }));
        
        // ✅ ГРУППИРУЕМ И ПЕРЕМЕШИВАЕМ ТОВАРЫ ПО НАЗВАНИЮ
        const groupedAndShuffledProducts = groupProductsByName(productsWithId);
        setProducts(groupedAndShuffledProducts);
        
        console.log('✅ [CATALOG] Финальное количество товаров в каталоге:', groupedAndShuffledProducts.length);
        
        // Показываем примеры
        if (groupedAndShuffledProducts.length > 0) {
          console.log('📋 [CATALOG] Примеры товаров в каталоге:');
          groupedAndShuffledProducts.slice(0, 3).forEach((p: any, i: number) => {
            console.log(`  ${i + 1}. ${p.brand} - ${p.name} (размер: ${p.size}, цена: ${p.price}₽)`);
          });
        }
        
      } else {
        console.error('❌ [CATALOG] API вернул ошибку:', result);
        throw new Error(result.error || 'API вернул пустые данные');
      }
      
    } catch (error) {
      console.error('❌ [CATALOG] Ошибка загрузки товаров:', error);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка товаров
  useEffect(() => {
    if (mounted) {
      fetchProducts();
    }
  }, [mounted]);

  // Обновление опций фильтров при загрузке товаров
  useEffect(() => {
    if (products.length > 0) {
      const brands = [...new Set(products.map(p => p.brand))].sort();
      const genders = [...new Set(products.map(p => p.gender))].sort();
      const categories = [...new Set(products.map(p => p.category))].sort();
      const sizes = [...new Set(products.map(p => p.size))].sort((a, b) => {
        const aNum = parseFloat(a.replace(/[^\d.]/g, ''));
        const bNum = parseFloat(b.replace(/[^\d.]/g, ''));
        return aNum - bNum;
      });

      setFilterOptions({ brands, genders, categories, sizes });
    }
  }, [products]);

  // Применение фильтров и обновление URL
  useEffect(() => {
    if (!isInitialLoad) {
      updateURL(filters, searchQuery);
      applyFilters();
      setCurrentPage(1); // Сбрасываем страницу при изменении фильтров
    }
  }, [filters, searchQuery, isInitialLoad]);

  // Применение фильтров к товарам
  useEffect(() => {
    applyFilters();
  }, [products, filters, searchQuery, sortBy]);

  // ✅ ОБНОВЛЯЕМ ФУНКЦИЮ ФИЛЬТРОВ С ПОДДЕРЖКОЙ СЛУЧАЙНОЙ СОРТИРОВКИ
  const applyFilters = () => {
    let filtered = [...products];

    // Поиск
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }

    // Фильтр по брендам
    if (filters.brands.length > 0) {
      filtered = filtered.filter(product =>
        filters.brands.includes(product.brand)
      );
    }

    // Фильтр по полу
    if (filters.genders.length > 0) {
      filtered = filtered.filter(product =>
        filters.genders.includes(product.gender)
      );
    }

    // Фильтр по категориям
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product =>
        filters.categories.includes(product.category)
      );
    }

    // Фильтр по размерам
    if (filters.sizes.length > 0) {
      filtered = filtered.filter(product =>
        filters.sizes.includes(product.size)
      );
    }

    // Фильтр по цене
    const minPrice = filters.priceRange.min ? parseFloat(filters.priceRange.min) : 0;
    const maxPrice = filters.priceRange.max ? parseFloat(filters.priceRange.max) : Infinity;
    
    if (minPrice > 0 || maxPrice < Infinity) {
      filtered = filtered.filter(product =>
        product.price >= minPrice && product.price <= maxPrice
      );
    }

    // ✅ ОБНОВЛЯЕМ СОРТИРОВКУ С ПОДДЕРЖКОЙ СЛУЧАЙНОГО ПОРЯДКА
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'random':
        // ✅ ДОБАВЛЯЕМ ОПЦИЮ: случайная сортировка
        filtered = shuffleArray(filtered);
        console.log('🎲 [CATALOG] Применена случайная сортировка');
        break;
      default:
        // popularity - оставляем перемешанный порядок из группировки
        break;
    }

    setFilteredProducts(filtered);
  };

  // Обработчики фильтров с обновлением URL
  const handleFilterChange = (filterType: keyof FilterState, value: string | string[] | { min: string; max: string }) => {
    setFilters(prev => {
      if (filterType === 'priceRange') {
        return { ...prev, priceRange: value as { min: string; max: string } };
      }
      
      if (Array.isArray(value)) {
        return { ...prev, [filterType]: value };
      }
      
      const currentValues = prev[filterType] as string[];
      const newValues = currentValues.includes(value as string)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value as string];
      
      return { ...prev, [filterType]: newValues };
    });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleRemoveFilter = (filterType: keyof FilterState, value?: string) => {
    setFilters(prev => {
      if (filterType === 'priceRange') {
        return { ...prev, priceRange: { min: '', max: '' } };
      }
      
      if (value) {
        const currentValues = prev[filterType] as string[];
        return { ...prev, [filterType]: currentValues.filter(v => v !== value) };
      }
      
      return { ...prev, [filterType]: [] };
    });
  };

  const clearFilters = () => {
    setFilters({
      brands: [],
      genders: [],
      categories: [],
      sizes: [],
      priceRange: { min: '', max: '' }
    });
    setSearchQuery('');
  };

  // Проверка наличия активных фильтров
  const hasActiveFilters = () => {
    return filters.brands.length > 0 ||
           filters.genders.length > 0 ||
           filters.categories.length > 0 ||
           filters.sizes.length > 0 ||
           filters.priceRange.min !== '' ||
           filters.priceRange.max !== '' ||
           searchQuery.trim() !== '';
  };

  // Пагинация
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!mounted) {
    return <CatalogLoading />;
  }

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-0">
      {/* Мобильные фильтры */}
      <MobileFilters
        filters={filters}
        filterOptions={filterOptions}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        totalResults={filteredProducts.length}
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Основной контент */}
      <div className="flex flex-col lg:flex-row">
        {/* Десктопные фильтры */}
        <DesktopFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          filters={filters}
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          totalResults={filteredProducts.length}
        />

        {/* Правая часть с товарами */}
        <div className="flex-1 catalog-content">
          <div className="p-5">
            {/* Мобильная кнопка фильтра */}
            <MobileFilterButton
              onClick={() => setIsMobileFiltersOpen(true)}
              totalResults={filteredProducts.length}
              hasActiveFilters={hasActiveFilters()}
              className="mb-6"
            />

            {/* Активные фильтры */}
            <ActiveFilters
              filters={filters}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={clearFilters}
            />

            {/* Сортировка */}
            <CatalogSort
              sortBy={sortBy}
              onChange={setSortBy}
            />

            {/* Сетка товаров */}
            <ProductGrid
              products={currentProducts}
              loading={loading}
              onClearFilters={clearFilters}
            />

            {/* Пагинация */}
            <CatalogPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Главный экспортируемый компонент с Suspense
export default function CatalogPage() {
  return (
    <Suspense fallback={<CatalogLoading />}>
      <CatalogContent />
    </Suspense>
  );
}