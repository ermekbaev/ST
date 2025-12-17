"use client";

import React, { useState, useEffect, useCallback, JSX } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../../contexts/CartContext";
import AuthModal from "../../Auth/AuthModal";
import SmartProfileIcon from "@/components/Auth/SmartProfileicon";
// ✅ ИМПОРТИРУЕМ ФУНКЦИИ ДЛЯ ПРЯМЫХ ССЫЛОК
import {
  UNIFIED_MENU_DATA,
  MENU_ITEMS,
  isMegaMenuSection,
  DIRECT_MENU_LINKS,
} from "../../../data/unifiedMenuData";
import { MenuKey, MegaMenuData } from "../../../data/menuTypes";

const DesktopHeader: React.FC = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState<boolean>(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const { totalItems, toggleCart } = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  const megaMenuData = UNIFIED_MENU_DATA;
  const menuItems = MENU_ITEMS;

  const buildCatalogUrl = (searchTerm: string) => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) {
      params.append("search", searchTerm.trim());
    }
    return `/catalog${params.toString() ? `?${params.toString()}` : ""}`;
  };

  // ✅ ПРОВЕРЯЕМ, ЯВЛЯЕТСЯ ЛИ ПУНКТ ПРЯМОЙ ССЫЛКОЙ
  const isDirectLink = (item: string): boolean => {
    return item in DIRECT_MENU_LINKS;
  };

  const handleMenuEnter = useCallback(
    (item: string): void => {
      // ✅ НЕ ОТКРЫВАЕМ МЕНЮ ДЛЯ ПРЯМЫХ ССЫЛОК
      if (isDirectLink(item)) {
        return;
      }
      if (megaMenuData[item as MenuKey] && !isSearchOpen) {
        setActiveMenu(item);
      }
    },
    [isSearchOpen]
  );

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
        const searchInput = document.getElementById(
          "search-input"
        ) as HTMLInputElement | null;
        if (searchInput) {
          searchInput.focus();
        }
      }, 300);
    } else {
      setSearchQuery("");
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>): void => {
      e.preventDefault();
      if (searchQuery.trim()) {
        const url = buildCatalogUrl(searchQuery);
        router.push(url);
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    },
    [searchQuery, router]
  );

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>): void => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    },
    []
  );

  const handleCartClick = useCallback((): void => {
    toggleCart();
  }, [toggleCart]);

  const handleAuthIconClick = () => {
    setShowAuthModal(true);
  };

  const handleCloseAuthModal = useCallback((): void => {
    setShowAuthModal(false);
  }, []);

  // ✅ ОБРАБОТКА КЛИКОВ ПО НАВИГАЦИИ С ПРЯМЫМИ ССЫЛКАМИ
  const handleNavClick = useCallback(
    (item: string, e: React.MouseEvent<HTMLAnchorElement>) => {
      // Если это прямая ссылка, просто переходим
      if (isDirectLink(item)) {
        e.preventDefault();
        router.push(DIRECT_MENU_LINKS[item]);
        return;
      }

      // Информация открывается обычным способом
      if (item === "информация") {
        return;
      }

      e.preventDefault();
    },
    [router]
  );

  const getMenuPosition = useCallback((): React.CSSProperties => {
    if (!activeMenu) return {};

    const activeIndex = menuItems.indexOf(activeMenu);
    const screenWidth =
      typeof window !== "undefined" ? window.innerWidth : 1400;

    let centerOffset;

    if (activeMenu === "бренды") {
      if (screenWidth >= 1400) {
        centerOffset = (activeIndex - 3.5) * 120 + 50;
      } else if (screenWidth >= 1200) {
        centerOffset = (activeIndex - 3.5) * 100 + 30;
      } else if (screenWidth >= 1024) {
        centerOffset = (activeIndex - 3.5) * 70;
      } else {
        centerOffset = 0;
      }
    } else if (activeIndex === menuItems.length - 1) {
      if (screenWidth >= 1400) {
        centerOffset = (activeIndex - 3.5) * 120 + 50;
      } else if (screenWidth >= 1200) {
        centerOffset = (activeIndex - 3.5) * 100 + 30;
      } else if (screenWidth >= 1024) {
        centerOffset = (activeIndex - 3.5) * 70;
      } else {
        centerOffset = 0;
      }
    } else {
      if (screenWidth >= 1400) {
        centerOffset = (activeIndex - 3.5) * 120 + 200;
      } else if (screenWidth >= 1200) {
        centerOffset = (activeIndex - 3.5) * 100 + 150;
      } else if (screenWidth >= 1024) {
        centerOffset = (activeIndex - 3.5) * 70 + 80;
      } else {
        centerOffset = 0;
      }
    }

    const maxOffset = Math.max(0, (screenWidth - 600) / 2 - 40);
    const minOffset = -maxOffset;
    centerOffset = Math.max(minOffset, Math.min(maxOffset, centerOffset));

    return {
      transform: `translateX(${centerOffset}px)`,
      maxWidth: screenWidth < 900 ? "calc(100vw - 30px)" : "calc(100vw - 80px)",
      margin: "0 auto",
      width: "fit-content",
    };
  }, [activeMenu, menuItems]);

  const [screenWidth, setScreenWidth] = useState(1400);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    if (typeof window !== "undefined") {
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const renderMegaMenu = (): JSX.Element | null => {
    if (!activeMenu || !megaMenuData[activeMenu as MenuKey]) {
      return null;
    }

    const menuData = megaMenuData[activeMenu as MenuKey];

    if (!isMegaMenuSection(menuData)) {
      return null;
    }

    const typedMenuData = menuData as MegaMenuData;

    return (
      <div
        className="mega-menu-container"
        onMouseEnter={() => setActiveMenu(activeMenu)}
        onMouseLeave={handleMenuLeave}
      >
        <div className="w-full py-8 lg:py-12">
          <div className="mega-menu-inner w-4xl" style={getMenuPosition()}>
            <div className="mb-8 lg:mb-16">
              <div className="flex">
                <h3 className="mega-menu-title ">{typedMenuData.title}</h3>
                <div className="">
                  <div className="w-full h-0.5 bg-brand-dark mb-4 lg:mb-8 lg:mt-6 ml-5"></div>
                  <div className="ml-5 grid grid-cols-2">
                    {typedMenuData.categories.map(
                      (category: string, index: number) => (
                        <a
                          key={index}
                          href={typedMenuData.links?.[category] || "#"}
                          className="mega-menu-link"
                        >
                          {category.toLowerCase()}
                        </a>
                      )
                    )}
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
        <div className="flex-shrink-0">
          <a href="/">
            <img
              src="/icons/TS_logo.svg"
              alt="Tigr Shop"
              className="w-[37px] h-[58px]"
            />
          </a>
        </div>

        <nav className="flex-shrink-0 relative">
          <div
            className={`absolute top-1/2 right-0 transform -translate-y-1/2 h-10 flex items-center transition-all duration-500 ease-in-out z-20 ${
              isSearchOpen ? "w-full opacity-100" : "w-0 opacity-0"
            } overflow-hidden`}
          >
            <form onSubmit={handleSearchSubmit} className="w-full">
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                onKeyDown={handleSearchKeyDown}
                placeholder="поиск товаров, брендов..."
                className="w-full h-10 px-4 bg-brand-beige text-brand-dark placeholder-brand-gray focus:outline-none rounded-full text-sm border-0 brand-text-small"
                style={{ border: "none", outline: "none" }}
              />
            </form>
          </div>

          <ul
            className={`flex items-center gap-8 text-sm text-brand-dark h-[27px] transition-opacity duration-300 ${
              isSearchOpen ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            {menuItems.map((item: string, index: number) => (
              <li key={index} onMouseEnter={() => handleMenuEnter(item)}>
                <a
                  href={isDirectLink(item) ? DIRECT_MENU_LINKS[item] : "#"}
                  className={`nav-link ${
                    activeMenu === item ? "text-brand-gray" : ""
                  }`}
                  onClick={(e) => handleNavClick(item, e)}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>

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
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </div>
          <SmartProfileIcon onAuthClick={handleAuthIconClick} />
        </div>
      </div>

      {!isSearchOpen && renderMegaMenu()}

      {showAuthModal && <AuthModal onClose={handleCloseAuthModal} />}
    </header>
  );
};

export default DesktopHeader;
