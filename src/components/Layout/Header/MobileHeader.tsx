"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  UNIFIED_MENU_DATA,
  MENU_ITEMS,
  isMegaMenuSection,
  isInfoSection,
} from "../../../data/unifiedMenuData";
import { MegaMenuData, InfoMenuData } from "../../../data/menuTypes";

const MobileHeader: React.FC = () => {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const mobileMenuItems = MENU_ITEMS;
  const menuData = UNIFIED_MENU_DATA;

  const buildCatalogUrl = (searchTerm: string) => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) {
      params.append("search", searchTerm.trim());
    }
    return `/catalog${params.toString() ? `?${params.toString()}` : ""}`;
  };

  const handleSearchToggle = useCallback((): void => {
    setIsSearchOpen(!isSearchOpen);
    setIsMobileMenuOpen(false);

    if (!isSearchOpen) {
      setTimeout(() => {
        const searchInput = document.getElementById(
          "mobile-search-input"
        ) as HTMLInputElement | null;
        if (searchInput) {
          searchInput.focus();
        }
      }, 300);
    } else {
      setSearchQuery("");
    }
  }, [isSearchOpen]);

  const handleMobileMenuToggle = useCallback((): void => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsSearchOpen(false);
    setOpenSection(null);
  }, [isMobileMenuOpen]);

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

  const handleMenuItemClick = useCallback(
    (item: string): void => {
      if (item === "каталог") {
        router.push("/catalog");
        setIsMobileMenuOpen(false);
        return;
      }

      if (openSection === item) {
        setOpenSection(null);
      } else {
        setOpenSection(item);
      }
    },
    [openSection, router]
  );

  const handleLinkClick = useCallback(
    (href: string): void => {
      if (href === "#" || !href) {
        return;
      }

      if (href.startsWith("/")) {
        router.push(href);
      } else {
        window.location.href = href;
      }

      setIsMobileMenuOpen(false);
    },
    [router]
  );

  const handleCategoryClick = useCallback(
    (category: string, item: string): void => {
      //@ts-ignore
      const section = menuData[item];

      if (isMegaMenuSection(section)) {
        const megaSection = section as MegaMenuData;
        const link = megaSection.links?.[category];

        if (link) {
          handleLinkClick(link);
        } else {
          handleLinkClick("/catalog");
        }
      }
    },
    [handleLinkClick]
  );

  const handleSubcategoryClick = useCallback(
    (subcategory: string): void => {
      handleLinkClick("/catalog");
    },
    [handleLinkClick]
  );

  return (
    <>
      <header className="w-full bg-white border-b border-gray-200 relative z-40">
        <div className="flex w-full h-[80px] items-center justify-between px-4 relative">
          {/* Логотип */}
          <div className="flex-shrink-0 z-50">
            <a href="/">
              <img
                src="/icons/TS_logo.svg"
                alt="Tigr Shop"
                className="w-[24px] h-[37px]"
              />
            </a>
          </div>

          {/* Поисковая строка */}
          <div
            className="absolute top-1/2 h-[60px] flex items-center transition-all duration-500 ease-in-out z-[90] overflow-hidden"
            style={{
              background: "#E5E0D8",
              borderRadius: "30px",
              left: "10px",
              right: "10px",
              transform: isSearchOpen
                ? "translateY(-50%) scaleX(1)"
                : "translateY(-50%) scaleX(0)",
              transformOrigin: "calc(100% - 58px) center",
              opacity: isSearchOpen ? 1 : 0,
              pointerEvents: isSearchOpen ? "auto" : "none",
            }}
          >
            <form
              onSubmit={handleSearchSubmit}
              className="flex-1 h-full flex items-center"
            >
              <input
                id="mobile-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Поиск товаров..."
                className="flex-1 bg-transparent text-black placeholder-gray-600 outline-none px-4 text-base"
                style={{ fontFamily: "Random Grotesque, Arial, sans-serif" }}
              />
            </form>
          </div>

          {/* Иконки справа */}
          <div className="flex items-center gap-4 z-50">
            <div
              className="cursor-pointer hover:opacity-70 transition-all duration-200"
              onClick={handleSearchToggle}
              style={{
                transform: isSearchOpen ? "translateX(12px)" : "translateX(0)",
                zIndex: isSearchOpen ? 110 : 60,
              }}
            >
              <img src="/icons/search.svg" alt="Поиск" className="w-5 h-5" />
            </div>

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

      {/* МОБИЛЬНОЕ МЕНЮ */}
      <div
        className={`fixed top-0 right-0 w-full h-full z-50 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "transform translate-x-0"
            : "transform translate-x-full"
        }`}
      >
        <div className="w-full h-full bg-white">
          <div className="flex w-full h-[80px] items-center justify-between px-4 border-b border-gray-200">
            <div className="flex-shrink-0">
              <a href="/">
                <img
                  src="/icons/TS_logo.svg"
                  alt="Tigr Shop"
                  className="w-[24px] h-[37px]"
                />
              </a>
            </div>

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

          <div className="h-[calc(100vh-80px)] overflow-y-auto">
            <div className="pt-0">
              {mobileMenuItems.map((item: string, index: number) => (
                <div key={index}>
                  <div className="border-b border-gray-100">
                    <button
                      className="w-full flex items-center justify-between px-6 py-4 text-black hover:bg-gray-50 transition-colors text-left"
                      style={{
                        fontFamily: "Random Grotesque, Arial, sans-serif",
                        fontSize: "16px",
                        fontWeight: 500,
                        textTransform: "uppercase",
                      }}
                      onClick={() => handleMenuItemClick(item)}
                    >
                      <span>{item}</span>
                      {item !== "каталог" && (
                        <div
                          className={`w-4 h-4 transition-transform duration-300 ${
                            openSection === item ? "rotate-90" : ""
                          }`}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M9 18L15 12L9 6"
                              stroke="black"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  </div>

                  {item !== "каталог" && openSection === item && (
                    <div className="bg-gray-50 border-b border-gray-100 animate-in slide-in-from-top duration-300">
                      {(() => {
                        //@ts-ignore
                        const section = menuData[item];

                        if (isInfoSection(section)) {
                          const infoSection = section as InfoMenuData;
                          return (
                            <div className="px-6 py-4 space-y-3">
                              {infoSection.links.map(
                                (link, linkIndex: number) => (
                                  <button
                                    key={linkIndex}
                                    onClick={() => handleLinkClick(link.href)}
                                    className="block w-full text-left py-2 px-4 text-black hover:bg-gray-100 rounded transition-colors"
                                    style={{
                                      fontFamily:
                                        "Random Grotesque, Arial, sans-serif",
                                      fontSize: "14px",
                                      fontWeight: 400,
                                      textTransform: "capitalize",
                                    }}
                                  >
                                    {link.name}
                                  </button>
                                )
                              )}
                            </div>
                          );
                        } else if (isMegaMenuSection(section)) {
                          const megaSection = section as MegaMenuData;
                          return (
                            <div className="px-6 py-4">
                              <div className="mb-6">
                                <h4
                                  className="text-black font-bold mb-3 text-sm uppercase"
                                  style={{
                                    fontFamily:
                                      "Random Grotesque, Arial, sans-serif",
                                  }}
                                >
                                  Все товары
                                </h4>
                                <div className="space-y-2">
                                  {megaSection.categories?.map(
                                    (category: string, catIndex: number) => (
                                      <button
                                        key={catIndex}
                                        onClick={() =>
                                          handleCategoryClick(category, item)
                                        }
                                        className="block w-full text-left py-2 px-4 text-black hover:bg-gray-100 rounded transition-colors"
                                        style={{
                                          fontFamily:
                                            "Random Grotesque, Arial, sans-serif",
                                          fontSize: "14px",
                                          fontWeight: 400,
                                        }}
                                      >
                                        {category}
                                      </button>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
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
