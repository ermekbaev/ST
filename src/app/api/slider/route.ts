// src/app/api/slider/route.ts
import { NextResponse } from "next/server";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export interface SliderSlide {
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

export async function GET() {
  try {
    // Запрос к heroes API с populate для медиа
    const url = `${STRAPI_URL}/api/heroes?populate=*&sort=order:asc`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`❌ Ошибка Heroes API: ${response.status}`);
      const errorText = await response.text();
      throw new Error(`Heroes API error: ${response.status}`);
    }

    const data = await response.json();

    const rawHeroes = data.data || [];

    // Обработка данных heroes
    const slides: SliderSlide[] = rawHeroes
      .filter((hero: any) => {
        // isActive может быть null, считаем это как true
        const isActive = hero.isActive !== false;
        return isActive;
      })
      .map((hero: any) => {
        // Функция для получения URL изображения
        const getImageUrl = (imageField: any, fallback: string) => {
          if (!imageField) {
            return fallback;
          }

          // Прямой URL из объекта изображения
          if (imageField.url) {
            const url = `${STRAPI_URL}${imageField.url}`;
            return url;
          }

          return fallback;
        };

        const desktopImage = getImageUrl(
          hero.imageDesktop,
          "/banners/Banner1-1.jpg"
        );
        const mobileImage = getImageUrl(
          hero.imageMobile,
          "/banners/Banner1-2.webp"
        );

        const processedHero = {
          id: hero.id,
          title: hero.title || "",
          description: hero.description || "",
          imageDesktop: desktopImage,
          imageMobile: mobileImage,
          alt:
            hero.imageDesktop?.alternativeText ||
            hero.title ||
            "Hero изображение",
          link: hero.link || "/",
          isActive: hero.isActive !== false,
          order: hero.order || 0,
        };

        return processedHero;
      })
      .sort((a: SliderSlide, b: SliderSlide) => a.order - b.order);

    return NextResponse.json({
      success: true,
      slides,
      total: slides.length,
      source: "strapi-heroes",
      strapiUrl: STRAPI_URL,
    });
  } catch (error) {
    console.error("❌ Ошибка при работе с Heroes API:", error);
    return getFallbackResponse();
  }
}

function getFallbackResponse() {
  const defaultSlides: SliderSlide[] = [
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

  return NextResponse.json({
    success: false,
    slides: defaultSlides,
    error: "Strapi недоступен - показываем дефолтные слайды",
    total: defaultSlides.length,
    source: "fallback",
  });
}
