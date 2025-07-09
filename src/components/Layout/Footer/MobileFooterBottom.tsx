import React from 'react';

const MobileFooterBottom = () => {
  return (
    <div className="mt-12 pt-6 border-t border-gray-700 flex flex-col items-center gap-2 text-center">
      <div 
        className="text-gray-400 text-sm"
        style={{ 
          fontFamily: 'Random Grotesque, Arial, sans-serif',
          fontWeight: 400
        }}
      >
        2018-2025 © Tigr Shop
      </div>
      <div 
        className="text-gray-400 text-sm"
        style={{ 
          fontFamily: 'Random Grotesque, Arial, sans-serif',
          fontWeight: 400
        }}
      >
        <a href="https://agency404.ru">
          При поддержке: <span className="text-white">АГЕНТСТВО_404</span>
        </a>
      </div>
    </div>
  );
};

export default MobileFooterBottom;