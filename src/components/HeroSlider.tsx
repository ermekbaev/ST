'use client';

import React, { useState, useEffect } from 'react';

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = [
    {
      id: 1,
      title: "ШИРОКИЙ АССОРТИМЕНТ ОРИГИНАЛЬНЫХ БРЕНДОВ",
      imageDesktop: "/banners/banner1-1.png", 
      imageMobile: "/banners/Banner1-2.png",  
      link: "/catalog", 
      alt: "Широкий ассортимент оригинальных брендов"
    },
    {
      id: 2,
      title: "ШИРОКИЙ АССОРТИМЕНТ ОРИГИНАЛЬНЫХ БРЕНДОВ",
      imageDesktop: "/banners/Banner2-1.png", 
      imageMobile: "/banners/Banner2-2.png",  
      link: "/catalog/sneakers", 
      alt: "Ассортимент кроссовок"
    },
    {
      id: 3,
      title: "ИНДИВИДУАЛЬНЫЙ ЗАКАЗ",
      imageDesktop: "/banners/Banner3-1.webp", 
      imageMobile: "/banners/Banner3-2.webp",  
      link: "https://t.me/TIGRSHOPsupport", 
      alt: "Индивидуальный заказ"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Автосмена слайдов раз в 10 секунд
  useEffect(() => {
    if (!isPaused) {
      const timer = setInterval(() => {
        nextSlide();
      }, 10000); 

      return () => clearInterval(timer);
    }
  }, [currentSlide, isPaused]);

  // Управление клавиатурой (стрелки влево/вправо)
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

  // Обработчик клика по баннеру
  const handleBannerClick = (link: string) => {
    // Заглушка
    console.log(`Клик по баннеру: ${link}`);
    // Позже заменить на: window.location.href = link;
  };

  return (
    <section 
      id="hero-slider"
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
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
              {/* Десктопное изображение (показываются на экранах >= 768px) */}
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
              
              {/* Мобильное изображение (показываются на экранах < 768px) */}
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

      {/* Невидимые области для ручного переключения - только на десктопе */}
      <div 
        className="hidden md:block absolute left-0 top-0 w-20 h-full z-10 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
        title="Предыдущий слайд"
      ></div>
      <div 
        className="hidden md:block absolute right-0 top-0 w-20 h-full z-10 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          nextSlide();
        }}
        title="Следующий слайд"
      ></div>

      {/* Стрелки навигации - только на десктопе при ховере */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
        className="hidden md:flex absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/20 hover:bg-black/40 text-white rounded-full items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20"
        aria-label="Предыдущий слайд"
      >
        ←
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          nextSlide();
        }}
        className="hidden md:flex absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/20 hover:bg-black/40 text-white rounded-full items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20"
        aria-label="Следующий слайд"
      >
        →
      </button>
    </section>
  );
};

export default HeroSlider;