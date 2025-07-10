// src/app/catalog/page.tsx
'use client'

import React, { useState, useEffect } from 'react';
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

const CatalogPage: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
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

  // Применение фильтров
  useEffect(() => {
    let filtered = [...products];

    // Поиск по названию
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Фильтр по брендам
    if (filters.brands.length > 0) {
      filtered = filtered.filter(product => filters.brands.includes(product.brand));
    }

    // Фильтр по полу
    if (filters.genders.length > 0) {
      filtered = filtered.filter(product => filters.genders.includes(product.gender));
    }

    // Фильтр по категориям
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product => filters.categories.includes(product.category));
    }

    // Фильтр по размерам
    if (filters.sizes.length > 0) {
      filtered = filtered.filter(product => filters.sizes.includes(product.size));
    }

    // Фильтр по цене
    if (filters.priceRange.min || filters.priceRange.max) {
      const min = parseFloat(filters.priceRange.min) || 0;
      const max = parseFloat(filters.priceRange.max) || Infinity;
      filtered = filtered.filter(product => product.price >= min && product.price <= max);
    }

    // Сортировка
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // popularity
        // Оставляем порядок как есть
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Сбрасываем на первую страницу при изменении фильтров
  }, [products, searchQuery, filters, sortBy]);

const fetchProducts = async () => {
  try {
    setLoading(true);    
    const response = await fetch('/api/products');
    const result = await response.json();
    
    if (result.success) {
      // Перемешиваем товары только для каталога
      //@ts-ignore
      const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      };
      
      const shuffledProducts = shuffleArray(result.data || []);
      setProducts(shuffledProducts);
      console.log('🎲 Товары перемешаны для каталога');
    } else {
      throw new Error(result.error || 'Ошибка загрузки данных');
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
    console.error('Ошибка загрузки товаров:', errorMessage);
  } finally {
    setLoading(false);
  }
};

  // Обработчики фильтров
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
    return (
      <div className="min-h-screen bg-white">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
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
          onSearchChange={setSearchQuery}
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
};

export default CatalogPage;