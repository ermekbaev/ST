'use client';

import { useState } from 'react';

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

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [imageError, setImageError] = useState(false);

  const handleCardClick = () => {
    console.log('Переход на страницу товара:', product.id || product.article);
  };

  // Если нет фото или ошибка загрузки, показываем placeholder
  const showPlaceholder = !product.photo || imageError;

  return (
    <div 
      className="bg-white group cursor-pointer w-full hover-lift"
      onClick={handleCardClick}
    >
      {/* Изображение товара - без бордеров */}
      <div className="relative overflow-hidden w-full">
        {!showPlaceholder ? (
          <img
            src={product.photo}
            alt={product.name}
            className="w-full h-[200px] object-cover"
            onError={() => setImageError(true)}
            onLoad={() => console.log('Изображение загружено:', product.photo)}
          />
        ) : (
          <div className="w-full h-[200px] bg-gray-50 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-sm mb-1">{product.brand}</div>
              <div className="text-xs">Фото скоро</div>
            </div>
          </div>
        )}
        

      </div>
      
      {/* Разделительная линия под фото */}
      <div className="w-full h-px bg-brand-dark"></div>
      
      {/* Информация о товаре */}
      <div className="py-2">
        {/* Название товара - Random Grotesque Standard Book */}
        <h3 className="product-name text-brand-dark text-[18px] leading-[22px] mb-1">
          {product.name}
        </h3>
        {/* Цена - Random Grotesque Spacious Book */}
        <div className="product-price text-brand-dark text-[15px] leading-[20px]">
          {product.price ? `${product.price.toLocaleString()} ₽` : 'Цена по запросу'}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;