'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const MobileHeader: React.FC = () => {
  const router = useRouter(); // ✅ Добавляем useRouter
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const mobileMenuItems: string[] = [
    'sale',
    'обувь',
    'одежда',
    'аксессуары',
    'коллекции',
    'другое',
    'бренды',
    'информация'
  ];

  const menuData: Record<string, any> = {
    'обувь': {
      categories: ['все', 'кроссовки', 'ботинки', 'сандалии', 'туфли', 'угги'],
      links: {
        'все': '/catalog',
        'кеды и кроссовки': '/catalog?categories=Кросовки+и+кеды',
        'ботинки и угги': '/catalog',
        'слэды': '/catalog',
        'детская обувь': '/catalog'
      },
      subcategories: ['новые релизы', 'эксклюзивы', 'мастхэв', 'хиты продаж', 'коллаборации']
    },
    'одежда': {
      categories: ['все', 'футболки', 'толстовки', 'куртки', 'джинсы', 'шорты'],
      links: {
        'все': '/catalog',
        'куртки и пуховики': '/catalog?categories=Пуховики+и+куртки',
        'футболки и лонгсливы': '/catalog?categories=Футболки+и+поло',
        'штаны и джинсы': '/catalog?categories=Штаны+и+брюки',
        'шорты': '/catalog?categories=Шорты',
        'худи и свитшоты': '/catalog?categories=Толстовки+и+свитшоты'
      },
      subcategories: ['новые релизы', 'эксклюзивы', 'мастхэв', 'хиты продаж', 'коллаборации']
    },
    'аксессуары': {
      categories: ['все', 'сумки', 'шапки', 'очки', 'часы', 'украшения'],
      links: {
        'все': '/catalog?categories=Аксессуары',
        'белье': '/catalog',
        'головные уборы': '/catalog',
        'рюкзаки и сумки': '/catalog?categories=Сумки+и+рюкзаки',
        'кошельки': '/catalog'
      },
      subcategories: ['новые релизы', 'эксклюзивы', 'мастхэв', 'хиты продаж', 'коллаборации']
    },
    'коллекции': {
      categories: ['все', 'другие аксессуары', 'фигурки', 'предметы интерьера', 'другое всё'],
      links: {
        'все': '/catalog?categories=Коллекция',
        'другие аксессуары': '/catalog',
        'фигурки': '/catalog',
        'предметы интерьера': '/catalog',
        'другое всё': '/catalog'
      },
      subcategories: ['новые релизы', 'эксклюзивы', 'мастхэв', 'хиты продаж', 'коллаборации']
    },
    'другое': {
      categories: ['все', 'электроника', 'товары для дома', 'спорт и отдых', 'красота и здоровье'],
      subcategories: ['новые релизы', 'эксклюзивы', 'мастхэв', 'хиты продаж', 'коллаборации']
    },
    'бренды': {
      categories: ['все', 'nike', 'adidas', 'puma', 'reebok'],
      links: {
        'все': '/catalog',
        'nike': '/catalog?brands=Nike',
        'adidas': '/catalog?brands=Adidas',
        'puma': '/catalog?brands=Puma',
        'reebok': '/catalog?brands=Reebok'
      },
      subcategories: ['новые релизы', 'эксклюзивы', 'мастхэв', 'хиты продаж', 'коллаборации']
    },
    'информация': {
      links: [
        { name: 'контакты', href: '/contacts' },
        { name: 'доставка', href: '/delivery' },
        { name: 'возврат', href: '/returns' },
        { name: 'оплата', href: '/payment' },
        { name: 'FAQ', href: '/faq' },
        { name: 'о нас', href: '/about' }
      ]
    }
  };

  const buildCatalogUrl = (searchTerm: string) => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) {
      params.append('search', searchTerm.trim());
    }
    return `/catalog${params.toString() ? `?${params.toString()}` : ''}`;
  };

  const handleSearchToggle = useCallback((): void => {
    setIsSearchOpen(!isSearchOpen);
    setIsMobileMenuOpen(false);
    
    if (!isSearchOpen) {
      setTimeout(() => {
        const searchInput = document.getElementById('mobile-search-input') as HTMLInputElement | null;
        if (searchInput) {
          searchInput.focus();
        }
      }, 300);
    } else {
      setSearchQuery(''); 
    }
  }, [isSearchOpen]);

  const handleMobileMenuToggle = useCallback((): void => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsSearchOpen(false);
    setOpenSection(null); // Сбрасываем открытые секции
  }, [isMobileMenuOpen]);

  const handleSearchSubmit = useCallback((e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('🔍 Mobile поиск из хедера:', searchQuery.trim());
      const url = buildCatalogUrl(searchQuery);
      router.push(url);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  }, [searchQuery, router]);

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Escape') {
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  }, []);

  const handleMenuItemClick = useCallback((item: string): void => {
    if (item === 'sale') {
      window.location.href = '/catalog';
      setIsMobileMenuOpen(false);
      return;
    }

    if (openSection === item) {
      setOpenSection(null);
    } else {
      setOpenSection(item);
    }
  }, [openSection]);

  const handleLinkClick = useCallback((href: string): void => {
    if (href === '#') return;
    
    if (href.startsWith('/')) {
      router.push(href);
    } else {
      window.location.href = href;
    }
    setIsMobileMenuOpen(false);
  }, [router]);

  return (
    <>
      <header className="w-full bg-white border-b border-gray-200 relative z-40">
        <div className="flex w-full h-[80px] items-center justify-between px-4 relative">
          {/* Логотип */}
          <div className="flex-shrink-0 z-50">
            <a href="/">
              <img src="/icons/TS_logo.svg" alt="Tigr Shop" className="w-[24px] h-[37px]" />
            </a>
          </div>

          {/* ✅ Поисковая строка с рабочим функционалом */}
          <div 
            className="absolute top-1/2 h-[60px] flex items-center transition-all duration-500 ease-in-out z-[90] overflow-hidden"
            style={{
              background: '#E5E0D8',
              borderRadius: '30px',
              left: '10px',
              right: '10px',
              transform: isSearchOpen 
                ? 'translateY(-50%) scaleX(1)' 
                : 'translateY(-50%) scaleX(0)',
              transformOrigin: 'calc(100% - 58px) center',
              opacity: isSearchOpen ? 1 : 0
            }}
          >
            <form onSubmit={handleSearchSubmit} className="w-full px-4 flex items-center">
              <input
                id="mobile-search-input"
                type="text"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="поиск товаров, брендов..."
                className="w-full h-10 bg-transparent text-brand-dark placeholder-brand-gray focus:outline-none text-base border-0"
                style={{ 
                  border: 'none', 
                  outline: 'none',
                  fontFamily: 'Random Grotesque, Arial, sans-serif'
                }}
              />
              {/* Иконка поиска внутри инпута - появляется с задержкой */}
              <div 
                className={`cursor-pointer hover:opacity-70 transition-all duration-300 flex-shrink-0 ${
                  isSearchOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                }`}
                onClick={handleSearchToggle}
                style={{
                  transitionDelay: isSearchOpen ? '300ms' : '0ms' // Задержка появления
                }}
              >
                <img src="/icons/search.svg" alt="Поиск" className="w-5 h-5" />
              </div>
            </form>
          </div>

          {/* Правые иконки */}
          <div className="flex items-center gap-4 flex-shrink-0 z-50">
          {/* Иконка поиска - абсолютно позиционированная */}
            <div 
              className="cursor-pointer hover:opacity-70 transition-all duration-500 ease-in-out relative"
              onClick={handleSearchToggle}
              style={{
                transform: isSearchOpen ? 'translateX(12px)' : 'translateX(0)',
                zIndex: isSearchOpen ? 110 : 60, // Увеличиваем z-index еще больше
              }}
            >
              <img src="/icons/search.svg" alt="Поиск" className="w-5 h-5" />
            </div>

            {/* Бургер меню - 3 полоски */}
            <div 
              className="cursor-pointer hover:opacity-70 transition-opacity duration-200"
              onClick={handleMobileMenuToggle}
            >
              <div className="flex flex-col gap-1">
                <div className="w-6 h-0.5 bg-black transition-transform duration-300"></div>
                <div className="w-6 h-0.5 bg-black transition-transform duration-300"></div>
                <div className="w-6 h-0.5 bg-black transition-transform duration-300"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* МОБИЛЬНОЕ МЕНЮ - Полноэкранное справа */}
      <div 
        className={`fixed top-0 right-0 w-full h-full z-50 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'transform translate-x-0' : 'transform translate-x-full'
        }`}

      >
        {/* Фон меню */}
        <div className="w-full h-full bg-white">
          {/* Хедер мобильного меню */}
          <div className="flex w-full h-[80px] items-center justify-between px-4 border-b border-gray-200">
            {/* Логотип */}
            <div className="flex-shrink-0">
              <a href="/">
                <img src="/icons/TS_logo.svg" alt="Tigr Shop" className="w-[24px] h-[37px]" />
              </a>
            </div>

            {/* Кнопка закрытия - крестик */}
            <div 
              className="cursor-pointer hover:opacity-70 transition-opacity duration-200"
              onClick={handleMobileMenuToggle}
            >
              <div className="w-6 h-6 relative">
                <div className="absolute top-1/2 left-0 w-6 h-0.5 bg-black transform -translate-y-1/2 rotate-45"></div>
                <div className="absolute top-1/2 left-0 w-6 h-0.5 bg-black transform -translate-y-1/2 -rotate-45"></div>
              </div>
            </div>
          </div>

          {/* Скроллируемый контент */}
          <div className="h-[calc(100vh-80px)] overflow-y-auto">
            {/* Список меню */}
            <div className="pt-0">
              {mobileMenuItems.map((item: string, index: number) => (
                <div key={index}>
                  {/* Основной пункт меню */}
                  <div className="border-b border-gray-100">
                    <button 
                      className="w-full flex items-center justify-between px-6 py-4 text-black hover:bg-gray-50 transition-colors text-left"
                      style={{
                        fontFamily: 'Random Grotesque, Arial, sans-serif',
                        fontSize: '16px',
                        fontWeight: 500,
                        textTransform: 'uppercase'
                      }}
                      onClick={() => handleMenuItemClick(item)}
                    >
                      <span>{item}</span>
                      {item !== 'sale' && (
                        <div className={`w-4 h-4 transition-transform duration-300 ${
                          openSection === item ? 'rotate-90' : ''
                        }`}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 18L15 12L9 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Раскрывающаяся секция */}
                  {item !== 'sale' && openSection === item && (
                    <div className="bg-gray-50 border-b border-gray-100 animate-in slide-in-from-top duration-300">
                      {item === 'информация' ? (
                        // Для информации показываем ссылки
                        <div className="px-6 py-4 space-y-3">
                          {menuData[item]?.links?.map((link: any, linkIndex: number) => (
                            <button
                              key={linkIndex}
                              onClick={() => handleLinkClick(link.href)}
                              className="block w-full text-left py-2 px-4 text-black hover:bg-gray-100 rounded transition-colors"
                              style={{
                                fontFamily: 'Random Grotesque, Arial, sans-serif',
                                fontSize: '14px',
                                fontWeight: 400,
                                textTransform: 'capitalize'
                              }}
                            >
                              {link.name}
                            </button>
                          ))}
                        </div>
                      ) : (
                        // Для остальных показываем категории
                        <div className="px-6 py-4">
                          {/* Основные товары */}
                          <div className="mb-6">
                            <h4 
                              className="text-black font-bold mb-3 text-sm uppercase"
                              style={{ fontFamily: 'Random Grotesque, Arial, sans-serif' }}
                            >
                              Все товары
                            </h4>
                            <div className="space-y-2">
                              {menuData[item]?.categories?.map((category: string, catIndex: number) => (
                                <button
                                  key={catIndex}
                                  onClick={() => handleLinkClick('#')}
                                  className="block w-full text-left py-2 px-4 text-black hover:bg-gray-100 rounded transition-colors"
                                  style={{
                                    fontFamily: 'Random Grotesque, Arial, sans-serif',
                                    fontSize: '14px',
                                    fontWeight: 400,
                                    textTransform: 'capitalize'
                                  }}
                                >
                                  {category}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Категории */}
                          <div>
                            <h4 
                              className="text-black font-bold mb-3 text-sm uppercase"
                              style={{ fontFamily: 'Random Grotesque, Arial, sans-serif' }}
                            >
                              Категории
                            </h4>
                            <div className="space-y-2">
                              {menuData[item]?.subcategories?.map((subcategory: string, subIndex: number) => (
                                <button
                                  key={subIndex}
                                  onClick={() => handleLinkClick('#')}
                                  className="block w-full text-left py-2 px-4 text-black hover:bg-gray-100 rounded transition-colors"
                                  style={{
                                    fontFamily: 'Random Grotesque, Arial, sans-serif',
                                    fontSize: '14px',
                                    fontWeight: 400,
                                    textTransform: 'capitalize'
                                  }}
                                >
                                  {subcategory}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileHeader;