'use client';

import { useEffect, useState } from 'react';
import Header from './Header/Header';
import Footer from './Footer/Footer';
import SupportWidget from '../UI/Support/SupportWidget';
import BottomNavigation from './Navigation/BottomNavigation';
import { CartProvider } from '../../contexts/CartContext';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [supportForceVisible, setSupportForceVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSupportToggle = () => {
    if (supportForceVisible) {
      // Если виджет уже показан, скрываем его
      setSupportForceVisible(false);
    } else {
      // Если виджет скрыт, показываем его
      setSupportForceVisible(true);
    }
  };

  const handleSupportWidgetToggle = (isExpanded: boolean) => {
    // Если виджет закрыт пользователем в принудительном режиме, убираем принудительную видимость
    if (!isExpanded && supportForceVisible) {
      // Добавляем задержку для плавного скрытия основной кнопки
      setTimeout(() => {
        setSupportForceVisible(false);
      }, 600); // Увеличена задержка для плавности
    }
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
        
        {/* SupportWidget - показывается на десктопе всегда, на мобильном по требованию */}
        <SupportWidget 
          forceVisible={supportForceVisible}
          onToggle={handleSupportWidgetToggle}
        />
        
        {/* BottomNavigation - только на мобильном */}
        <BottomNavigation onSupportClick={handleSupportToggle} />
      </div>
    </CartProvider>
  );
}