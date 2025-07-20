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
    const sale = searchParams.get('sale');

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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const csvText = await response.text();
      const rows = csvText.split('\n').slice(1); // Пропускаем заголовок
      
      const parsedProducts: Product[] = [];
      
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue;
        
        try {
          const values = parseCSVLine(row);
          
          if (values.length >= 8) {
            const photoField = values[8] || '';
            const firstPhoto = extractFirstPhoto(photoField);
            
            const product: Product = {
              article: values[0] || '',
              brand: values[1] || '',
              name: values[2] || '',
              size: values[3] || '',
              category: values[4] || '',
              gender: values[5] || '',
              price: parseFloat(values[6]) || 0,
              photo: firstPhoto
            };
            
            if (product.name && product.price > 0) {
              parsedProducts.push(product);
            }
          }
        } catch (error) {
          console.warn(`Ошибка парсинга строки ${i + 1}:`, error);
        }
      }
      
      setProducts(parsedProducts);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseCSVLine = (line: string): string[] => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  };

  const extractFirstPhoto = (photoField: string): string => {
    if (!photoField) return '';
    
    const urls = photoField
      .split(',')
      .map(url => url.trim().replace(/^["']|["']$/g, ''))
      .filter(url => url.length > 0);
    
    return urls[0] || '';
  };

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

    // Сортировка
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
      default:
        // popularity - без сортировки (естественный порядок)
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