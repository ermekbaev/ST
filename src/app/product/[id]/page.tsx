'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../../../contexts/CartContext';
import Breadcrumbs from '../../../components/UI/Breadcrumbs/Breadcrumbs';
import ProductGallery, { GalleryImage } from '../../../components/Product/Gallery/ProductGallery';
import ProductInfo, { ProductInfo as ProductInfoType, ProductSize } from '../../../components/Product/Info/ProductInfo';
import CustomOrderSection from '../../../components/CustomOrder/CustomOrderSection';
import HowItWorksModal from '../../../components/UI/Modal/HowItWorksModal';
import DeliveryPaymentSection from '@/components/Product/Sections/DeliveryPaymentSection';
import ProductActions from '@/components/Product/Sections/ProductActions';

interface ProductPageProps {
  params: {
    id: string;
  };
}

// Моковые данные для fallback
const mockImages: GalleryImage[] = [
  {
    id: '1',
    url: 'https://via.placeholder.com/800x600/E5DDD4/8C8072?text=Photo+1',
    alt: 'Товар - основное фото'
  },
  {
    id: '2', 
    url: 'https://via.placeholder.com/800x600/E5DDD4/8C8072?text=Photo+2',
    alt: 'Товар - вид сбоку'
  },
  {
    id: '3',
    url: 'https://via.placeholder.com/800x600/E5DDD4/8C8072?text=Photo+3', 
    alt: 'Товар - вид сзади'
  },
  {
    id: '4',
    url: 'https://via.placeholder.com/800x600/E5DDD4/8C8072?text=Photo+4',
    alt: 'Товар - подошва'
  }
];

export default function ProductPage({ params }: ProductPageProps) {
  const [mounted, setMounted] = useState(false);
  const [product, setProduct] = useState<ProductInfoType | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Загрузка данных товара
  useEffect(() => {
    if (mounted) {
      const loadProduct = async () => {
        try {
          setLoading(true);
          
          // Реальный API запрос
          const response = await fetch(`/api/products/${params.id}`);
          const result = await response.json();
          
          if (result.success && result.data) {
            // Преобразуем данные в нужный формат
            const productData: ProductInfoType = {
              id: result.data.id,
              name: result.data.name,
              brand: result.data.brand,
              price: result.data.sizes[0]?.price || 0, // Базовая цена из первого размера
              category: result.data.category,
              article: result.data.article,
              description: result.data.description,
              sizes: result.data.sizes,
              inStock: result.data.inStock,
              deliveryInfo: result.data.deliveryInfo
            };
            
            setProduct(productData);
            
            // Создаем изображения
            const productImages: GalleryImage[] = result.data.photo ? [
              {
                id: '1',
                url: result.data.photo,
                alt: `${result.data.name} - основное фото`
              },
              {
                id: '2',
                url: 'https://via.placeholder.com/800x600/E5DDD4/8C8072?text=' + encodeURIComponent(result.data.brand + ' 2'),
                alt: `${result.data.name} - вид сбоку`
              },
              {
                id: '3',
                url: 'https://via.placeholder.com/800x600/E5DDD4/8C8072?text=' + encodeURIComponent(result.data.brand + ' 3'),
                alt: `${result.data.name} - вид сзади`
              },
              {
                id: '4',
                url: 'https://via.placeholder.com/800x600/E5DDD4/8C8072?text=' + encodeURIComponent(result.data.brand + ' 4'),
                alt: `${result.data.name} - подошва`
              }
            ] : mockImages;
            
            setImages(productImages);
            
          } else {
            console.error('Товар не найден:', result.error);
            setProduct(null);
          }
          
        } catch (error) {
          console.error('Ошибка загрузки товара:', error);
          setProduct(null);
        } finally {
          setLoading(false);
        }
      };

      loadProduct();
    }
  }, [mounted, params.id]);

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
  };

  const handleAddToCart = (size: string) => {
    if (!product) return;
    
    const selectedSizeInfo = product.sizes.find(s => s.size === size);
    const price = selectedSizeInfo?.price || product.price;
    
    // Создаем объект товара для корзины
    const cartItem = {
      id: product.id,
      article: product.article,
      brand: product.brand,
      name: `${product.name} (размер ${size})`,
      size: size,
      category: product.category,
      gender: 'Унисекс',
      price: price,
      photo: images[0]?.url || ''
    };
    
    addToCart(cartItem);
    
    // Показываем уведомление
    alert(`Товар добавлен в корзину!\n${product.name}\nРазмер: ${size}\nЦена: ${price.toLocaleString()} ₽`);
  };

  const handleContinueShopping = () => {
    console.log('Переход в каталог');
    window.location.href = '/';
  };

  const handleBackToStore = () => {
    console.log('Переход на главную');
    window.location.href = '/';
  };

  // Хлебные крошки
  const breadcrumbItems = [
    { label: 'Каталог', href: '/' },
    { label: product?.category || 'Категория', href: `/#${product?.category}` },
    { label: product?.name || 'Товар', isLast: true }
  ];

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
        {/* Обертка со отступами для загрузки */}
        <div className="px-5 lg:px-0 lg:pl-[139px] lg:pr-[20px]">
          <div className="py-8">
            <div className="animate-pulse space-y-8">
              {/* Хлебные крошки */}
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              
              {/* Основной контент */}
              <div className="flex flex-col lg:flex-row lg:gap-12">
                {/* Галерея */}
                <div className="w-full lg:flex-1 lg:max-w-[60%]">
                  <div className="space-y-4">
                    <div className="w-full aspect-[16/10] bg-gray-200 rounded"></div>
                    <div className="grid grid-cols-4 gap-2">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="aspect-[16/10] bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Информация */}
                <div className="w-full lg:w-auto lg:flex-shrink-0 mt-8 lg:mt-0">
                  <div className="space-y-6 lg:w-[500px]">
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-16 bg-gray-200 rounded w-full"></div>
                    <div className="h-12 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Товар не найден</h1>
          <p className="text-gray-600 mb-8">Товар с ID {params.id} не существует</p>
          <button 
            onClick={handleBackToStore}
            className="bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors"
          >
            Вернуться в магазин
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Обертка со отступами для всей страницы продукта */}
      <div className="px-5 lg:px-0 lg:pl-[139px] lg:pr-[20px]">
        
        {/* Хлебные крошки */}
        <div className="py-6 lg:py-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Основной контент товара */}
        <div className="w-full">
          <div className="flex flex-col lg:flex-row lg:gap-12">
            
            {/* ГАЛЕРЕЯ - занимает ~60% ширины, flex растет */}
            <div className="w-full lg:flex-1 lg:max-w-[60%]">
              <ProductGallery 
                images={images} 
                productName={product.name}
              />
            </div>
            
            {/* ИНФОРМАЦИЯ О ТОВАРЕ - оптимальная ширина ~500px */}
            <div className="w-full lg:w-auto lg:flex-shrink-0 mt-8 lg:mt-0">
              <div className="lg:w-[500px]">
                <ProductInfo
                  product={product}
                  selectedSize={selectedSize}
                  onSizeSelect={handleSizeSelect}
                  onAddToCart={handleAddToCart}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Секция доставки и оплаты */}
        <DeliveryPaymentSection className="mt-16" />

        {/* Секция действий - продолжить покупки */}
        <ProductActions 
          onContinueShopping={handleContinueShopping}
          onBackToStore={handleBackToStore}
          className="mt-16"
        />
        
      </div>

      {/* Секция индивидуального заказа - БЕЗ отступов, на всю ширину */}
      <CustomOrderSection 
        onHowItWorksClick={() => setIsModalOpen(true)}
      />

      {/* Модальное окно "Как это работает?" */}
      <HowItWorksModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}