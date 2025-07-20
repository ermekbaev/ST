'use client';

import { useEffect, useState } from 'react';
import Header from './Header/Header';
import Footer from './Footer/Footer';
import SupportWidget from '../UI/Support/SupportWidget';
import MobileSupportWidget from '../UI/Support/MobileSupportWidget';
import BottomNavigation from './Navigation/BottomNavigation';
import CartSidebar from '../Cart/CartSidebar';
import { CartProvider } from '../../contexts/CartContext';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileWidgetVisible, setMobileWidgetVisible] = useState(false);

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSupportClick = () => {
    if (isMobile) {
      // На мобилке показываем/скрываем мобильный виджет
      setMobileWidgetVisible(!mobileWidgetVisible);
    }
  };

  const handleMobileWidgetClose = () => {
    setMobileWidgetVisible(false);
  };

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 overflow-x-hidden">
          <div className="max-w-[100vw] mx-auto">
            {children}
          </div>
        </main>
        
        {/* Footer с отступом снизу на мобильных */}
        <div className="pb-[70px] lg:pb-0">
          <Footer />
        </div>
        
        {/* Десктопный виджет - только на больших экранах */}
        {mounted && !isMobile && (
          <SupportWidget />
        )}
        
        {/* Мобильный виджет - только на мобилке */}
        {mounted && isMobile && (
          <MobileSupportWidget
            isVisible={mobileWidgetVisible}
            onClose={handleMobileWidgetClose}
          />
        )}
        
        {/* BottomNavigation - только на мобильном */}
        <BottomNavigation onSupportClick={handleSupportClick} />
        
        {/* CartSidebar - корзина */}
        <CartSidebar />
      </div>
    </CartProvider>
  );
}