// src/app/api/slider/route.ts
import { NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://147.45.161.18:1337';

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
  console.log('🔄 Загрузка heroes из Strapi...');
  console.log('🌐 Strapi URL:', STRAPI_URL);
  
  try {
    // Запрос к heroes API с populate для медиа
    const url = `${STRAPI_URL}/api/heroes?populate=*&sort=order:asc`;
    console.log('📡 Запрос к:', url);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    console.log('📊 Статус ответа:', response.status);

    if (!response.ok) {
      console.error(`❌ Ошибка Heroes API: ${response.status}`);
      const errorText = await response.text();
      console.log('❌ Текст ошибки:', errorText);
      throw new Error(`Heroes API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('📄 Структура ответа Heroes:', JSON.stringify(data, null, 2));
    
    const rawHeroes = data.data || [];
    console.log(`📊 Количество heroes: ${rawHeroes.length}`);

    if (rawHeroes.length === 0) {
      console.log('⚠️ Heroes в Strapi пусто, используем fallback');
    //   return getFallbackResponse();
    }

    // Обработка данных heroes
    const slides: SliderSlide[] = rawHeroes
      .filter((hero: any) => {
        // isActive может быть null, считаем это как true
        const isActive = hero.isActive !== false; 
        console.log(`🔍 Hero ${hero.id} (${hero.title}): isActive = ${hero.isActive} -> ${isActive}`);
        return isActive;
      })
      .map((hero: any) => {
        // В этой структуре данные лежат прямо в объекте, не в attributes
        console.log(`🎨 Обрабатываем hero ${hero.id}:`, {
          title: hero.title,
          imageDesktop: hero.imageDesktop?.url,
          imageMobile: hero.imageMobile?.url
        });

        // Функция для получения URL изображения
        const getImageUrl = (imageField: any, fallback: string) => {
          if (!imageField) {
            console.log(`⚠️ Нет изображения, используем fallback: ${fallback}`);
            return fallback;
          }
          
          // Прямой URL из объекта изображения
          if (imageField.url) {
            const url = `${STRAPI_URL}${imageField.url}`;
            console.log(`✅ Найдено изображение: ${url}`);
            return url;
          }
          
          console.log(`❌ Не удалось обработать изображение:`, imageField);
          return fallback;
        };

        const desktopImage = getImageUrl(hero.imageDesktop, '/banners/Banner1-1.jpg');
        const mobileImage = getImageUrl(hero.imageMobile, '/banners/Banner1-2.webp');

        const processedHero = {
          id: hero.id,
          title: hero.title || '',
          description: hero.description || '',
          imageDesktop: desktopImage,
          imageMobile: mobileImage,
          alt: hero.imageDesktop?.alternativeText || hero.title || 'Hero изображение',
          link: hero.link || '/',
          isActive: hero.isActive !== false,
          order: hero.order || 0
        };

        console.log(`🎨 Обработан hero ${hero.id}:`, {
          title: processedHero.title,
          desktop: processedHero.imageDesktop,
          mobile: processedHero.imageMobile,
          order: processedHero.order
        });

        return processedHero;
      })
      .sort((a: SliderSlide, b: SliderSlide) => a.order - b.order);

    console.log(`✅ Успешно обработано ${slides.length} активных heroes`);

    return NextResponse.json({
      success: true,
      slides,
      total: slides.length,
      source: 'strapi-heroes',
      strapiUrl: STRAPI_URL
    });

  } catch (error) {
    console.error('❌ Ошибка при работе с Heroes API:', error);
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
      order: 1
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
      order: 2
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
      order: 3
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
      order: 4
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
      order: 5
    }
  ];

  console.log(`⚠️ Используем fallback слайды (${defaultSlides.length} шт.)`);
  
  return NextResponse.json({
    success: false,
    slides: defaultSlides,
    error: 'Strapi недоступен - показываем дефолтные слайды',
    total: defaultSlides.length,
    source: 'fallback'
  });
}