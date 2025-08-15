import { useState, useEffect } from 'react';

interface FilterOption {
  id: number;
  name: string;
  slug: string;
}

interface CatalogFilters {
  brands: FilterOption[];
  categories: FilterOption[];
  sizes: FilterOption[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useCatalogFilters = (): CatalogFilters => {
  const [brands, setBrands] = useState<FilterOption[]>([]);
  const [categories, setCategories] = useState<FilterOption[]>([]);
  const [sizes, setSizes] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFilters = async () => {
    try {
      setLoading(true);
      setError(null);

      const [brandsRes, categoriesRes, sizesRes] = await Promise.all([
        fetch('/api/brands'),
        fetch('/api/categories'),
        fetch('/api/sizes')
      ]);

      const brandsData = brandsRes.ok ? await brandsRes.json() : { brands: [] };
      const categoriesData = categoriesRes.ok ? await categoriesRes.json() : { categories: [] };
      const sizesData = sizesRes.ok ? await sizesRes.json() : { sizes: [] };

      setBrands(brandsData.brands || []);
      setCategories(categoriesData.categories || []);
      setSizes(sizesData.sizes || []);

      if (!brandsRes.ok) console.warn('⚠️ Ошибка загрузки брендов:', brandsRes.status);
      if (!categoriesRes.ok) console.warn('⚠️ Ошибка загрузки категорий:', categoriesRes.status);
      if (!sizesRes.ok) console.warn('⚠️ Ошибка загрузки размеров:', sizesRes.status);

    } catch (err) {
      console.error('❌ Ошибка загрузки фильтров:', err);
      setError(err instanceof Error ? err.message : 'Ошибка загрузки фильтров');
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await loadFilters();
  };

  useEffect(() => {
    loadFilters();
  }, []);

  return {
    brands,
    categories,
    sizes,
    loading,
    error,
    refetch
  };
};