'use client';

import { useState, useEffect, useMemo } from 'react';
import { FilterState, FilterOptions, Product } from '../components/Catalog';

interface UseCatalogProps {
  itemsPerPage?: number;
}

interface UseCatalogReturn {
  products: Product[];
  filteredProducts: Product[];
  currentProducts: Product[];
  loading: boolean;
  error: string | null;
  
  filters: FilterState;
  filterOptions: FilterOptions;
  searchQuery: string;
  sortBy: string;
  
  currentPage: number;
  totalPages: number;
  
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: string) => void;
  setCurrentPage: (page: number) => void;
  handleFilterChange: (filterType: keyof FilterState, value: string | string[] | { min: string; max: string }) => void;
  handleRemoveFilter: (filterType: keyof FilterState, value?: string) => void;
  clearFilters: () => void;
  fetchProducts: () => Promise<void>;
}

export const useCatalog = ({ itemsPerPage = 20 }: UseCatalogProps = {}): UseCatalogReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    brands: [],
    genders: [],
    categories: [],
    sizes: [],
    priceRange: { min: '', max: '' }
  });

  const filterOptions = useMemo(() => {
    if (products.length === 0) {
      return { brands: [], genders: [], categories: [], sizes: [] };
    }

    const brands = [...new Set(products.map(p => p.brand))].sort();
    const genders = [...new Set(products.map(p => p.gender))].sort();
    const categories = [...new Set(products.map(p => p.category))].sort();
    const sizes = [...new Set(products.map(p => p.size))].sort((a, b) => {
      const aNum = parseFloat(a.replace(/[^\d.]/g, ''));
      const bNum = parseFloat(b.replace(/[^\d.]/g, ''));
      return aNum - bNum;
    });

    return { brands, genders, categories, sizes };
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.brands.length > 0) {
      filtered = filtered.filter(product => filters.brands.includes(product.brand));
    }

    if (filters.genders.length > 0) {
      filtered = filtered.filter(product => filters.genders.includes(product.gender));
    }

    if (filters.categories.length > 0) {
      filtered = filtered.filter(product => filters.categories.includes(product.category));
    }

    if (filters.sizes.length > 0) {
      filtered = filtered.filter(product => filters.sizes.includes(product.size));
    }

    if (filters.priceRange.min || filters.priceRange.max) {
      const min = parseFloat(filters.priceRange.min) || 0;
      const max = parseFloat(filters.priceRange.max) || Infinity;
      filtered = filtered.filter(product => product.price >= min && product.price <= max);
    }

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
      case 'newest':
        filtered.reverse();
        break;
      default: 
        break;
    }

    return filtered;
  }, [products, searchQuery, filters, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/products');
      const result = await response.json();
      
      if (result.success) {
        setProducts(result.data || []);
      } else {
        throw new Error(result.error || 'Ошибка загрузки данных');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      console.error('Ошибка загрузки товаров:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (
    filterType: keyof FilterState, 
    value: string | string[] | { min: string; max: string }
  ) => {
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
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    filteredProducts,
    currentProducts,
    loading,
    error,
    
    filters,
    filterOptions,
    searchQuery,
    sortBy,
    
    currentPage,
    totalPages,
    
    setSearchQuery,
    setSortBy,
    setCurrentPage,
    handleFilterChange,
    handleRemoveFilter,
    clearFilters,
    fetchProducts,
  };
};