"use client";
import React, { useState, useEffect } from "react";
import HeroSlider from "../components/Hero/HeroSlider";
import ProductCard from "../components/Product/ProductCard";
import HowItWorksModal from "../components/UI/Modal/HowItWorksModal";
import CustomOrderSection from "@/components/CustomOrder/CustomOrderSection";
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
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    CatalogStateManager.clearState();
  }, []);

  // 🎲 Функция для получения СЛУЧАЙНЫХ товаров
  const getRandomProducts = (
    products: Product[],
    count: number = 4
  ): Product[] => {
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  // 🎲 Функция для получения СЛУЧАЙНЫХ товаров из категории
  const getRandomProductsFromCategory = (
    categoryFilter: string[],
    count: number = 4
  ) => {
    const filteredProducts = products.filter((product) =>
      categoryFilter.some((filter) =>
        product.category.toLowerCase().includes(filter.toLowerCase())
      )
    );

    const uniqueProducts = filteredProducts.filter(
      (product, index, self) =>
        index === self.findIndex((p) => p.name === product.name)
    );

    // Возвращаем случайные товары вместо последних
    return getRandomProducts(uniqueProducts, count);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/products");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.products && Array.isArray(result.products)) {
        setProducts(result.products);
      } else {
        if (result.success && Array.isArray(result.data)) {
          setProducts(result.data);
        } else {
          console.warn("⚠️ Неожиданный формат ответа:", result);
          setProducts([]);
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Неизвестная ошибка";
      setError(errorMessage);
      console.error("❌ Ошибка загрузки товаров на главной:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchProducts();
    }
  }, [mounted, retryCount]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const LoadingSkeleton = () => (
    <>
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6 lg:mb-8">
          <div className="h-8 lg:h-12 bg-gray-200 rounded w-32 lg:w-40 animate-pulse"></div>
          <div className="h-6 lg:h-8 bg-gray-200 rounded w-20 lg:w-24 animate-pulse"></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="bg-white w-full">
              <div className="w-full h-[150px] lg:h-[200px] bg-gray-200 animate-pulse rounded"></div>
              <div className="w-full h-px bg-gray-200 animate-pulse"></div>
              <div className="py-2 space-y-2">
                <div className="h-5 lg:h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 lg:h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300"></div>
      </div>
    </>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <HeroSlider />
        <div className="w-full px-5 py-12">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  const ProductSection = ({
    title,
    categoryFilters,
    linkText = "все модели",
    catalogFilters,
  }: {
    title: string;
    categoryFilters: string[];
    linkText?: string;
    catalogFilters?: string[];
  }) => {
    // 🎲 Получаем СЛУЧАЙНЫЕ товары при каждом рендере
    const displayProducts = getRandomProductsFromCategory(categoryFilters, 4);

    const getCatalogUrl = () => {
      if (catalogFilters && catalogFilters.length > 0) {
        const filterParam = catalogFilters.join(",");
        return `/catalog?categories=${encodeURIComponent(filterParam)}`;
      }
      return "/catalog";
    };

    const handleCatalogLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      CatalogStateManager.clearState();
    };

    return (
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6 lg:mb-8">
          <h2 className="section-title text-[22px] lg:text-[35px] text-black">
            {title}
          </h2>
          <a
            href={getCatalogUrl()}
            onClick={handleCatalogLinkClick}
            className="text-black text-[16px] lg:text-[20px] hover:text-gray-600 transition-colors flex items-center gap-2 font-product"
          >
            <span className="hidden lg:inline">{linkText}</span>
            <img
              src="/utils/Vector3.svg"
              alt=""
              className="hidden lg:block w-3 h-3 lg:w-4 lg:h-4"
            />
            <img
              src="/utils/arrow_right.svg"
              alt=""
              className="lg:hidden w-4 h-4"
            />
          </a>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {displayProducts.length > 0
            ? displayProducts.map((product, index) => (
                <ProductCard key={`${product.id}-${index}`} product={product} />
              ))
            : !error &&
              Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="bg-white w-full">
                  <div className="w-full h-[150px] lg:h-[200px] bg-gray-50 flex items-center justify-center">
                    <span className="text-gray-400 text-sm font-product">
                      Скоро товары
                    </span>
                  </div>
                  <div className="w-full h-px bg-brand-dark"></div>
                  <div className="py-2">
                    <div className="h-[22px] bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-[20px] bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <HeroSlider />

      <div className="w-full px-5 py-12">
        {error && products.length === 0 && (
          <div className="text-center p-8 mb-8 bg-red-50 rounded-lg border-2 border-red-200">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-bold text-red-800 mb-2 font-product">
                Не удалось загрузить каталог
              </h3>
              <p className="text-red-600 mb-4 font-product text-sm">
                Возможно, проблема с подключением к интернету или наш сервер
                временно недоступен.
              </p>
              <button
                onClick={() => setRetryCount((prev) => prev + 1)}
                className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-product text-sm"
                disabled={loading}
              >
                {loading ? "Загружаем..." : "Попробовать снова"}
              </button>
              <p className="text-red-500 text-xs mt-2 font-product">
                Попытка {retryCount + 1}
              </p>
            </div>
          </div>
        )}

        {error && products.length > 0 && (
          <div className="text-center p-4 mb-8 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-yellow-800 font-product text-sm">
              ⚠️ Каталог может быть не полным. Показываем сохраненные данные.
            </p>
            <button
              onClick={() => setRetryCount((prev) => prev + 1)}
              className="text-yellow-600 hover:text-yellow-800 underline font-product text-sm ml-2"
              disabled={loading}
            >
              {loading ? "Обновляем..." : "Обновить каталог"}
            </button>
          </div>
        )}

        {/* 🎲 Все секции теперь показывают СЛУЧАЙНЫЕ товары */}
        <ProductSection
          title="ОБУВЬ"
          categoryFilters={[
            "кроссовки",
            "кеды",
            "ботинки",
            "обувь",
            "угги",
            "слэды",
          ]}
          catalogFilters={["Кроссовки и кеды", "Ботинки и угги"]}
        />

        <ProductSection
          title="ОДЕЖДА"
          categoryFilters={[
            "толстовки",
            "свитшоты",
            "футболки",
            "одежда",
            "куртки",
            "штаны",
            "шорты",
          ]}
          catalogFilters={[
            "Толстовки и свитшоты",
            "Футболки и поло",
            "Пуховики и куртки",
            "Штаны и брюки",
            "Шорты",
          ]}
        />

        <ProductSection
          title="АКСЕССУАРЫ"
          categoryFilters={[
            "аксессуары",
            "сумки",
            "рюкзаки",
            "головные",
            "очки",
            "кошельки",
            "белье",
          ]}
          catalogFilters={[
            "Аксессуары",
            "Сумки и рюкзаки",
            "Головные уборы",
            "Белье",
          ]}
        />

        <ProductSection
          title="КОЛЛЕКЦИИ"
          categoryFilters={[
            "коллекции",
            "коллекция",
            "фигурки",
            "интерьера",
            "предметы интерьера",
            "другое всё",
          ]}
          catalogFilters={["Коллекция"]}
        />
      </div>

      <CustomOrderSection
        onHowItWorksClick={() => {
          if (mounted) {
            setIsModalOpen(true);
          }
        }}
      />

      {mounted && (
        <HowItWorksModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
