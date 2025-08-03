'use client';

import React, { useState, useEffect, useCallback, JSX } from 'react';
import { useCart } from '../../../contexts/CartContext';
import AuthModal from '../../Auth/AuthModal';
import SmartProfileIcon from '@/components/Auth/SmartProfileicon';

interface MegaMenuData {
  title: string;
  categories: string[];
  subcategories: string[];
  additional?: string[];
  links?: Record<string, string>; 
}

type MenuKey = 'обувь' | 'одежда' | 'аксессуары' | 'коллекции' | 'другое' | 'бренды' | 'информация';

const DesktopHeader: React.FC = () => {
  const [mounted, setMounted] = useState<boolean>(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
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
    'другое': {
      title: 'ДРУГОЕ',
      categories: [
        'все',
        'электроника',
        'товары для дома',
        'спорт и отдых',
        'красота и здоровье'
      ],
      subcategories: [
        'новые релизы',
        'эксклюзивы',
        'мастхэв',
        'хиты продаж',
        'коллаборации'
      ]
    },
    'бренды': {
      title: 'БРЕНДЫ',
      categories: [
        'все',
        'nike',
        'adidas',
        'puma',
        'reebok'
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

  // ✅ РАБОЧИЕ ОБРАБОТЧИКИ (из вашего кода)
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

  const handleCartClick = useCallback((): void => {
    toggleCart();
  }, [toggleCart]);

const handleAuthIconClick = () => {
  console.log('Клик по иконке профиля - показываем модальное окно');
  setShowAuthModal(true);
};

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

// Замените функцию getMenuPosition в вашем DesktopHeader.tsx

const getMenuPosition = useCallback((): React.CSSProperties => {
  if (!activeMenu) return {};
  
  const activeIndex = menuItems.indexOf(activeMenu);
  
  // Проверяем ширину экрана
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1400;
  
  let centerOffset;
  
  if (activeIndex === menuItems.length - 1) { // информация
    if (screenWidth >= 1400) {
      centerOffset = (activeIndex - 3.5) * 120 + 50;
    } else if (screenWidth >= 1200) {
      centerOffset = (activeIndex - 3.5) * 100 + 30;
    } else if (screenWidth >= 1024) {
      centerOffset = (activeIndex - 3.5) * 70;
    } else {
      centerOffset = 0; // Центрируем на малых экранах
    }
  } else {
    if (screenWidth >= 1400) {
      centerOffset = (activeIndex - 3.5) * 120 + 200;
    } else if (screenWidth >= 1200) {
      centerOffset = (activeIndex - 3.5) * 100 + 150;
    } else if (screenWidth >= 1024) {
      centerOffset = (activeIndex - 3.5) * 70 + 80;
    } else {
      centerOffset = 0; // Центрируем на малых экранах
    }
  }
  
  // Ограничиваем сдвиг чтобы не выходить за границы
  const maxOffset = Math.max(0, (screenWidth - 600) / 2 - 40);
  const minOffset = -maxOffset;
  centerOffset = Math.max(minOffset, Math.min(maxOffset, centerOffset));
  
  return {
    transform: `translateX(${centerOffset}px)`,
    // Предотвращаем выход за границы экрана
    maxWidth: screenWidth < 900 ? 'calc(100vw - 30px)' : 'calc(100vw - 80px)',
    // Добавляем центрирование по умолчанию
    margin: '0 auto',
    // Ограничиваем ширину контейнера
    width: 'fit-content'
  };
}, [activeMenu, menuItems]);

// И добавьте хук для отслеживания изменения размера экрана
const [screenWidth, setScreenWidth] = useState(1400);

useEffect(() => {
  const handleResize = () => {
    setScreenWidth(window.innerWidth);
  };
  
  if (typeof window !== 'undefined') {
    handleResize(); // Установить начальное значение
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }
}, []);

const renderMegaMenu = (): JSX.Element | null => {
  if (!activeMenu || !megaMenuData[activeMenu as MenuKey]) {
    return null;
  }

  const menuData = megaMenuData[activeMenu as MenuKey];

  return (
    <div 
      className="mega-menu-container"
      onMouseEnter={() => setActiveMenu(activeMenu)}
      onMouseLeave={handleMenuLeave}
    >
      <div className="w-full py-8 lg:py-12">
        <div 
          className="mega-menu-inner w-4xl"
          style={getMenuPosition()}
        >
          <div className="mb-8 lg:mb-16">
            <div className="flex">
              <h3 className="mega-menu-title ">
                {menuData.title}
              </h3>
              <div className="">
                <div className="w-full h-0.5 bg-brand-dark mb-4 lg:mb-8 lg:mt-6 ml-5"></div>
                <div className="ml-5 grid grid-cols-2">
                  {menuData.categories.map((category: string, index: number) => (
                    <a
                      key={index}
                      href={menuData.links?.[category] || '#'}
                      className="mega-menu-link"
                    >
                      {category}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Секция КАТЕГОРИЯ только если это НЕ информация */}
          {activeMenu !== 'информация' && (
            <div>
              <div className="flex">
                <h3 className="mega-menu-title">
                  КАТЕГОРИЯ
                </h3>
                <div className="">
                  <div className="w-auto h-0.5 bg-brand-dark mb-4 lg:mb-8 lg:mt-6 ml-5"></div>
                  <div className="ml-5 grid grid-cols-2">
                    {menuData.subcategories.map((subcategory: string, index: number) => (
                      <a key={index} href="#" className="mega-menu-link">
                        {subcategory}
                      </a>
                    ))}
                    {menuData.additional?.map((item: string, index: number) => (
                      <a key={`additional-${index}`} href="#" className="mega-menu-link">
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
      <div className="w-full h-[120px] flex items-center justify-between px-[139px]">
        {/* Логотип */}
        <div className="flex-shrink-0">
          <a href="/">
            <img src="/icons/TS_logo.svg" alt="Tigr Shop" className="w-[37px] h-[58px]" />
          </a>
        </div>

        {/* Навигация - точно по центру */}
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

          {/* ✅ РАБОЧАЯ НАВИГАЦИЯ */}
          <ul className={`flex items-center gap-8 text-sm text-brand-dark h-[27px] transition-opacity duration-300 ${
            isSearchOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}>
            {menuItems.map((item: string, index: number) => (
              <li 
                key={index}
                onMouseEnter={() => handleMenuEnter(item)}
              >
                <a 
                  href={item === 'sale' ? '/catalog' : '#'}
                  className={`nav-link ${
                    activeMenu === item ? 'text-brand-gray' : ''
                  }`}
                  onClick={(e) => handleNavClick(item, e)}
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
          <SmartProfileIcon onAuthClick={handleAuthIconClick} />
        </div>
      </div>

      {/* ✅ РАБОЧИЙ РЕНДЕРИНГ МЕГА-МЕНЮ */}
      {!isSearchOpen && renderMegaMenu()}

      {/* Модальное окно авторизации */}
      {showAuthModal && (
        <AuthModal onClose={handleCloseAuthModal} />
      )}
    </header>
  );
};

export default DesktopHeader;