// src/components/Product/Gallery/ProductGallery.tsx
'use client';

import React, { useState, useEffect } from 'react';
import DesktopGallery from './DesktopGallery';
import MobileGallery from './MobileGallery';
import ImageLightbox from './ImageLightbox';

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  productName: string;
  className?: string;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ 
  images, 
  productName, 
  className = '' 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Функции навигации по изображениям
  const goToNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const goToPrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const goToImage = (index: number) => {
    if (index >= 0 && index < images.length) {
      setCurrentImageIndex(index);
    }
  };

  // Функции для лайтбокса
  const openLightbox = (index?: number) => {
    setLightboxImageIndex(index !== undefined ? index : currentImageIndex);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const goToNextLightboxImage = () => {
    setLightboxImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const goToPrevLightboxImage = () => {
    setLightboxImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const goToLightboxImage = (index: number) => {
    if (index >= 0 && index < images.length) {
      setLightboxImageIndex(index);
    }
  };

  // Управление клавиатурой (стрелки) - только для основной галереи
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Если лайтбокс открыт, не обрабатываем события здесь
      if (isLightboxOpen) return;
      
      if (event.key === 'ArrowRight') {
        goToNextImage();
      } else if (event.key === 'ArrowLeft') {
        goToPrevImage();
      }
    };

    if (mounted) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [mounted, images.length, isLightboxOpen]);

  // Показываем заглушку до монтирования
  if (!mounted) {
    return (
      <div className={`w-full ${className}`}>
        <div className="animate-pulse">
          {/* Desktop заглушка */}
          <div className="hidden lg:block space-y-4">
            <div className="w-full max-w-4xl aspect-[16/10] bg-gray-200 rounded"></div>
            <div className="grid grid-cols-4 gap-2 max-w-4xl">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[16/10] bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          
          {/* Mobile заглушка */}
          <div className="block lg:hidden space-y-2">
            <div className="w-full max-w-sm aspect-[16/9] bg-gray-200 rounded"></div>
            <div className="grid grid-cols-4 gap-1 max-w-sm">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[16/10] bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Обработка случая когда нет изображений
  if (!images || images.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        {/* Desktop версия без изображений */}
        <div className="hidden lg:block space-y-4">
          <div 
            className="w-full max-w-4xl aspect-[16/10] flex items-center justify-center rounded"
            style={{
              background: 'linear-gradient(114.84deg, #E5DDD4 7.89%, #BFB3A3 92.11%)'
            }}
          >
            <span className="text-gray-600 text-xl">Изображение скоро появится</span>
          </div>
          <div className="grid grid-cols-4 gap-2 max-w-4xl">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className="aspect-[16/10] flex items-center justify-center rounded"
                style={{
                  background: 'linear-gradient(114.84deg, #E5DDD4 7.89%, #BFB3A3 92.11%)'
                }}
              >
                <span className="text-gray-500 text-sm">Фото {i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile версия без изображений */}
        <div className="block lg:hidden space-y-2">
          <div 
            className="w-full max-w-sm aspect-[16/9] flex items-center justify-center rounded"
            style={{
              background: 'linear-gradient(114.84deg, #E5DDD4 7.89%, #BFB3A3 92.11%)'
            }}
          >
            <span className="text-gray-600 text-sm">Изображение скоро</span>
          </div>
          <div className="grid grid-cols-4 gap-1 max-w-sm">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className="aspect-[16/10] flex items-center justify-center text-xs rounded"
                style={{
                  background: 'linear-gradient(114.84deg, #E5DDD4 7.89%, #BFB3A3 92.11%)'
                }}
              >
                <span className="text-gray-500">{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const galleryProps = {
    images,
    currentImageIndex,
    productName,
    onPrevImage: goToPrevImage,
    onNextImage: goToNextImage,
    onSelectImage: goToImage,
    onOpenLightbox: openLightbox, // Новый пропс для открытия лайтбокса
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Desktop версия */}
      <div className="hidden lg:block">
        <DesktopGallery {...galleryProps} />
      </div>
      
      {/* Mobile версия */}
      <div className="block lg:hidden">
        <MobileGallery {...galleryProps} />
      </div>

      {/* Лайтбокс */}
      <ImageLightbox
        images={images}
        currentIndex={lightboxImageIndex}
        isOpen={isLightboxOpen}
        onClose={closeLightbox}
        onNext={goToNextLightboxImage}
        onPrev={goToPrevLightboxImage}
        onSelectImage={goToLightboxImage}
        productName={productName}
      />
    </div>
  );
};

export default ProductGallery;