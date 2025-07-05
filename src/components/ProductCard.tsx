// components/ProductCard.js
import { useState } from 'react';
import { useCart } from '../contexts/CartContext';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a href={`/product/${product.id || product.article}`} className="block">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={product.photo || '/placeholder-image.jpg'}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = '/placeholder-image.jpg';
            }}
          />
          
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
          
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">
              {product.price ? `${product.price} ₽` : 'Цена по запросу'}
            </span>
            
            {product.article && (
              <span className="text-xs text-gray-400">
                {product.article}
              </span>
            )}
          </div>
        </div>
      </a>
    </div>
  );
};

export default ProductCard;