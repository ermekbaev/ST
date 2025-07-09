import React from 'react';

const FooterBottom = () => {
  return (
<div className="mt-[175px] pt-4 lg:pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
      <div className="text-gray-400 text-sm">
        2018-2025 © Tigr Shop
      </div>
      <div className="text-gray-400 text-sm mt-0">
        <a href="https://agency404.ru">
          При поддержке: <span className="text-white">АГЕНТСТВО_404</span>
        </a>
      </div>
    </div>
  );
};

export default FooterBottom;
