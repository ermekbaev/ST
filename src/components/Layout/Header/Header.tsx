'use client';

import React, { useState, useEffect } from 'react';
import DesktopHeader from './DesktopHeader';
import MobileHeader from './MobileHeader';

const Header: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header className="w-full bg-white border-b border-gray-200 h-[80px] lg:h-[120px]">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        </div>
      </header>
    );
  }

  return (
    <>
      {/* Desktop версия - показывается на экранах ≥ 1024px */}
      <div className="hidden lg:block">
        <DesktopHeader />
      </div>
      
      {/* Mobile версия - показывается на экранах < 1024px */}
      <div className="block lg:hidden">
        <MobileHeader />
        {/* Отступ для контента, т.к. шапка fixed */}
        <div className="h-[80px]" />
      </div>
    </>
  );
};

export default Header;