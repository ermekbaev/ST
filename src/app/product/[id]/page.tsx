// src/app/product/[id]/page.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ для Strapi API
'use client';

import React, { useState, useEffect, use } from 'react';
import { useCart } from '../../../contexts/CartContext';
import Breadcrumbs from '../../../components/UI/Breadcrumbs/Breadcrumbs';
import ProductGallery, { GalleryImage } from '../../../components/Product/Gallery/ProductGallery';
import ProductInfo, { ProductInfo as ProductInfoType, ProductSize } from '../../../components/Product/Info/ProductInfo';
import CustomOrderSection from '../../../components/CustomOrder/CustomOrderSection';
import HowItWorksModal from '../../../components/UI/Modal/HowItWorksModal';
import CartNotification from '../../../components/UI/Notifications/CartNotification';
import DeliveryPaymentSection from '@/components/Product/Sections/DeliveryPaymentSection';
import ProductActions from '@/components/Product/Sections/ProductActions';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const [mounted, setMounted] = useState(false);
  const [product, setProduct] = useState<ProductInfoType | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationProduct, setNotificationProduct] = useState('');
  const { addToCart, openCart } = useCart();

  // Используем React.use() для разворачивания Promise params
  const resolvedParams = use(params);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Загрузка данных товара
  useEffect(() => {
    if (mounted) {
      const loadProduct = async () => {
        try {
          setLoading(true);
          
          console.log('🚀 Загружаем товар с ID:', resolvedParams.id);
          
          // API запрос к новому Strapi API
          const response = await fetch(`/api/products/${resolvedParams.id}`);
          
          if (!response.ok) {
            if (response.status === 404) {
              console.warn('⚠️ Товар не найден (404)');
              setProduct(null);
              return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();
          
          console.log('📦 Получен ответ от Strapi API:', {
            hasProduct: !!result.product,
            error: result.error
          });
          
          // ИСПРАВЛЕНО: новый формат API - result.product вместо result.data
          if (result.product) {
            const productData = result.product;
            
            console.log('✅ Данные товара получены:', {
              name: productData.name,
              price: productData.price,
              sizes: productData.sizes,
              mainPhoto: productData.mainPhoto,
              additionalPhotos: productData.additionalPhotos
            });
            
            // Создаем размеры в правильном формате
            const productSizes: ProductSize[] = productData.sizes?.map((sizeValue: string) => ({
              size: sizeValue,
              price: productData.price, // Пока одна цена для всех размеров
              available: true
            })) || [
              // Если размеров нет, создаем дефолтный
              { size: productData.size || '41', price: productData.price, available: true }
            ];
            
            // Преобразуем данные в нужный формат для компонента
            const productInfo: ProductInfoType = {
              id: productData.id,
              name: productData.name,
              brand: productData.brand,
              price: productData.price,
              category: productData.category,
              article: productData.article,
              description: `${productData.brand} ${productData.name} - ${productData.category}`,
              sizes: productSizes,
              inStock: productData.availableStock > 0,
              deliveryInfo: 'Доставка 1-3 дня по России'
            };
            
            setProduct(productInfo);
            
            // Создаем изображения для галереи
            const productImages: GalleryImage[] = [];
            
            // Добавляем главное фото
            if (productData.mainPhoto && productData.mainPhoto.trim()) {
              productImages.push({
                id: 'main_photo',
                url: productData.mainPhoto.trim(),
                alt: `${productData.name} - главное фото`
              });
              console.log('📸 Добавлено главное фото:', productData.mainPhoto.substring(0, 80) + '...');
            }
            
            // Добавляем дополнительные фото
            if (productData.additionalPhotos && Array.isArray(productData.additionalPhotos)) {
              productData.additionalPhotos.forEach((photoUrl: string, index: number) => {
                if (photoUrl && photoUrl.trim() && (photoUrl.startsWith('http://') || photoUrl.startsWith('https://'))) {
                  productImages.push({
                    id: `additional_photo_${index + 1}`,
                    url: photoUrl.trim(),
                    alt: `${productData.name} - дополнительное фото ${index + 1}`
                  });
                  console.log(`📸 Добавлено дополнительное фото ${index + 1}:`, photoUrl.substring(0, 80) + '...');
                } else {
                  console.warn(`⚠️ Пропущен невалидный URL дополнительного фото ${index + 1}:`, photoUrl);
                }
              });
            }
            
            // Если НЕТ валидных изображений, добавляем placeholder
            if (productImages.length === 0) {
              console.log('📷 Нет валидных изображений, добавляем placeholder');
              productImages.push({
                id: 'placeholder_1',
                url: '/images/placeholder.jpg', // Placeholder изображение
                alt: `${productData.name} - изображение скоро появится`
              });
            }
            
            setImages(productImages);
            
            console.log(`📸 Итого изображений для отображения: ${productImages.length}`);
            productImages.forEach((img, i) => {
              console.log(`  ${i + 1}: ${img.id} - ${img.url ? img.url.substring(0, 60) + '...' : 'PLACEHOLDER'}`);
            });
            
          } else {
            console.error('❌ Товар не найден в ответе API:', result.error);
            setProduct(null);
          }
          
        } catch (error) {
          console.error('❌ Ошибка загрузки товара:', error);
          setProduct(null);
        } finally {
          setLoading(false);
        }
      };

      loadProduct();
    }
  }, [mounted, resolvedParams.id]);

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
      photo: images[0]?.url || '/images/placeholder.jpg'
    };
    
    // Добавляем в корзину без alert
    addToCart(cartItem);
    
    // Показываем уведомление
    setNotificationProduct(`${product.name} (размер ${size})`);
    setShowNotification(true);
    
    // Логируем в консоль
    console.log(`Товар добавлен в корзину: ${product.name}, размер: ${size}, цена: ${price.toLocaleString()} ₽`);
  };

  const handleContinueShopping = () => {
    console.log('Переход в каталог');
    window.location.href = '/catalog';
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
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mb-4"></div>
            <p className="text-gray-600">Инициализация...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mb-4"></div>
            <p className="text-gray-600">Загружаем товар...</p>
            <p className="text-gray-400 text-sm mt-2">ID: {resolvedParams.id}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Товар не найден</h1>
            <p className="text-gray-600 mb-8">Товар с ID {resolvedParams.id} не существует</p>
            <button 
              onClick={handleBackToStore}
              className="bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors"
            >
              Вернуться в магазин
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log('🎨 Рендерим страницу товара:', {
    productName: product.name,
    imagesCount: images.length,
    images: images.map(img => ({ id: img.id, hasUrl: !!img.url, url: img.url?.substring(0, 50) }))
  });

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

      {/* Уведомление о добавлении в корзину */}
      <CartNotification
        isVisible={showNotification}
        productName={notificationProduct}
        onHide={() => setShowNotification(false)}
      />
    </div>
  );
}