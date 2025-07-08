// src/components/UI/Breadcrumbs/Breadcrumbs.tsx
'use client';

import React from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isLast?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  
  const handleLinkClick = (href?: string) => {
    if (href) {
      console.log(`Переход на: ${href}`);
      // Здесь будет роутинг: router.push(href)
    }
  };

  return (
    <nav 
      className={`w-full ${className}`}
      style={{
        fontFamily: 'Random Grotesque, Arial, sans-serif'
      }}
    >
      {/* Desktop версия */}
      <div className="hidden lg:block">
        <div className="flex items-center gap-8 mb-8">
          {/* Хлебные крошки */}
          <div 
            className="text-[#8C8072] text-[15px] leading-[35px] flex items-center"
            style={{
              fontWeight: 400,
              height: '35px'
            }}
          >
            {items.map((item, index) => (
              <React.Fragment key={index}>
                {item.href && !item.isLast ? (
                  <button
                    onClick={() => handleLinkClick(item.href)}
                    className="hover:text-[#595047] transition-colors cursor-pointer bg-transparent border-none p-0 text-[15px] leading-[35px]"
                    style={{
                      fontFamily: 'Random Grotesque, Arial, sans-serif',
                      fontWeight: 400,
                      color: '#8C8072'
                    }}
                  >
                    {item.label}
                  </button>
                ) : (
                  <span className={item.isLast ? 'text-[#8C8072]' : ''}>
                    {item.label}
                  </span>
                )}
                
                {index < items.length - 1 && (
                  <span className="mx-2 text-[#8C8072]">/</span>
                )}
              </React.Fragment>
            ))}
          </div>
          
          {/* Разделительная линия - рядом с хлебными крошками */}
          <div 
            className="h-0.5 bg-black flex-1 mt-3 w-full"
          ></div>
        </div>
      </div>

      {/* Mobile версия */}
      <div className="block lg:hidden">
        <div className="flex items-center gap-4 mb-6">
          {/* Хлебные крошки */}
          <div 
            className="text-[#8C8072] text-[15px] leading-[35px] flex items-center h-[10px]"
            style={{
              fontWeight: 400,
              width: '200px',
              maxWidth: 'calc(100vw - 100px)'
            }}
          >
            {items.map((item, index) => (
              <React.Fragment key={index}>
                {item.href && !item.isLast ? (
                  <button
                    onClick={() => handleLinkClick(item.href)}
                    className="hover:text-[#595047] transition-colors cursor-pointer bg-transparent border-none p-0 text-[15px] leading-[35px]"
                    style={{
                      fontFamily: 'Random Grotesque, Arial, sans-serif',
                      fontWeight: 400,
                      color: '#8C8072'
                    }}
                  >
                    {item.label}
                  </button>
                ) : (
                  <span className={item.isLast ? 'text-[#8C8072]' : ''}>
                    {item.label}
                  </span>
                )}
                
                {index < items.length - 1 && (
                  <span className="mx-1 text-[#8C8072] text-[15px]">/</span>
                )}
              </React.Fragment>
            ))}
          </div>
          
          {/* Разделительная линия рядом */}
          <div className="h-0.5 bg-black flex-1"></div>
        </div>
      </div>
    </nav>
  );
};

export default Breadcrumbs;