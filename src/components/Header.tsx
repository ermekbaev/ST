'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';

const Header = () => {
  const [mounted, setMounted] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems } = useCart();
  
  // Предотвращаем рендеринг до монтирования
  useEffect(() => {
    setMounted(true);
  }, []);

  // Данные для мега-меню
  const megaMenuData = {
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
  
  const menuItems = [
    'sale',
    'обувь', 
    'одежда',
    'аксессуары',
    'коллекции',
    'другое',
    'бренды',
    'информация'
  ];

  const handleMenuEnter = (item: string) => {
    if (megaMenuData[item as keyof typeof megaMenuData] && !isSearchOpen) {
      setActiveMenu(item);
    }
  };

  const handleMenuLeave = () => {
    if (!isSearchOpen) {
      setActiveMenu(null);
    }
  };

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    setActiveMenu(null); // Закрываем мега-меню при открытии поиска
    if (!isSearchOpen) {
      // Фокусируемся на инпуте после анимации
      setTimeout(() => {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }, 300);
    } else {
      setSearchQuery(''); // Очищаем поиск при закрытии
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Поиск:', searchQuery);
    // Здесь будет логика поиска
    // setIsSearchOpen(false); // Можно закрыть после поиска
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  // Получаем позицию активного пункта меню
  const getMenuPosition = () => {
    if (!activeMenu) return {};
    
    // Находим позицию активного пункта меню относительно центра
    const menuItems = ['sale', 'обувь', 'одежда', 'аксессуары', 'коллекции', 'другое', 'бренды', 'информация'];
    const activeIndex = menuItems.indexOf(activeMenu);
    
    // Рассчитываем смещение от центра + дополнительное смещение вправо
    const centerOffset = (activeIndex - 3.5) * 120 + 200; // увеличили до +200px вправо
    
    return {
      transform: `translateX(${centerOffset}px)`
    };
  };

  const renderMegaMenu = () => {
    if (!activeMenu || !megaMenuData[activeMenu as keyof typeof megaMenuData]) {
      return null;
    }

    const menuData = megaMenuData[activeMenu as keyof typeof megaMenuData];

    return (
      <div 
        className="absolute top-full left-0 w-full bg-brand-beige z-50 animate-slide-down"
        onMouseEnter={() => setActiveMenu(activeMenu)}
        onMouseLeave={handleMenuLeave}
      >
        <div className="w-full py-12">
          {/* Контейнер с центрированным контентом */}
          <div 
            className="w-[800px] mx-auto px-16"
            style={getMenuPosition()}
          >
            {/* Первая секция - основная категория */}
            <div className="mb-16">
              <div className="flex items-start">
                <h3 className="brand-text-large text-4xl text-brand-dark mr-8 italic min-w-[200px]">
                  {menuData.title}
                </h3>
                <div className="flex-1">
                  {/* Горизонтальная линия после заголовка */}
                  <div className="w-full h-px bg-brand-dark mb-8 mt-6"></div>
                  <div className="grid grid-cols-2 gap-x-16 gap-y-3">
                    {menuData.categories.map((category, index) => (
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

            {/* Вторая секция - подкатегории */}
            <div>
              <div className="flex items-start">
                <h3 className="brand-text-large text-4xl text-brand-dark mr-8 italic min-w-[200px]">
                  КАТЕГОРИЯ
                </h3>
                <div className="flex-1">
                  {/* Горизонтальная линия после заголовка */}
                  <div className="w-full h-px bg-brand-dark mb-8 mt-6"></div>
                  <div className="grid grid-cols-2 gap-x-16 gap-y-3">
                    {menuData.subcategories.map((subcategory, index) => (
                      <a
                        key={index}
                        href="#"
                        className="text-brand-dark hover:text-brand-gray transition-colors text-base font-medium tracking-wide font-heading"
                      >
                        {subcategory}
                      </a>
                    ))}
                    {menuData.additional && menuData.additional.map((item, index) => (
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
        <nav 
          className="flex-shrink-0 relative"
          onMouseLeave={handleMenuLeave}
        >
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
                onChange={(e) => setSearchQuery(e.target.value)}
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
            {menuItems.map((item, index) => (
              <li 
                key={index}
                onMouseEnter={() => handleMenuEnter(item)}
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

export default Header;