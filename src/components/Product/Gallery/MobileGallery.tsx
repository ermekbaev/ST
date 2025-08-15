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
  onOpenLightbox: (index?: number) => void; 
}

const MobileGallery: React.FC<MobileGalleryProps> = ({
  images,
  currentImageIndex,
  productName,
  onPrevImage,
  onNextImage,
  onSelectImage,
  onOpenLightbox,
}) => {
  const [imageLoadError, setImageLoadError] = useState<Record<string, boolean>>({});
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [lastTap, setLastTap] = useState<number>(0);
  const mainImageRef = useRef<HTMLDivElement>(null);

  const handleImageError = (imageId: string) => {
    setImageLoadError(prev => ({ ...prev, [imageId]: true }));
  };

  const handleImageLoad = (imageId: string) => {
    console.log('Изображение загружено:', imageId);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || !images || images.length <= 1) return;
    
    const distance = touchStart - touchStart;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      onNextImage();
    }
    if (isRightSwipe) {
      onPrevImage();
    }
  };

  const handleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (lastTap && (now - lastTap) < DOUBLE_TAP_DELAY) {
      onOpenLightbox(currentImageIndex);
    } else {
      if (images && images.length > 1) {
        onNextImage();
      }
    }
    setLastTap(now);
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
        onClick={handleTap} // Изменили обработчик клика
      >
        {!hasError && currentImage && currentImage.url && currentImage.url.trim() !== '' ? (
          <img
            src={currentImage.url || undefined}
            alt={currentImage.alt || productName}
            className="w-full h-full object-contain object-center"
            onError={() => handleImageError(currentImage.id)}
            onLoad={() => handleImageLoad(currentImage.id)}
            draggable={false}
            style={{
              backgroundColor: 'transparent'
            }}
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(114.84deg, #E5DDD4 7.89%, #BFB3A3 92.11%)'
            }}
          >
            <div className="text-center text-gray-600">
              <div className="text-lg mb-1">{productName}</div>
              <div className="text-xs">Изображение скоро</div>
            </div>
          </div>
        )}

        {/* Индикатор количества изображений */}
        {images.length > 1 && (
          <div 
            className="absolute bottom-2 right-2 px-2 py-1 text-white text-xs rounded-full"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)'
            }}
          >
            {currentImageIndex + 1} / {images.length}
          </div>
        )}

        {/* Иконка увеличения */}
        <div 
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full"
          style={{
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)'
          }}
        >
          <div className="relative w-3 h-3">
            <div className="absolute w-2.5 h-2.5 border border-white rounded-full top-0 left-0"></div>
            <div className="absolute w-1.5 h-0.5 bg-white transform rotate-45 bottom-0 right-0"></div>
          </div>
        </div>

        {/* Подсказка о двойном нажатии (показывается кратковременно) */}
        <div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 px-3 py-1 text-white text-xs rounded-full pointer-events-none opacity-0 animate-pulse"
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)'
          }}
        >
          Нажмите дважды для увеличения
        </div>
      </div>

      {/* Миниатюры под главным изображением */}
      {images.length > 1 && (
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
                    className="w-full h-full object-contain object-center"
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
                  <div className="absolute inset-0 bg-opacity-30"></div>
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
    </div>
  );
};

export default MobileGallery;