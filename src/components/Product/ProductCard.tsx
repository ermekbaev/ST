// src/components/Product/ProductCard.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  slug?: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  // Добавляем отладку при создании компонента
  useEffect(() => {
    console.log('🎯 ProductCard создан для товара:', {
      name: product.name.substring(0, 30),
      id: product.id,
      slug: product.slug,
      photo: product.photo,
      photoLength: product.photo?.length || 0,
      photoStartsWithHttp: product.photo?.startsWith('http'),
      hasValidPhoto: isValidImageUrl(product.photo)
    });
  }, [product]);

  const handleCardClick = () => {
    let productIdentifier: string;
    
    if (product.slug && product.slug.trim()) {
      productIdentifier = product.slug;
      console.log('🔗 Переход по slug:', productIdentifier);
    } else if (product.id) {
      productIdentifier = product.id;
      console.log('🔗 Переход по ID:', productIdentifier);
    } else {
      productIdentifier = product.article;
      console.log('🔗 Переход по article:', productIdentifier);
    }
    
    router.push(`/product/${productIdentifier}`);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('❌ ОШИБКА ЗАГРУЗКИ ИЗОБРАЖЕНИЯ:');
    console.error('   Товар:', product.name);
    console.error('   URL:', `"${product.photo}"`);
    console.error('   Длина URL:', product.photo?.length || 0);
    console.error('   Начинается с http:', product.photo?.startsWith('http'));
    console.error('   Actual src:', e.currentTarget.src);
    console.error('   Error type:', e.type);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('✅ Изображение успешно загружено:', product.name.substring(0, 30));
  };

  // Улучшенная проверка валидности изображения
  const isValidImageUrl = (url: string): boolean => {
    if (!url || url.trim() === '') return false;
    const trimmedUrl = url.trim();
    
    // Проверяем, что это валидный HTTP URL
    const isHttp = trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://');
    
    // Проверяем, что URL содержит домен
    const hasDomain = trimmedUrl.includes('.') && trimmedUrl.length > 10;
    
    return isHttp && hasDomain;
  };

  const showPlaceholder = !isValidImageUrl(product.photo) || imageError;

  return (
    <div 
      className="bg-white group cursor-pointer w-full hover-lift"
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden w-full">
        {!showPlaceholder ? (
          <img
            src={product.photo}
            alt={product.name}
            className="w-full h-[150px] lg:h-[200px] object-contain"
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
            // ИСПРАВЛЕНО: Удален crossOrigin="anonymous" который блокировал CORS
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-[150px] lg:h-[200px] bg-gray-50 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-xs lg:text-sm mb-1">{product.brand}</div>
              <div className="text-xs">
                {product.photo && product.photo.trim() !== '' 
                  ? 'Ошибка загрузки' 
                  : 'Фото скоро'
                }
              </div>
              {/* Отладочная информация (только в development) */}
              {process.env.NODE_ENV === 'development' && product.photo && (
                <div className="text-xs text-red-400 mt-1 px-1">
                  URL: {product.photo.substring(0, 20)}...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="w-full h-px bg-brand-dark"></div>
      
      <div className="py-2">
        <h3 className="product-name text-brand-dark text-[18px] leading-[22px] mb-1">
          {product.name}
        </h3>
        <div className="product-price text-brand-dark text-[15px] leading-[20px]">
          {product.price ? `${product.price.toLocaleString()} ₽` : 'Цена по запросу'}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;