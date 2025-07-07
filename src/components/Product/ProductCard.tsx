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

//   console.log(product);
  

  const handleImageError = () => {
    console.error('❌ ОШИБКА ИЗОБРАЖЕНИЯ:', product.name);
    console.error('   URL:', `"${product.photo}"`);
    console.error('   Длина URL:', product.photo?.length || 0);
    console.error('   Начинается с http:', product.photo?.startsWith('http'));
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('✅ Изображение загружено:', product.name);
  };

  const showPlaceholder = !product.photo || imageError || product.photo.trim() === '';

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
            className="w-full h-[150px] lg:h-[200px] object-cover"
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        ) : (
          <div className="w-full h-[150px] lg:h-[200px] bg-gray-50 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-xs lg:text-sm mb-1">{product.brand}</div>
              <div className="text-xs">Фото скоро</div>
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