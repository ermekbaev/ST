"use client";

import React, { useState, useEffect } from "react";

interface HeroSlide {
  id: number;
  title: string;
  description: string;
  imageDesktop: string;
  imageMobile: string;
  alt: string;
  link: string;
  isActive: boolean;
  order: number;
}

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  // Дефолтные слайды
  const defaultSlides: HeroSlide[] = [
    {
      id: 1,
      title: "ДОЛЯМИ",
      description: "До-Ля-Ми",
      imageDesktop: "/banners/Banner2-1.jpg",
      imageMobile: "/banners/Banner2-2.webp",
      alt: "До-Ля-Ми",
      link: "/catalog",
      isActive: true,
      order: 1,
    },
    {
      id: 2,
      title: "100500",
      description: "Скидки",
      imageDesktop: "/banners/Banner3-1.jpg",
      imageMobile: "/banners/Banner3-2.webp",
      alt: "Скидки",
      link: "/catalog",
      isActive: true,
      order: 2,
    },
    {
      id: 3,
      title: "ИНДИВИДУАЛЬНЫЙ ЗАКАЗ",
      description: "Индивидуальный заказ",
      imageDesktop: "/banners/Banner4-1.jpg",
      imageMobile: "/banners/Banner4-2.webp",
      alt: "Индивидуальный заказ",
      link: "https://t.me/TIGRSHOPsupport",
      isActive: true,
      order: 3,
    },
    {
      id: 4,
      title: "ШИРОКИЙ АССОРТИМЕНТ ОРИГИНАЛЬНЫХ БРЕНДОВ",
      description: "Каталог",
      imageDesktop: "/banners/Banner1-1.jpg",
      imageMobile: "/banners/Banner1-2.webp",
      alt: "Каталог",
      link: "/catalog",
      isActive: true,
      order: 4,
    },
    {
      id: 5,
      title: "ОПТОВЫЙ ЗАКАЗ",
      description: "Оптовый заказ",
      imageDesktop: "/banners/Banner5-1.jpg",
      imageMobile: "/banners/Banner5-2.webp",
      alt: "Оптовый заказ",
      link: "https://t.me/TIGRSHOPsupport",
      isActive: true,
      order: 5,
    },
  ];

  const [slides, setSlides] = useState<HeroSlide[]>(defaultSlides);

  // Загружаем heroes из API
  useEffect(() => {
    const loadHeroes = async () => {
      try {
        setLoading(true);

        const response = await fetch("/api/slider", {
          method: "GET",
          cache: "no-store",
        });
      } catch (error) {
        console.error("❌ Ошибка загрузки heroes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHeroes();
  }, []);

  // Touch события
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

  // Навигация
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Автопрокрутка
  useEffect(() => {
    if (!isPaused && slides.length > 1) {
      const timer = setInterval(() => {
        nextSlide();
      }, 7000);

      return () => clearInterval(timer);
    }
  }, [currentSlide, isPaused, slides.length]);

  // Клавиатура
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (slides.length === 0) return;

      if (event.key === "ArrowRight") {
        nextSlide();
      } else if (event.key === "ArrowLeft") {
        prevSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length]);

  // Клик по слайду
  const handleSlideClick = (link: string) => {
    if (link) {
      window.location.href = link;
    }
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
        touchAction: "pan-y pinch-zoom",
      }}
    >
      {/* Индикатор загрузки */}
      {loading && (
        <div className="absolute top-2 right-2 z-30 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
          Загрузка heroes...
        </div>
      )}

      {/* Слайды */}
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="w-full flex-shrink-0 relative cursor-pointer"
            onClick={() => handleSlideClick(slide.link)}
          >
            <div className="w-full relative">
              {/* Десктопное изображение */}
              <img
                src={slide.imageDesktop}
                alt={slide.alt}
                className="hidden md:block w-full h-auto object-cover object-center"
              />

              {/* Мобильное изображение */}
              <img
                src={slide.imageMobile}
                alt={slide.alt}
                className="block md:hidden w-full h-auto object-contain object-center"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Навигационные точки */}
      {slides.length > 1 && (
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
                  ? "w-[100px] h-[10px]"
                  : "w-[10px] h-[10px]"
              }`}
              style={{
                opacity: currentSlide === index ? 1 : 0.6,
              }}
              aria-label={`Слайд ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Стрелки навигации */}
      {slides.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full p-2 transition-all duration-200 opacity-0 group-hover:opacity-100 z-20"
            aria-label="Предыдущий слайд"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full p-2 transition-all duration-200 opacity-0 group-hover:opacity-100 z-20"
            aria-label="Следующий слайд"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </>
      )}
    </section>
  );
};

export default HeroSlider;
