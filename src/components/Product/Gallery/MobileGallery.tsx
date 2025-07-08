// src/components/Product/Gallery/MobileGallery.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GalleryImage } from './ProductGallery';

interface MobileGalleryProps {
  images: GalleryImage[];
  currentImageIndex: number;
  productName: string;
  onPrevImage: () => void;
  onNextImage: () => void;
  onSelectImage: (index: number) => void;
}

const MobileGallery: React.FC<MobileGalleryProps> = ({
  images,
  currentImageIndex,
  productName,
  onPrevImage,
  onNextImage,
  onSelectImage,
}) => {
  const [imageLoadError, setImageLoadError] = useState<Record<string, boolean>>({});
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const mainImageRef = useRef<HTMLDivElement>(null);

  const handleImageError = (imageId: string) => {
    setImageLoadError(prev => ({ ...prev, [imageId]: true }));
    console.error('Ошибка загрузки изображения:', imageId);
  };

  const handleImageLoad = (imageId: string) => {
    console.log('Изображение загружено:', imageId);
  };

  // Свайп навигация
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || !images || images.length <= 1) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      onNextImage();
    }
    if (isRightSwipe) {
      onPrevImage();
    }
  };

  const currentImage = images[currentImageIndex];
  const hasError = imageLoadError[currentImage?.id];

  return (
    <div className="relative w-full max-w-sm">
      {/* Главное изображение */}
      <div 
        ref={mainImageRef}
        className="relative cursor-pointer overflow-hidden select-none aspect-[16/9] rounded"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          // При клике переключаем на следующее изображение
          if (images && images.length > 1) {
            onNextImage();
          }
        }}
      >
        {!hasError && currentImage ? (
          <img
            src={currentImage.url}
            alt={currentImage.alt || productName}
            className="w-full h-full object-cover object-center"
            onError={() => handleImageError(currentImage.id)}
            onLoad={() => handleImageLoad(currentImage.id)}
            draggable={false}
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(114.84deg, #E5DDD4 7.89%, #BFB3A3 92.11%)'
            }}
          >
            <div className="text-center text-gray-600">
              <div className="text-sm mb-1">{productName}</div>
              <div className="text-xs">Изображение скоро</div>
            </div>
          </div>
        )}

        {/* Индикаторы точек в правом верхнем углу */}
        {images && images.length > 1 && (
          <div className="absolute top-2 right-2 flex space-x-1">
            {images.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentImageIndex 
                    ? 'bg-white' 
                    : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Счетчик изображений в левом нижнем углу */}
        {images && images.length > 1 && (
          <div 
            className="absolute bottom-2 left-2 px-2 py-1 text-white text-xs rounded-xl"
            style={{
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)'
            }}
          >
            {currentImageIndex + 1}/{images.length}
          </div>
        )}
      </div>

      {/* Миниатюры под главным изображением */}
      {images && images.length > 1 && (
        <div className="grid grid-cols-4 gap-1 mt-2">
          {images.slice(0, 4).map((image, index) => {
            const isActive = index === currentImageIndex;
            const thumbHasError = imageLoadError[image.id];
            
            return (
              <button
                key={image.id}
                onClick={() => onSelectImage(index)}
                className={`relative overflow-hidden transition-all duration-200 aspect-[16/10] rounded ${
                  isActive ? 'ring-1 ring-black ring-offset-1' : ''
                }`}
                aria-label={`Показать изображение ${index + 1}`}
              >
                {!thumbHasError ? (
                  <img
                    src={image.url}
                    alt={image.alt || `${productName} - фото ${index + 1}`}
                    className="w-full h-full object-cover object-center"
                    onError={() => handleImageError(image.id)}
                    onLoad={() => handleImageLoad(image.id)}
                    draggable={false}
                  />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(114.84deg, #E5DDD4 7.89%, #BFB3A3 92.11%)'
                    }}
                  >
                    <span className="text-gray-500 text-xs">{index + 1}</span>
                  </div>
                )}

                {/* Оверлей для неактивных миниатюр */}
                {!isActive && (
                  <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                )}
              </button>
            );
          })}

          {/* Заглушки для недостающих миниатюр */}
          {images.length < 4 && [...Array(4 - images.length)].map((_, index) => {
            const actualIndex = images.length + index;
            return (
              <div
                key={`placeholder-${index}`}
                className="flex items-center justify-center aspect-[16/10] rounded"
                style={{
                  background: 'linear-gradient(114.84deg, #E5DDD4 7.89%, #BFB3A3 92.11%)'
                }}
              >
                <span className="text-gray-500 text-xs">{actualIndex + 1}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Инструкция по свайпу (показывается кратковременно) */}
      {images && images.length > 1 && (
        <div className="mt-1 text-center">
          <span className="text-gray-400 text-xs">
            Листайте свайпом или нажмите на фото
          </span>
        </div>
      )}
    </div>
  )
};

export default MobileGallery;