'use client';

import React, { useState, useEffect } from 'react';

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Данные слайдов с десктопными и мобильными версиями
  const slides = [
    {
      id: 1,
      title: "ШИРОКИЙ АССОРТИМЕНТ ОРИГИНАЛЬНЫХ БРЕНДОВ",
      imageDesktop: "/banners/banner1-1.png", // десктоп версия
      imageMobile: "/banners/Banner1-2.png",  // мобильная версия
      link: "/catalog", // заглушка ссылки
      alt: "Широкий ассортимент оригинальных брендов"
    },
    {
      id: 2,
      title: "ШИРОКИЙ АССОРТИМЕНТ ОРИГИНАЛЬНЫХ БРЕНДОВ",
      imageDesktop: "/banners/Banner2-1.png", // десктоп версия
      imageMobile: "/banners/Banner2-2.png",  // мобильная версия
      link: "/catalog/sneakers", // заглушка ссылки
      alt: "Ассортимент кроссовок"
    },
    {
      id: 3,
      title: "ИНДИВИДУАЛЬНЫЙ ЗАКАЗ",
      imageDesktop: "/banners/Banner3-1.webp", // десктоп версия
      imageMobile: "/banners/Banner3-2.webp",  // мобильная версия
      link: "/custom-order", // заглушка ссылки
      alt: "Индивидуальный заказ"
    }
  ];

  // Переключение слайдов
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Автосмена слайдов каждые 10 секунд
  useEffect(() => {
    if (!isPaused) {
      const timer = setInterval(() => {
        nextSlide();
      }, 10000); // 10 секунд

      return () => clearInterval(timer);
    }
  }, [currentSlide, isPaused]);

  // Управление клавиатурой
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

  // Управление колесиком мыши
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      const heroElement = document.getElementById('hero-slider');
      if (heroElement && heroElement.contains(event.target as Node)) {
        event.preventDefault();
        if (event.deltaY > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // Обработчик клика по баннеру
  const handleBannerClick = (link: string) => {
    // Пока заглушка - просто логируем
    console.log(`Клик по баннеру: ${link}`);
    // Позже заменим на: window.location.href = link;
  };

  return (
    <section 
      id="hero-slider"
      className="relative w-full h-[500px] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Слайды */}
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="w-full h-full flex-shrink-0 relative cursor-pointer"
            onClick={() => handleBannerClick(slide.link)}
          >
            {/* Адаптивные изображения */}
            <div className="w-full h-full relative">
              {/* Десктопное изображение (показывать на экранах >= 768px) */}
              <img
                src={slide.imageDesktop}
                alt={slide.alt}
                className="hidden md:block w-full h-full object-cover"
                onLoad={() => console.log('Загружено десктоп:', slide.imageDesktop)}
              />
              
              {/* Мобильное изображение (показывать на экранах < 768px) */}
              <img
                src={slide.imageMobile}
                alt={slide.alt}
                className="block md:hidden w-full h-full object-cover"
                onLoad={() => console.log('Загружено мобильное:', slide.imageMobile)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Невидимые области для ручного переключения */}
      <div 
        className="absolute left-0 top-0 w-20 h-full z-10 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
        title="Предыдущий слайд"
      ></div>
      <div 
        className="absolute right-0 top-0 w-20 h-full z-10 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          nextSlide();
        }}
        title="Следующий слайд"
      ></div>
    </section>
  );
};

export default HeroSlider;