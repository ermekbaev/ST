'use client';

import React, { useState, useEffect } from 'react';
import FooterContent from './FooterContent';
import FooterBottom from './FooterBottom';
import MobileFooterContent from './MobileFooterContent';
import MobileFooterBottom from './MobileFooterBottom';

const Footer: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <footer className="bg-[#0B0B0D] text-white py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-[#0B0B0D] text-white py-8 md:py-12">
      {/* Desktop версия - показывается на экранах ≥ 1024px */}
      <div className="hidden lg:block">
        <div className="w-full mx-auto px-4 sm:px-8 lg:px-[70px]">
          <FooterContent />
          <FooterBottom />
        </div>
      </div>
      
      {/* Mobile версия - показывается на экранах < 1024px */}
      <div className="block lg:hidden">
        <div className="px-5 py-0">
          <MobileFooterContent />
          <MobileFooterBottom />
        </div>
      </div>
    </footer>
  );
};

export default Footer;