'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  
  // Состояния для свайпов
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragDistance, setDragDistance] = useState(0);
  
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const minSwipeDistance = 50; // Минимальная дистанция для срабатывания свайпа

  const handleImageError = (imageId: string) => {
    setImageLoadError(prev => ({ ...prev, [imageId]: true }));
  };

  // Обработка начала касания
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (images.length <= 1) return;
    
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setTouchEnd(null);
    setIsDragging(true);
    setDragDistance(0);
  }, [images.length]);

  // Обработка движения пальца
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart || images.length <= 1) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = Math.abs(touch.clientY - touchStart.y);
    
    // Если движение больше по вертикали, не обрабатываем как свайп для навигации
    if (deltaY > Math.abs(deltaX) * 1.5) return;
    
    // Предотвращаем скролл страницы при горизонтальном свайпе
    e.preventDefault();
    
    setTouchEnd({ x: touch.clientX, y: touch.clientY });
    setDragDistance(deltaX);
  }, [touchStart, images.length]);

  // Обработка окончания касания
  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd || images.length <= 1) return;

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = Math.abs(touchEnd.y - touchStart.y);
    
    // Если движение больше по вертикали, игнорируем
    if (deltaY > Math.abs(deltaX) * 1.5) {
      setTouchStart(null);
      setTouchEnd(null);
      setIsDragging(false);
      setDragDistance(0);
      return;
    }

    const isSwipe = Math.abs(deltaX) > minSwipeDistance;

    if (isSwipe) {
      if (deltaX > 0) {
        // Свайп вправо - предыдущее фото
        onPrev();
      } else {
        // Свайп влево - следующее фото  
        onNext();
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
    setIsDragging(false);
    setDragDistance(0);
  }, [touchStart, touchEnd, onNext, onPrev, minSwipeDistance, images.length]);

  // Обработка клавиатуры
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
    }, 200); 
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  const currentImage = images[currentIndex];
  const hasError = imageLoadError[currentImage?.id];

  // Стили для анимации перетаскивания
  const imageTransform = isDragging && dragDistance !== 0 
    ? `translateX(${dragDistance * 0.3}px)` 
    : 'translateX(0px)';

  const imageOpacity = isDragging && Math.abs(dragDistance) > 20
    ? Math.max(0.7, 1 - Math.abs(dragDistance) / 300)
    : 1;

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

        {/* Основное изображение с поддержкой свайпов */}
        <div 
          ref={imageContainerRef}
          className="relative flex-1 flex items-center justify-center w-full max-w-7xl touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {!hasError && currentImage && currentImage.url && currentImage.url.trim() !== '' ? (
            <img
              src={currentImage.url}
              alt={currentImage.alt || `${productName} - фото ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain select-none transition-all duration-150"
              onError={() => handleImageError(currentImage.id)}
              draggable={false}
              style={{
                maxHeight: 'calc(100vh - 200px)',
                transform: imageTransform,
                opacity: imageOpacity,
              }}
            />
          ) : (
            <div 
              className="w-96 h-96 flex items-center justify-center rounded-lg transition-all duration-150"
              style={{
                background: 'linear-gradient(114.84deg, #E5DDD4 7.89%, #BFB3A3 92.11%)',
                transform: imageTransform,
                opacity: imageOpacity,
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

          {/* Индикатор свайпа для мобильных (показывается при первом открытии) */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/50 text-xs text-center lg:hidden">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-white/50 rounded-full animate-pulse"></div>
                  <div className="w-1 h-1 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1 h-1 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span>Листайте пальцем</span>
              </div>
            </div>
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