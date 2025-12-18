"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DesktopFilters from "../../components/Catalog/DesktopFilters";
import MobileFilters from "../../components/Catalog/MobileFilters";
import MobileFilterButton from "../../components/Catalog/MobileFilterButton";
import CatalogSearch from "../../components/Catalog/CatalogSearch";
import CatalogSort from "../../components/Catalog/CatalogSort";
import ProductGrid from "../../components/Catalog/ProductGrid";
import CatalogPagination from "../../components/Catalog/CatalogPagination";
import ActiveFilters from "../../components/Catalog/ActiveFilters";

import { fullyAutomaticSearch } from "@/utils/automaticSearch";
import { CatalogStateManager } from "@/utils/catalogStateManager";

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
  sizes?: string[];
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

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popularity");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isRestoringState, setIsRestoringState] = useState(true);

  // ✅ НОВЫЙ ref для отслеживания первичной инициализации
  const isInitialMount = useRef(true);
  const hasRestoredState = useRef(false);

  const [filters, setFilters] = useState<FilterState>({
    brands: [],
    genders: [],
    categories: [],
    sizes: [],
    priceRange: { min: "", max: "" },
  });

  const [filterOptions, setFilterOptions] = useState({
    brands: [] as string[],
    genders: [] as string[],
    categories: [] as string[],
    sizes: [] as string[],
  });

  const itemsPerPage = 20;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || hasRestoredState.current) return;

    const savedState = CatalogStateManager.getState();

    if (savedState) {
      hasRestoredState.current = true;
      setCurrentPage(savedState.page);

      // Восстанавливаем скролл после загрузки товаров
      const scrollTimeout = setTimeout(() => {
        CatalogStateManager.restoreScroll(savedState.scrollPosition);
        setIsRestoringState(false);
      }, 300);

      return () => clearTimeout(scrollTimeout);
    } else {
      setIsRestoringState(false);
    }
  }, [mounted, filteredProducts.length]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/products");
      const result = await response.json();

      if (response.ok && result.products) {
        const groupedProducts = groupProductsByName(result.products);
        setProducts(groupedProducts);
        updateFilterOptions(groupedProducts);
      } else {
        console.error("❌ [CATALOG] API вернул ошибку:", result);
        setProducts([]);
      }
    } catch (error) {
      console.error("❌ [CATALOG] Ошибка загрузки товаров:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const groupProductsByName = (products: Product[]): Product[] => {
    const grouped = products.reduce((acc, product) => {
      const key = `${product.brand.toLowerCase()}_${product.name.toLowerCase()}`;

      if (!acc[key]) {
        acc[key] = {
          ...product,
          allSizes:
            product.sizes && product.sizes.length > 0
              ? product.sizes.map((size) => ({ size, price: product.price }))
              : [{ size: product.size, price: product.price }],
        };
      } else {
        const newSizes =
          product.sizes && product.sizes.length > 0
            ? product.sizes.map((size) => ({ size, price: product.price }))
            : [{ size: product.size, price: product.price }];

        acc[key].allSizes = [...(acc[key].allSizes || []), ...newSizes];

        if (
          product.photo &&
          product.photo.length > (acc[key].photo?.length || 0)
        ) {
          acc[key].photo = product.photo;
        }
      }

      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped);
  };

  const updateFilterOptions = (products: Product[]) => {
    if (products.length > 0) {
      const brands = [...new Set(products.map((p) => p.brand))].sort();
      const genders = [...new Set(products.map((p) => p.gender))].sort();
      const categories = [...new Set(products.map((p) => p.category))].sort();

      const allSizes = new Set<string>();
      products.forEach((product) => {
        if (product.sizes && product.sizes.length > 0) {
          product.sizes.forEach((size) => allSizes.add(size));
        } else if (product.size) {
          allSizes.add(product.size);
        }
      });

      const sizes = Array.from(allSizes).sort((a, b) => {
        const aNum = parseFloat(a.replace(/[^\d.]/g, ""));
        const bNum = parseFloat(b.replace(/[^\d.]/g, ""));
        return aNum - bNum;
      });

      setFilterOptions({ brands, genders, categories, sizes });
    }
  };

  useEffect(() => {
    if (!mounted) return;

    const urlBrands = searchParams.get("brands")?.split(",") || [];
    const urlGenders = searchParams.get("genders")?.split(",") || [];
    const urlCategories = searchParams.get("categories")?.split(",") || [];
    const urlSizes = searchParams.get("sizes")?.split(",") || [];
    const urlMinPrice = searchParams.get("minPrice") || "";
    const urlMaxPrice = searchParams.get("maxPrice") || "";
    const urlSearch = searchParams.get("search") || "";
    const urlSort = searchParams.get("sort") || "popularity";

    setFilters({
      brands: urlBrands.filter(Boolean),
      genders: urlGenders.filter(Boolean),
      categories: urlCategories.filter(Boolean),
      sizes: urlSizes.filter(Boolean),
      priceRange: { min: urlMinPrice, max: urlMaxPrice },
    });

    setSearchQuery(urlSearch);
    setSortBy(urlSort);
  }, [mounted, searchParams]);

  useEffect(() => {
    if (mounted) {
      fetchProducts();
    }
  }, [mounted]);

  useEffect(() => {
    if (!isRestoringState && mounted && currentPage > 0) {
      const currentFilters = window.location.search;
      CatalogStateManager.saveState(currentPage, currentFilters);
    }
  }, [currentPage, isRestoringState, mounted]);

  // ✅ СОХРАНЕНИЕ при скролле (с дебаунсом)
  useEffect(() => {
    if (isRestoringState || !mounted) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (!isRestoringState && currentPage > 0) {
          const currentFilters = window.location.search;
          CatalogStateManager.saveState(currentPage, currentFilters);
        }
      }, 500);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [currentPage, isRestoringState, mounted]);

  const updateURL = (
    newFilters: FilterState,
    newSearchQuery: string,
    newSortBy: string
  ) => {
    const params = new URLSearchParams();

    if (newFilters.brands.length > 0)
      params.set("brands", newFilters.brands.join(","));
    if (newFilters.genders.length > 0)
      params.set("genders", newFilters.genders.join(","));
    if (newFilters.categories.length > 0)
      params.set("categories", newFilters.categories.join(","));
    if (newFilters.sizes.length > 0)
      params.set("sizes", newFilters.sizes.join(","));
    if (newFilters.priceRange.min)
      params.set("minPrice", newFilters.priceRange.min);
    if (newFilters.priceRange.max)
      params.set("maxPrice", newFilters.priceRange.max);
    if (newSearchQuery.trim()) params.set("search", newSearchQuery.trim());
    if (newSortBy !== "popularity") params.set("sort", newSortBy);

    const newURL = `/catalog${
      params.toString() ? "?" + params.toString() : ""
    }`;
    router.replace(newURL, { scroll: false });
  };

  // 🎲 Добавляем ref для сохранения случайного порядка
  const randomOrderRef = useRef<Product[]>([]);
  const lastRandomSeedRef = useRef<number>(Date.now());

  const applyFilters = () => {
    let filtered = [...products];

    if (searchQuery.trim()) {
      filtered = fullyAutomaticSearch(products, searchQuery);
    }

    if (filters.brands.length > 0) {
      filtered = filtered.filter((product) =>
        filters.brands.includes(product.brand)
      );
    }

    if (filters.genders.length > 0) {
      filtered = filtered.filter((product) =>
        filters.genders.includes(product.gender)
      );
    }

    if (filters.categories.length > 0) {
      filtered = filtered.filter((product) =>
        filters.categories.includes(product.category)
      );
    }

    if (filters.sizes.length > 0) {
      filtered = filtered.filter(
        (product) =>
          product.sizes?.some((size) => filters.sizes.includes(size)) ||
          (product.size && filters.sizes.includes(product.size))
      );
    }

    const minPrice = filters.priceRange.min
      ? parseFloat(filters.priceRange.min)
      : 0;
    const maxPrice = filters.priceRange.max
      ? parseFloat(filters.priceRange.max)
      : Infinity;

    filtered = filtered.filter(
      (product) => product.price >= minPrice && product.price <= maxPrice
    );

    // 🎲 ОБНОВЛЕННАЯ ЛОГИКА СОРТИРОВКИ с поддержкой random
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "random":
          // Используем стабильную случайную сортировку
          // Создаем хеш на основе ID товаров и seed
          const hashA = (a.id?.charCodeAt(0) || 0) * lastRandomSeedRef.current;
          const hashB = (b.id?.charCodeAt(0) || 0) * lastRandomSeedRef.current;
          return hashA - hashB;

        case "price-asc":
          return a.price - b.price;

        case "price-desc":
          return b.price - a.price;

        case "newest":
          return (
            new Date(b.id || "").getTime() - new Date(a.id || "").getTime()
          );

        case "name":
          return a.name.localeCompare(b.name);

        case "popularity":
        default:
          return 0;
      }
    });

    // 🎲 Дополнительная рандомизация для режима random
    if (sortBy === "random") {
      filtered = [...filtered].sort(() => Math.random() - 0.5);
    }

    setFilteredProducts(filtered);
  };

  // 🎲 Обновляем seed при изменении sortBy на random
  useEffect(() => {
    if (sortBy === "random") {
      lastRandomSeedRef.current = Date.now();
    }
  }, [sortBy]);

  useEffect(() => {
    applyFilters();
  }, [products, filters, searchQuery, sortBy]);

  useEffect(() => {
    if (!mounted || isRestoringState) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Только при РЕАЛЬНОМ изменении фильтров пользователем
    updateURL(filters, searchQuery, sortBy);
    setCurrentPage(1);
    CatalogStateManager.clearState();
  }, [filters, searchQuery, sortBy]);

  const handleFilterChange = (
    filterType: keyof FilterState,
    value: string | string[] | { min: string; max: string }
  ) => {
    setFilters((prev) => {
      if (filterType === "priceRange") {
        return { ...prev, priceRange: value as { min: string; max: string } };
      }

      if (Array.isArray(value)) {
        return { ...prev, [filterType]: value };
      }

      const currentValues = prev[filterType] as string[];
      const newValues = currentValues.includes(value as string)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value as string];

      return { ...prev, [filterType]: newValues };
    });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleRemoveFilter = (
    filterType: keyof FilterState,
    value?: string
  ) => {
    setFilters((prev) => {
      if (filterType === "priceRange") {
        return { ...prev, priceRange: { min: "", max: "" } };
      }

      if (value) {
        const currentValues = prev[filterType] as string[];
        return {
          ...prev,
          [filterType]: currentValues.filter((v) => v !== value),
        };
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
      priceRange: { min: "", max: "" },
    });
    setSearchQuery("");
    CatalogStateManager.clearState();
  };

  const hasActiveFilters = () => {
    return (
      filters.brands.length > 0 ||
      filters.genders.length > 0 ||
      filters.categories.length > 0 ||
      filters.sizes.length > 0 ||
      filters.priceRange.min !== "" ||
      filters.priceRange.max !== "" ||
      searchQuery.trim() !== ""
    );
  };

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!mounted) {
    return <CatalogLoading />;
  }

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-0">
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

      <div className="flex flex-col lg:flex-row">
        <DesktopFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          filters={filters}
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          totalResults={filteredProducts.length}
        />

        <div className="flex-1 catalog-content">
          <div className="p-5">
            <div className="lg:hidden mb-5">
              <MobileFilterButton
                onOpenFilters={() => setIsMobileFiltersOpen(true)}
                totalResults={filteredProducts.length}
                hasActiveFilters={hasActiveFilters()}
              />
            </div>

            <ActiveFilters
              filters={filters}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={clearFilters}
              className="mb-5"
            />

            <div className="hidden lg:block mb-5">
              <CatalogSort
                sortBy={sortBy}
                onSortChange={setSortBy}
                totalResults={filteredProducts.length}
              />
            </div>

            <ProductGrid
              products={currentProducts}
              loading={loading}
              onClearFilters={hasActiveFilters() ? clearFilters : undefined}
            />

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

export default function CatalogPage() {
  return (
    <Suspense fallback={<CatalogLoading />}>
      <CatalogContent />
    </Suspense>
  );
}
