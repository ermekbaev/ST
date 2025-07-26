// src/app/catalog/page.tsx
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
  sizes?: string[]; // Новое поле для массива размеров
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
  
  // Состояние фильтров
  const [filters, setFilters] = useState<FilterState>({
    brands: [],
    genders: [],
    categories: [],
    sizes: [],
    priceRange: { min: '', max: '' }
  });

  // Опции фильтров (fallback для старых данных)
  const [filterOptions, setFilterOptions] = useState({
    brands: [] as string[],
    genders: [] as string[],
    categories: [] as string[],
    sizes: [] as string[]
  });

  const itemsPerPage = 20;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Загрузка товаров из Strapi
  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('🔄 [CATALOG] Загружаем товары из Strapi...');
      
      const response = await fetch('/api/products');
      const result = await response.json();
      
      if (response.ok && result.products) {
        console.log(`✅ [CATALOG] Загружено ${result.products.length} товаров из Strapi`);
        
        // Группируем товары по названию (объединяем разные размеры)
        const groupedProducts = groupProductsByName(result.products);
        
        setProducts(groupedProducts);
        console.log(`📊 [CATALOG] После группировки: ${groupedProducts.length} уникальных товаров`);
        
        // Обновляем опции фильтров из загруженных товаров (fallback)
        updateFilterOptions(groupedProducts);
        
      } else {
        console.error('❌ [CATALOG] API вернул ошибку:', result);
        setProducts([]);
      }
      
    } catch (error) {
      console.error('❌ [CATALOG] Ошибка загрузки товаров:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Группировка товаров по названию
  const groupProductsByName = (products: Product[]): Product[] => {
    console.log('🔄 [CATALOG] Группируем товары по названию...');
    
    const grouped = products.reduce((acc, product) => {
      const key = `${product.brand.toLowerCase()}_${product.name.toLowerCase()}`;
      
      if (!acc[key]) {
        // Первый товар в группе
        acc[key] = {
          ...product,
          allSizes: product.sizes?.length > 0 
            ? product.sizes.map(size => ({ size, price: product.price }))
            : product.size 
            ? [{ size: product.size, price: product.price }]
            : []
        };
      } else {
        // Добавляем размеры к существующему товару
        const newSizes = product.sizes?.length > 0 
          ? product.sizes.map(size => ({ size, price: product.price }))
          : product.size 
          ? [{ size: product.size, price: product.price }]
          : [];
          
        acc[key].allSizes = [...(acc[key].allSizes || []), ...newSizes];
        
        // Берем лучшее фото (самый длинный URL)
        if (product.photo && product.photo.length > (acc[key].photo?.length || 0)) {
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
      
      // Обновляем данные товара
      return {
        ...product,
        sizes: sortedSizes.map(s => s.size),
        size: sortedSizes.length > 0 ? sortedSizes[0].size : '',
        price: sortedSizes.length > 0 ? sortedSizes[0].price : product.price,
        allSizes: undefined // Удаляем временное поле
      };
    });
    
    console.log(`📊 [CATALOG] Группировка завершена: ${uniqueProducts.length} уникальных товаров`);
    return uniqueProducts;
  };

  // Обновление опций фильтров из товаров (fallback)
  const updateFilterOptions = (products: Product[]) => {
    if (products.length > 0) {
      const brands = [...new Set(products.map(p => p.brand))].sort();
      const genders = [...new Set(products.map(p => p.gender))].sort();
      const categories = [...new Set(products.map(p => p.category))].sort();
      
      // Собираем все размеры из товаров
      const allSizes = new Set<string>();
      products.forEach(product => {
        if (product.sizes && product.sizes.length > 0) {
          product.sizes.forEach(size => allSizes.add(size));
        } else if (product.size) {
          allSizes.add(product.size);
        }
      });
      
      const sizes = Array.from(allSizes).sort((a, b) => {
        const aNum = parseFloat(a.replace(/[^\d.]/g, ''));
        const bNum = parseFloat(b.replace(/[^\d.]/g, ''));
        return aNum - bNum;
      });

      setFilterOptions({ brands, genders, categories, sizes });
      console.log('📊 [CATALOG] Опции фильтров обновлены:', { brands: brands.length, categories: categories.length, sizes: sizes.length });
    }
  };

  // Инициализация фильтров из URL
  useEffect(() => {
    if (!mounted) return;

    const urlBrands = searchParams.get('brands')?.split(',') || [];
    const urlGenders = searchParams.get('genders')?.split(',') || [];
    const urlCategories = searchParams.get('categories')?.split(',') || [];
    const urlSizes = searchParams.get('sizes')?.split(',') || [];
    const urlMinPrice = searchParams.get('minPrice') || '';
    const urlMaxPrice = searchParams.get('maxPrice') || '';
    const urlSearch = searchParams.get('search') || '';
    const urlSort = searchParams.get('sort') || 'popularity';

    setFilters({
      brands: urlBrands.filter(Boolean),
      genders: urlGenders.filter(Boolean),
      categories: urlCategories.filter(Boolean),
      sizes: urlSizes.filter(Boolean),
      priceRange: { min: urlMinPrice, max: urlMaxPrice }
    });
    
    setSearchQuery(urlSearch);
    setSortBy(urlSort);
  }, [mounted, searchParams]);

  // Загрузка товаров при монтировании
  useEffect(() => {
    if (mounted) {
      fetchProducts();
    }
  }, [mounted]);

  // Обновление URL при изменении фильтров
  const updateURL = (newFilters: FilterState, newSearchQuery: string, newSortBy: string) => {
    const params = new URLSearchParams();

    if (newFilters.brands.length > 0) params.set('brands', newFilters.brands.join(','));
    if (newFilters.genders.length > 0) params.set('genders', newFilters.genders.join(','));
    if (newFilters.categories.length > 0) params.set('categories', newFilters.categories.join(','));
    if (newFilters.sizes.length > 0) params.set('sizes', newFilters.sizes.join(','));
    if (newFilters.priceRange.min) params.set('minPrice', newFilters.priceRange.min);
    if (newFilters.priceRange.max) params.set('maxPrice', newFilters.priceRange.max);
    if (newSearchQuery.trim()) params.set('search', newSearchQuery.trim());
    if (newSortBy !== 'popularity') params.set('sort', newSortBy);

    const newURL = `/catalog${params.toString() ? '?' + params.toString() : ''}`;
    router.replace(newURL, { scroll: false });
  };

  // Применение фильтров
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
        product.sizes?.some(size => filters.sizes.includes(size)) ||
        (product.size && filters.sizes.includes(product.size))
      );
    }

    // Фильтр по цене
    const minPrice = filters.priceRange.min ? parseFloat(filters.priceRange.min) : 0;
    const maxPrice = filters.priceRange.max ? parseFloat(filters.priceRange.max) : Infinity;
    
    filtered = filtered.filter(product =>
      product.price >= minPrice && product.price <= maxPrice
    );

    // Сортировка
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
          return new Date(b.id || '').getTime() - new Date(a.id || '').getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'popularity':
        default:
          return 0; // Оставляем оригинальный порядок
      }
    });

    setFilteredProducts(filtered);
    console.log(`🔍 [CATALOG] Применены фильтры: ${filtered.length} товаров`);
  };

  // Применение фильтров при изменении
  useEffect(() => {
    applyFilters();
  }, [products, filters, searchQuery, sortBy]);

  // Обновление URL при изменении фильтров
  useEffect(() => {
    if (mounted) {
      updateURL(filters, searchQuery, sortBy);
      setCurrentPage(1); // Сбрасываем страницу при изменении фильтров
    }
  }, [filters, searchQuery, sortBy, mounted]);

  // Обработчики
  const handleFilterChange = (filterType: keyof FilterState, value: string | string[] | { min: string; max: string }) => {
    setFilters(prev => {
      if (filterType === 'priceRange') {
        return { ...prev, priceRange: value as { min: string; max: string } };
      }
      
      // Если передан массив, используем его напрямую
      if (Array.isArray(value)) {
        return { ...prev, [filterType]: value };
      }
      
      // Иначе переключаем значение в массиве
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
            <div className="lg:hidden mb-5">
              <MobileFilterButton
                onOpenFilters={() => setIsMobileFiltersOpen(true)}
                totalResults={filteredProducts.length}
                hasActiveFilters={hasActiveFilters()}
              />
            </div>

            {/* Активные фильтры */}
            <ActiveFilters
              filters={filters}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={clearFilters}
              className="mb-5"
            />

            {/* Сортировка для десктопа */}
            <div className="hidden lg:block mb-5">
              <CatalogSort
                sortBy={sortBy}
                onSortChange={setSortBy}
                totalResults={filteredProducts.length}
              />
            </div>

            {/* Сетка товаров */}
            <ProductGrid
              products={currentProducts}
              loading={loading}
              onClearFilters={hasActiveFilters() ? clearFilters : undefined}
            />

            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="mt-8">
                <CatalogPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Основной экспорт с Suspense
export default function CatalogPage() {
  return (
    <Suspense fallback={<CatalogLoading />}>
      <CatalogContent />
    </Suspense>
  );
}