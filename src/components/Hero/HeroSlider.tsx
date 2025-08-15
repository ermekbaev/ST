'use client';

import React, { useState, useEffect } from 'react';

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const slides = [
    {
      id: 1,
      title: "ДОЛЯМИ",
      imageDesktop: "/banners/Banner2-1.jpg", 
      imageMobile: "/banners/Banner2-2.webp",  
      link: "/catalog", 
      alt: "До-Ля-Ми"
    },
    {
      id: 2,
      title: "100500",
      imageDesktop: "/banners/Banner3-1.jpg", 
      imageMobile: "/banners/Banner3-2.webp",  
      link: "/catalog", 
      alt: "Скидки"
    },
    {
      id: 3,
      title: "ИНДИВИДУАЛЬНЫЙ ЗАКАЗ",
      imageDesktop: "/banners/Banner4-1.jpg", 
      imageMobile: "/banners/Banner4-2.webp",  
      link: "https://t.me/TIGRSHOPsupport", 
      alt: "Индивидуальный заказ"
    },
    {
      id: 4,
      title: "ШИРОКИЙ АССОРТИМЕНТ ОРИГИНАЛЬНЫХ БРЕНДОВ",
      imageDesktop: "/banners/Banner1-1.jpg", 
      imageMobile: "/banners/Banner1-2.webp",  
      link: "/catalog", 
      alt: "Каталог"
    },
    {
      id: 5,
      title: "ОПТОВЫЙ ЗАКАЗ",
      imageDesktop: "/banners/Banner5-1.jpg", 
      imageMobile: "/banners/Banner5-2.webp",  
      link: "https://t.me/TIGRSHOPsupport", 
      alt: "Индивидуальный заказ"
    }
  ];

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    if (!isPaused) {
      const timer = setInterval(() => {
        nextSlide();
      }, 7000); 

      return () => clearInterval(timer);
    }
  }, [currentSlide, isPaused]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        nextSlide();
      } else if (event.key === 'ArrowLeft') {
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleBannerClick = (link: string) => {
    console.log(`Клик по баннеру: ${link}`);
    window.location.href = link;
  };

  return (
    <section 
      id="hero-slider"
      className="relative w-full overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ 
        touchAction: 'pan-y pinch-zoom' // Разрешаем только вертикальный скролл и zoom
      }}
    >
      <div 
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="w-full flex-shrink-0 relative cursor-pointer"
            onClick={() => handleBannerClick(slide.link)}
          >
            <div className="w-full relative">
              <img
                src={slide.imageDesktop}
                alt={slide.alt}
                className="hidden md:block w-full h-auto object-cover object-center"
                onLoad={() => console.log('Загружено десктоп:', slide.imageDesktop)}
                onError={(e) => {
                  console.error('Ошибка загрузки десктоп:', slide.imageDesktop);
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
              />
              
              <img
                src={slide.imageMobile}
                alt={slide.alt}
                className="block md:hidden w-full h-auto object-contain object-center"
                onLoad={() => console.log('Загружено мобильное:', slide.imageMobile)}
                onError={(e) => {
                  console.error('Ошибка загрузки мобильное:', slide.imageMobile);
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Кнопки навигации слайдера */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              goToSlide(index);
            }}
            className={`transition-all duration-300 bg-white rounded-sm hover:opacity-80 ${
              currentSlide === index 
                ? 'w-[100px] h-[10px]' // Активный слайд - полоска
                : 'w-[10px] h-[10px]'  // Неактивные слайды - точки
            }`}
            style={{
              opacity: currentSlide === index ? 1 : 0.6
            }}
            aria-label={`Перейти к слайду ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;