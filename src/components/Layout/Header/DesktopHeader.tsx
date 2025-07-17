'use client';

import React, { useState, useEffect, useCallback, JSX } from 'react';
import { useCart } from '../../../contexts/CartContext';
import AuthModal from '../../Auth/AuthModal'; // 🆕 Импорт компонента

interface MegaMenuData {
  title: string;
  categories: string[];
  subcategories: string[];
  additional?: string[];
  links?: Record<string, string>; 
}

type MenuKey = 'обувь' | 'одежда' | 'аксессуары' | 'коллекции' | 'информация';

const DesktopHeader: React.FC = () => {
  const [mounted, setMounted] = useState<boolean>(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false); // 🆕 Состояние для модального окна
  const { totalItems, toggleCart } = useCart();
  
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
    },
    'информация': {
      title: 'ИНФОРМАЦИЯ',
      categories: [
        'контакты',
        'доставка', 
        'возврат',
        'оплата',
        'FAQ',
        'о нас'
      ],
      links: {  
        'контакты': '/contacts',
        'доставка': '/delivery',
        'возврат': '/returns', 
        'оплата': '/payment',
        'FAQ': '/faq',
        'о нас': '/about'
      },
      subcategories: [] 
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

  // Обработчики для мега-меню
  const handleMenuEnter = useCallback((item: string): void => {
    if (item === 'sale') return;
    setActiveMenu(item);
  }, []);

  const handleMenuLeave = useCallback((): void => {
    setTimeout(() => {
      setActiveMenu(null);
    }, 100);
  }, []);

  // Обработчики для поиска
  const handleSearchToggle = useCallback((): void => {
    setIsSearchOpen(prev => !prev);
  }, []);

  useEffect(() => {
    if (isSearchOpen) {
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

  const handleSearchSubmit = useCallback((e: React.KeyboardEvent<HTMLInputElement>): void => {
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

  const handleCartClick = useCallback((): void => {
    toggleCart();
  }, [toggleCart]);

  // 🆕 Обработчик клика по иконке профиля
  const handleProfileClick = useCallback((): void => {
    setShowAuthModal(true);
  }, []);

  // 🆕 Обработчик закрытия модального окна
  const handleCloseAuthModal = useCallback((): void => {
    setShowAuthModal(false);
  }, []);

  // Обработчик клика по элементам навигации
  const handleNavClick = useCallback((item: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    if (item === 'sale') {
      e.preventDefault();
      window.location.href = '/catalog';
      return;
    }
    
    if (item === 'информация') {
      return;
    }
    
    e.preventDefault();
    console.log(`Клик по навигации: ${item}`);
  }, []);

  const getMenuPosition = useCallback((): React.CSSProperties => {
    if (!activeMenu) return {};
    
    const activeIndex = menuItems.indexOf(activeMenu);
    
    const getOffset = () => {
      const screenWidth = window.innerWidth;
      
      if (screenWidth >= 1400) {
        if (activeIndex === menuItems.length - 1) {
          return (activeIndex - 3.5) * 120 + 50;
        } else {
          return (activeIndex - 3.5) * 120 + 200;
        }
      } else if (screenWidth >= 1200) {
        if (activeIndex === menuItems.length - 1) {
          return (activeIndex - 3.5) * 100 + 30;
        } else {
          return (activeIndex - 3.5) * 100 + 150;
        }
      } else {
        if (activeIndex === menuItems.length - 1) {
          return (activeIndex - 3.5) * 80 + 10;
        } else {
          return (activeIndex - 3.5) * 80 + 100;
        }
      }
    };
    
    return {
      transform: `translateX(${getOffset()}px)`,
      maxWidth: 'calc(100vw - 40px)',
      left: '50%',
      marginLeft: '-400px',
      marginRight: '20px'
    };
  }, [activeMenu, menuItems]);

  const renderMegaMenu = (): JSX.Element | null => {
    if (!activeMenu || !megaMenuData[activeMenu as MenuKey]) {
      return null;
    }

    const menuData = megaMenuData[activeMenu as MenuKey];

    return (
      <div 
        className="absolute top-full left-0 w-full bg-brand-beige z-50 animate-slide-down overflow-hidden"
        onMouseEnter={() => setActiveMenu(activeMenu)}
        onMouseLeave={handleMenuLeave}
        style={{
          marginTop: '-1px'
        }}
      >
        <div className="w-full py-12">
          <div 
            className="relative mx-auto px-4 lg:px-8 xl:px-16"
            style={{
              width: 'min(800px, calc(100vw - 120px))',
              ...getMenuPosition()
            }}
          >
            <div className="mb-8 lg:mb-16">
              <div className="flex items-start flex-col lg:flex-row gap-4 lg:gap-0">
                <h3 className="mega-menu-title text-2xl lg:text-[36px] leading-none min-w-0 lg:min-w-[200px] flex-shrink-0">
                  {menuData.title}
                </h3>
                <div className="flex-1 w-full">
                  <div className="w-full h-0.5 bg-brand-dark mb-4 lg:mb-8 mt-0 lg:mt-6"></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 lg:gap-x-16 gap-y-2 lg:gap-y-3">
                    {menuData.categories.map((category: string, index: number) => (
                      <a
                        key={index}
                        href={menuData.links?.[category] || '#'}
                        className="mega-menu-link text-sm lg:text-base"
                      >
                        {category}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {activeMenu !== 'информация' && (
              <div>
                <div className="flex items-start flex-col lg:flex-row gap-4 lg:gap-0">
                  <h3 className="mega-menu-title text-2xl lg:text-[36px] leading-none min-w-0 lg:min-w-[200px] flex-shrink-0">
                    КАТЕГОРИЯ
                  </h3>
                  <div className="flex-1 w-full">
                    <div className="w-full h-0.5 bg-brand-dark mb-4 lg:mb-8 mt-0 lg:mt-6"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 lg:gap-x-16 gap-y-2 lg:gap-y-3">
                      {menuData.subcategories.map((subcategory: string, index: number) => (
                        <a
                          key={index}
                          href="#"
                          className="mega-menu-link text-sm lg:text-base"
                        >
                          {subcategory}
                        </a>
                      ))}
                      {menuData.additional && menuData.additional.map((item: string, index: number) => (
                        <a
                          key={`additional-${index}`}
                          href="#"
                          className="mega-menu-link text-sm lg:text-base"
                        >
                          {item}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 relative">
      <div className="w-full h-[120px] flex items-center justify-between px-4 sm:px-8 lg:px-16 xl:px-[139px]">
        {/* Логотип */}
        <div className="flex-shrink-0">
          <a href="/">
            <img src="/icons/TS_logo.svg" alt="Tigr Shop" className="w-[37px] h-[58px]" />
          </a>
        </div>

        {/* Навигация */}
        <nav className="flex-shrink-0 relative">
          {/* Поисковая строка */}
          <div 
            className={`absolute top-1/2 right-0 transform -translate-y-1/2 h-10 flex items-center transition-all duration-500 ease-in-out z-20 ${
              isSearchOpen ? 'w-[300px] lg:w-[400px] opacity-100' : 'w-0 opacity-0'
            }`}
            style={{ 
              overflow: 'hidden',
              backgroundColor: 'white'
            }}
          >
            <div className="w-full h-full flex items-center">
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit(e as any);
                  }
                  handleSearchKeyDown(e);
                }}
                placeholder="Поиск..."
                className="w-full h-full px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
                style={{
                  fontFamily: 'Random Grotesque, Arial, sans-serif'
                }}
              />
            </div>
          </div>

          {/* Основное меню навигации */}
          <ul 
            className={`flex items-center gap-6 lg:gap-8 h-[27px] transition-opacity duration-300 m-0 p-0 list-none ${
              isSearchOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            {menuItems.map((item: string, index: number) => (
              <li key={index} className="relative">
                <a
                  href={item === 'sale' ? '/catalog' : '#'}
                  className="nav-link text-xs lg:text-sm xl:text-base"
                  onMouseEnter={() => handleMenuEnter(item)}
                  onMouseLeave={handleMenuLeave}
                  onClick={(e) => handleNavClick(item, e)}
                  style={{
                    fontFamily: 'Random Grotesque, Arial, sans-serif',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {item.toUpperCase()}
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
          <div 
            className="cursor-pointer hover:opacity-70 transition-opacity duration-200 relative hover-lift"
            onClick={handleCartClick}
          >
            <img src="/icons/cart.svg" alt="Корзина" className="w-6 h-6" />
            {mounted && totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold font-price">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </div>
          {/* 🆕 Иконка профиля с обработчиком клика */}
          <div 
            className="cursor-pointer hover:opacity-70 transition-opacity duration-200 hover-lift"
            onClick={handleProfileClick}
          >
            <img src="/icons/profile.svg" alt="Профиль" className="w-6 h-8" />
          </div>
        </div>
      </div>

      {/* Мега-меню */}
      {renderMegaMenu()}

      {/* 🆕 Модальное окно авторизации - теперь как отдельный компонент */}
      {showAuthModal && (
        <AuthModal onClose={handleCloseAuthModal} />
      )}
    </header>
  );
};

export default DesktopHeader;