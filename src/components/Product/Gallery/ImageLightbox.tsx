// src/components/Product/Gallery/ImageLightbox.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { GalleryImage } from './ProductGallery';

interface ImageLightboxProps {
  images: GalleryImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSelectImage: (index: number) => void;
  productName: string;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrev,
  onSelectImage,
  productName
}) => {
  const [imageLoadError, setImageLoadError] = useState<Record<string, boolean>>({});
  const [isClosing, setIsClosing] = useState(false);

  const handleImageError = (imageId: string) => {
    setImageLoadError(prev => ({ ...prev, [imageId]: true }));
  };

  // Управление клавиатурой
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (event.key) {
        case 'Escape':
          handleClose();
          break;
        case 'ArrowRight':
          event.preventDefault();
          onNext();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          onPrev();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Блокируем скролл страницы
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onNext, onPrev]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200); // Время анимации закрытия
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  const currentImage = images[currentIndex];
  const hasError = imageLoadError[currentImage?.id];

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.95)'
      }}
      onClick={handleBackdropClick}
    >
      {/* Контейнер модального окна */}
      <div 
        className={`relative w-full h-full flex flex-col items-center justify-center p-4 transition-transform duration-200 ${
          isClosing ? 'scale-95' : 'scale-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Кнопка закрытия */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
          aria-label="Закрыть просмотр"
        >
          <div className="relative w-6 h-6">
            <div className="absolute w-6 h-0.5 bg-white transform rotate-45 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute w-6 h-0.5 bg-white transform -rotate-45 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </button>

        {/* Основное изображение */}
        <div className="relative flex-1 flex items-center justify-center w-full max-w-7xl">
          {!hasError && currentImage && currentImage.url && currentImage.url.trim() !== '' ? (
            <img
              src={currentImage.url}
              alt={currentImage.alt || `${productName} - фото ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain select-none"
              onError={() => handleImageError(currentImage.id)}
              draggable={false}
              style={{
                maxHeight: 'calc(100vh - 200px)' // Оставляем место для навигации
              }}
            />
          ) : (
            <div 
              className="w-96 h-96 flex items-center justify-center rounded-lg"
              style={{
                background: 'linear-gradient(114.84deg, #E5DDD4 7.89%, #BFB3A3 92.11%)'
              }}
            >
              <div className="text-center text-gray-600">
                <div className="text-xl mb-2">{productName}</div>
                <div className="text-sm">Изображение недоступно</div>
              </div>
            </div>
          )}

          {/* Навигационные стрелки */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPrev();
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
                aria-label="Предыдущее изображение"
              >
                <div 
                  className="w-4 h-4 border-l-2 border-b-2 border-white transform rotate-45"
                  style={{ marginLeft: '2px' }}
                ></div>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNext();
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
                aria-label="Следующее изображение"
              >
                <div 
                  className="w-4 h-4 border-r-2 border-b-2 border-white transform -rotate-45"
                  style={{ marginRight: '2px' }}
                ></div>
              </button>
            </>
          )}
        </div>

        {/* Информация о фото */}
        <div className="mt-4 text-center">
          <div className="text-white text-lg font-medium mb-2">
            {productName}
          </div>
          {images.length > 1 && (
            <div className="text-white/70 text-sm">
              {currentIndex + 1} из {images.length}
            </div>
          )}
        </div>

        {/* Миниатюры для навигации (только если больше одного фото) */}
        {images.length > 1 && (
          <div className="mt-6 flex justify-center items-center space-x-2 max-w-full overflow-x-auto pb-2">
            {images.map((image, index) => {
              const isActive = index === currentIndex;
              const thumbHasError = imageLoadError[image.id];
              
              return (
                <button
                  key={image.id}
                  onClick={() => onSelectImage(index)}
                  className={`flex-shrink-0 w-16 h-16 relative overflow-hidden rounded transition-all duration-200 hover:scale-110 ${
                    isActive ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' : 'opacity-60 hover:opacity-80'
                  }`}
                  aria-label={`Перейти к фото ${index + 1}`}
                >
                  {!thumbHasError && image.url && image.url.trim() !== '' ? (
                    <img
                      src={image.url}
                      alt={image.alt || `${productName} - миниатюра ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(image.id)}
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
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageLightbox;