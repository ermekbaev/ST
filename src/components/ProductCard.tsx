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
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    console.log('Товар добавлен в корзину:', product.name);
  };

  const handleCardClick = () => {
    console.log('Переход на страницу товара:', product.id || product.article);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden rounded-t-lg">
        {/* ТОЛЬКО цветной блок, никаких <img> тегов! */}
        <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
          <div className="text-white text-center p-4">
            <div className="text-lg font-bold mb-1">{product.brand}</div>
            <div className="text-sm opacity-90">{product.name.slice(0, 30)}...</div>
          </div>
        </div>
        
        {/* Оверлей при наведении */}
        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <button
              onClick={handleAddToCart}
              className="bg-white text-gray-900 px-4 py-2 rounded-md font-semibold hover:bg-gray-100 transition-colors"
            >
              В корзину
            </button>
          </div>
        )}
        
        {/* Бейдж размера */}
        {product.size && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-md text-sm font-medium">
            {product.size}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500 font-medium">
            {product.brand}
          </span>
          {product.gender && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {product.gender}
            </span>
          )}
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            {product.price ? `${product.price.toLocaleString()} ₽` : 'Цена по запросу'}
          </span>
          
          {product.article && (
            <span className="text-xs text-gray-400">
              {product.article}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;