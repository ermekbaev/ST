'use client';

import React, { useState, useEffect, useCallback, JSX } from 'react';
import { useCart } from '../../../contexts/CartContext';

interface MegaMenuData {
  title: string;
  categories: string[];
  subcategories: string[];
  additional?: string[];
}

type MenuKey = 'обувь' | 'одежда' | 'аксессуары' | 'коллекции';

const DesktopHeader: React.FC = () => {
  const [mounted, setMounted] = useState<boolean>(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { totalItems } = useCart();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const megaMenuData: Record<MenuKey, MegaMenuData> = {
    'обувь': {
      title: 'ОБУВЬ',
      categories: [
        'все',
        'кеды и кроссовки',
        'ботинки и угги',
        'слэды',
        'детская обувь'
      ],
      subcategories: [
        'новые релизы',
        'эксклюзивы',
        'мастхэв',
        'хиты продаж',
        'коллаборации'
      ]
    },
    'одежда': {
      title: 'ОДЕЖДА',
      categories: [
        'все',
        'куртки и пуховики',
        'футболки и лонгсливы',
        'штаны и джинсы',
        'шорты'
      ],
      subcategories: [
        'худи и свитшоты',
        'другая одежда'
      ],
      additional: [
        'новые релизы',
        'эксклюзивы',
        'мастхэв',
        'хиты продаж',
        'коллаборации'
      ]
    },
    'аксессуары': {
      title: 'АКСЕССУАРЫ',
      categories: [
        'все',
        'белье',
        'головные уборы',
        'рюкзаки и сумки',
        'кошельки'
      ],
      subcategories: [
        'очки',
        'другие аксессуары'
      ],
      additional: [
        'новые релизы',
        'эксклюзивы',
        'мастхэв',
        'хиты продаж',
        'коллаборации'
      ]
    },
    'коллекции': {
      title: 'КОЛЛЕКЦИИ',
      categories: [
        'все',
        'другие аксессуары',
        'фигурки',
        'предметы интерьера',
        'другое всё'
      ],
      subcategories: [
        'новые релизы',
        'эксклюзивы',
        'мастхэв',
        'хиты продаж',
        'коллаборации'
      ]
    }
  };
  
  const menuItems: string[] = [
    'sale',
    'обувь', 
    'одежда',
    'аксессуары',
    'коллекции',
    'другое',
    'бренды',
    'информация'
  ];

  const handleMenuEnter = useCallback((item: string): void => {
    if (megaMenuData[item as MenuKey] && !isSearchOpen) {
      setActiveMenu(item);
    }
  }, [isSearchOpen]);

  const handleMenuLeave = useCallback((): void => {
    if (!isSearchOpen) {
      setActiveMenu(null);
    }
  }, [isSearchOpen]);

  const handleSearchToggle = useCallback((): void => {
    setIsSearchOpen(!isSearchOpen);
    setActiveMenu(null); 
    if (!isSearchOpen) {
      setTimeout(() => {
        const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
        if (searchInput) {
          searchInput.focus();
        }
      }, 300);
    } else {
      setSearchQuery(''); 
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = useCallback((e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    console.log('Поиск:', searchQuery);
    // Здесь будет логика поиска
  }, [searchQuery]);

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Escape') {
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  }, []);

  const getMenuPosition = useCallback((): React.CSSProperties => {
    if (!activeMenu) return {};
    
    const activeIndex = menuItems.indexOf(activeMenu);
    
    const centerOffset = (activeIndex - 3.5) * 120 + 200; // увеличили до +200px вправо
    
    return {
      transform: `translateX(${centerOffset}px)`
    };
  }, [activeMenu, menuItems]);

  const renderMegaMenu = (): JSX.Element | null => {
    if (!activeMenu || !megaMenuData[activeMenu as MenuKey]) {
      return null;
    }

    const menuData = megaMenuData[activeMenu as MenuKey];

    return (
      <div 
        className="absolute top-full left-0 w-full bg-brand-beige z-50 animate-slide-down"
        onMouseEnter={() => setActiveMenu(activeMenu)}
        onMouseLeave={handleMenuLeave}
        style={{
          // Добавляем небольшой отрицательный margin-top чтобы убрать промежуток
          marginTop: '-1px'
        }}
      >
        <div className="w-full py-12">
          <div 
            className="w-[800px] mx-auto px-16"
            style={getMenuPosition()}
          >
            <div className="mb-16">
              <div className="flex items-start">
                <h3 className="brand-text-large text-4xl text-brand-dark mr-8 italic min-w-[200px]">
                  {menuData.title}
                </h3>
                <div className="flex-1">
                  <div className="w-full h-px bg-brand-dark mb-8 mt-6"></div>
                  <div className="grid grid-cols-2 gap-x-16 gap-y-3">
                    {menuData.categories.map((category: string, index: number) => (
                      <a
                        key={index}
                        href="#"
                        className="text-brand-dark hover:text-brand-gray transition-colors text-base font-medium tracking-wide font-heading"
                      >
                        {category}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-start">
                <h3 className="brand-text-large text-4xl text-brand-dark mr-8 italic min-w-[200px]">
                  КАТЕГОРИЯ
                </h3>
                <div className="flex-1">
                  <div className="w-full h-px bg-brand-dark mb-8 mt-6"></div>
                  <div className="grid grid-cols-2 gap-x-16 gap-y-3">
                    {menuData.subcategories.map((subcategory: string, index: number) => (
                      <a
                        key={index}
                        href="#"
                        className="text-brand-dark hover:text-brand-gray transition-colors text-base font-medium tracking-wide font-heading"
                      >
                        {subcategory}
                      </a>
                    ))}
                    {menuData.additional && menuData.additional.map((item: string, index: number) => (
                      <a
                        key={`additional-${index}`}
                        href="#"
                        className="text-brand-dark hover:text-brand-gray transition-colors text-base font-medium tracking-wide font-heading"
                      >
                        {item}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 relative">
      <div className="w-full h-[120px] flex items-center justify-between px-[139px]">
        {/* Логотип */}
        <div className="flex-shrink-0">
          <img src="/icons/TS_logo.svg" alt="Tigr Shop" className="w-[37px] h-[58px]" />
        </div>

        {/* Навигация - точно по центру */}
        {/* ВАЖНО: Убираем onMouseLeave с nav - теперь только на самом мега-меню */}
        <nav className="flex-shrink-0 relative">
          {/* Поисковая строка - анимация справа налево */}
          <div 
            className={`absolute top-1/2 right-0 transform -translate-y-1/2 h-10 flex items-center transition-all duration-500 ease-in-out z-20 ${
              isSearchOpen ? 'w-full opacity-100' : 'w-0 opacity-0'
            } overflow-hidden`}
          >
            <form onSubmit={handleSearchSubmit} className="w-full">
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="введите название товара"
                className="w-full h-10 px-4 bg-brand-beige text-brand-dark placeholder-brand-gray focus:outline-none rounded-full text-sm border-0 brand-text-small"
                style={{ border: 'none', outline: 'none' }}
              />
            </form>
          </div>

          <ul className={`flex items-center gap-8 text-sm text-brand-dark h-[27px] transition-opacity duration-300 ${
            isSearchOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}>
            {menuItems.map((item: string, index: number) => (
              <li 
                key={index}
                onMouseEnter={() => handleMenuEnter(item)}
                // Убираем onMouseLeave с отдельных пунктов меню
              >
                <a 
                  href="#" 
                  className={`hover:text-brand-gray transition-colors duration-200 uppercase font-heading font-medium tracking-wide ${
                    activeMenu === item ? 'text-brand-gray' : ''
                  }`}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Иконки */}
        <div className="flex items-center gap-6 flex-shrink-0 relative z-30">
          <div 
            className="cursor-pointer hover:opacity-70 transition-opacity duration-200 hover-lift"
            onClick={handleSearchToggle}
          >
            <img src="/icons/search.svg" alt="Поиск" className="w-6 h-6" />
          </div>
          <div className="cursor-pointer hover:opacity-70 transition-opacity duration-200 relative hover-lift">
            <img src="/icons/cart.svg" alt="Корзина" className="w-6 h-6" />
            {/* Показываем счетчик только после монтирования */}
            {mounted && totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold font-price">
                {totalItems}
              </span>
            )}
          </div>
          <div className="cursor-pointer hover:opacity-70 transition-opacity duration-200 hover-lift">
            <img src="/icons/profile.svg" alt="Профиль" className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Мега-меню */}
      {!isSearchOpen && renderMegaMenu()}
    </header>
  );
};

export default DesktopHeader;