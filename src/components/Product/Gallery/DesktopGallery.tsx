// src/components/Product/Gallery/DesktopGallery.tsx
'use client';

import React, { useState } from 'react';
import { GalleryImage } from './ProductGallery';

interface DesktopGalleryProps {
  images: GalleryImage[];
  currentImageIndex: number;
  productName: string;
  onPrevImage: () => void;
  onNextImage: () => void;
  onSelectImage: (index: number) => void;
  onOpenLightbox: (index?: number) => void; // Новый пропс
}

const DesktopGallery: React.FC<DesktopGalleryProps> = ({
  images,
  currentImageIndex,
  productName,
  onPrevImage,
  onNextImage,
  onSelectImage,
  onOpenLightbox,
}) => {
  const [imageLoadError, setImageLoadError] = useState<Record<string, boolean>>({});
  const [isHovered, setIsHovered] = useState(false);

  const handleImageError = (imageId: string) => {
    setImageLoadError(prev => ({ ...prev, [imageId]: true }));
  };

  const handleImageLoad = (imageId: string) => {
    console.log('Изображение загружено:', imageId);
  };

  const currentImage = images[currentImageIndex];
  const hasError = imageLoadError[currentImage?.id];

  return (
    <div className="relative w-full">
      {/* Главное изображение */}
      <div 
        className="relative group cursor-pointer overflow-hidden aspect-[5/3] rounded-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onOpenLightbox(currentImageIndex)} // Добавляем обработчик клика
      >
      {!hasError && currentImage && currentImage.url && currentImage.url.trim() !== '' ? (
          <img
            src={currentImage.url || undefined}
            alt={currentImage.alt || productName}
            className="w-full h-full object-contain object-center transition-transform duration-300 group-hover:scale-105"
            onError={() => handleImageError(currentImage.id)}
            onLoad={() => handleImageLoad(currentImage.id)}
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
              <div className="text-xl mb-2">{productName}</div>
              <div className="text-sm">Изображение скоро появится</div>
            </div>
          </div>
        )}

        {/* Стрелки навигации - появляются при ховере */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Предотвращаем открытие лайтбокса
                onPrevImage();
              }}
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center transition-all duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                background: 'rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(8px)',
                borderRadius: '50%',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}
              aria-label="Предыдущее изображение"
            >
              <div 
                className="w-3 h-3 border-l-2 border-b-2 border-white transform rotate-45"
                style={{ marginLeft: '2px' }}
              ></div>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation(); // Предотвращаем открытие лайтбокса
                onNextImage();
              }}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center transition-all duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                background: 'rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(8px)',
                borderRadius: '50%',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}
              aria-label="Следующее изображение"
            >
              <div 
                className="w-3 h-3 border-r-2 border-b-2 border-white transform -rotate-45"
                style={{ marginRight: '2px' }}
              ></div>
            </button>
          </>
        )}

        {/* Индикатор количества изображений */}
        {images.length > 1 && (
          <div 
            className={`absolute bottom-4 right-4 px-3 py-1 text-white text-sm transition-opacity duration-300 rounded-full ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)'
            }}
          >
            {currentImageIndex + 1} / {images.length}
          </div>
        )}

        {/* Иконка увеличения - появляется при ховере */}
        <div 
          className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center transition-opacity duration-300 rounded-full ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          <div className="relative w-4 h-4">
            <div className="absolute w-3 h-3 border-2 border-white rounded-full top-0 left-0"></div>
            <div className="absolute w-2 h-0.5 bg-white transform rotate-45 bottom-0 right-0"></div>
          </div>
        </div>
      </div>

      {/* Миниатюры под главным изображением */}
      {images.length > 1 && (
        <>
          <div className="grid grid-cols-4 gap-3 mt-4">
            {images.slice(0, 4).map((image, index) => {
              const isActive = index === currentImageIndex;
              const thumbHasError = imageLoadError[image.id];
              
              return (
                <button
                  key={image.id}
                  onClick={() => onSelectImage(index)}
                  className={`relative overflow-hidden transition-all duration-200 hover:scale-105 aspect-[16/10] rounded ${
                    isActive ? 'ring-2 ring-black ring-offset-2' : ''
                  }`}
                  aria-label={`Показать изображение ${index + 1}`}
                >
                {!thumbHasError && image.url && image.url.trim() !== '' ? (
                    <img
                      src={image.url || undefined}
                      alt={image.alt || `${productName} - фото ${index + 1}`}
                      className="w-full h-full object-contain object-center"
                      onError={() => handleImageError(image.id)}
                      onLoad={() => handleImageLoad(image.id)}
                      style={{
                        backgroundColor: 'transparent'
                      }}
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center relative"
                      style={{
                        background: 'linear-gradient(114.84deg, #E5DDD4 7.89%, #BFB3A3 92.11%)'
                      }}
                    >
                      <span className="text-gray-500 text-sm relative z-10">Фото {index + 1}</span>
                    </div>
                  )}

                  {/* Оверлей для неактивных миниатюр */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-opacity-40 hover:bg-opacity-20 transition-all"></div>
                  )}
                </button>
              );
            })}

            {/* Заглушки для недостающих миниатюр */}
            {images.length < 4 && [...Array(4 - images.length)].map((_, index) => (
              <div
                key={`placeholder-${index}`}
                className="flex items-center justify-center aspect-[16/10] rounded relative overflow-hidden"
                style={{
                  background: 'linear-gradient(114.84deg, #E5DDD4 7.89%, #BFB3A3 92.11%)'
                }}
              >
                <span className="text-gray-500 text-sm">Фото {images.length + index + 1}</span>
                
                {/* Оверлей для недоступных миниатюр */}
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              </div>
            ))}
          </div>

          {/* Разделительная линия под миниатюрами - точно по их ширине */}
          <div className="w-full h-0.5 bg-black mt-8"></div>
        </>
      )}
    </div>
  );
};

export default DesktopGallery;