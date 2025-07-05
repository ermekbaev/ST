import React from 'react';

const Header = () => {
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

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="w-full h-[120px] flex items-center justify-between px-[139px]">
        {/* Логотип */}
        <div className="flex-shrink-0">
          <img src="/icons/TS_logo.svg" alt="Tigr Shop" className="w-[37px] h-[58px]" />
        </div>

        {/* Навигация - точно по центру */}
        <nav className="flex-shrink-0">
          <ul className="flex items-center gap-8 text-sm text-black h-[27px]">
            {menuItems.map((item, index) => (
              <li key={index}>
                <a 
                  href="#" 
                  className="hover:text-gray-600 transition-colors duration-200 uppercase"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Иконки */}
        <div className="flex items-center gap-6 flex-shrink-0">
          <div className="cursor-pointer hover:opacity-70 transition-opacity duration-200">
            <img src="/icons/search.svg" alt="Поиск" className="w-6 h-6" />
          </div>
          <div className="cursor-pointer hover:opacity-70 transition-opacity duration-200">
            <img src="/icons/cart.svg" alt="Корзина" className="w-6 h-6" />
          </div>
          <div className="cursor-pointer hover:opacity-70 transition-opacity duration-200">
            <img src="/icons/profile.svg" alt="Профиль" className="w-6 h-6" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
