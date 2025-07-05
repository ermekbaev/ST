'use client';

import { useState } from 'react';
import { useCart } from '../contexts/CartContext';

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
  const { addToCart } = useCart();

  const handleCardClick = () => {
    console.log('Переход на страницу товара:', product.id || product.article);
  };

  // Если нет фото или ошибка загрузки, показываем placeholder
  const showPlaceholder = !product.photo || imageError;

  return (
    <div 
      className="bg-white group cursor-pointer w-full"
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
              <div className="text-xs mb-1">{product.brand}</div>
              <div className="text-xs">Фото скоро</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Разделительная линия под фото */}
      <div className="w-full h-px bg-black"></div>
      
      {/* Информация о товаре */}
      <div className="py-2">
        {/* Название товара */}
        <h3 className="text-black text-[25px] leading-[31px] font-normal mb-1">
          {product.name}
        </h3>
        {/* Цена */}
        <div className="text-black text-[15px] leading-[20px] font-normal">
          {product.price ? `${product.price.toLocaleString()} ₽` : 'Цена по запросу'}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;