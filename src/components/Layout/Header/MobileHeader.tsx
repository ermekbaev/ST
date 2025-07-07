'use client';

import React, { useState, useEffect, useCallback } from 'react';

const MobileHeader: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Блокировка скролла при открытом мобильном меню
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
  }, [isMobileMenuOpen]);

  const handleSearchSubmit = useCallback((e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    console.log('Поиск:', searchQuery);
  }, [searchQuery]);

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Escape') {
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  }, []);

  return (
    <>
      <header className="w-full bg-white border-b border-gray-200 relative z-40">
        <div className="flex w-full h-[80px] items-center justify-between px-4 relative">
          {/* Логотип */}
          <div className="flex-shrink-0 z-50">
            <img src="/icons/TS_logo.svg" alt="Tigr Shop" className="w-[24px] h-[37px]" />
          </div>

          {/* Поисковая строка - расширяется от иконки поиска на всю ширину */}
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
                placeholder="введите название товара"
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
              <img src="/icons/TS_logo.svg" alt="Tigr Shop" className="w-[24px] h-[37px]" />
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

          {/* Список меню */}
          <div className="pt-0">
            {mobileMenuItems.map((item: string, index: number) => (
              <div key={index} className="border-b border-gray-100">
                <a 
                  href="#" 
                  className="flex items-center justify-between px-6 py-4 text-brand-dark hover:bg-gray-50 transition-colors"
                  style={{
                    fontFamily: 'Random Grotesque, Arial, sans-serif',
                    fontSize: '16px',
                    fontWeight: 400
                  }}
                  onClick={() => {
                    console.log(`Клик по ${item}`);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <span>{item}</span>
                  <div className="w-2 h-2">
                    <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.5 1L6.5 6L1.5 11" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileHeader;