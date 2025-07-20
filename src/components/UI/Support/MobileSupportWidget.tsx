'use client';

import React from 'react';

interface MobileSupportWidgetProps {
  isVisible: boolean;
  onClose: () => void;
}

const MobileSupportWidget: React.FC<MobileSupportWidgetProps> = ({ isVisible, onClose }) => {
  const handleContactClick = (type: 'telegram' | 'whatsapp' | 'email') => {
    const links = {
      telegram: 'https://t.me/TIGRSHOPsupport',
      whatsapp: 'https://wa.me/79962814667',
      email: 'mailto:support@tigrshop.ru'
    };
    
    window.open(links[type], '_blank');
    
    // Закрываем виджет после клика
    onClose();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-[90px] right-4 flex items-end space-x-4 transition-all duration-300"
      style={{ zIndex: 45 }}
    >
      <div className="relative flex flex-col items-center">
        <div className="relative">
          
          {/* Кнопки контактов - показываем сразу если виджет видимый с анимацией */}
          {isVisible && (
            <>
              {/* Telegram - появляется первым */}
              <button
                onClick={() => handleContactClick('telegram')}
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mobile-support-button "
                title="Telegram"
                style={{ 
                  opacity: 0,
                  animation: 'mobile-support-fade-in-up 0.4s ease-out 0ms forwards'
                }}
              >
                <img src="/supportIcons/Telegram.svg" alt="Telegram" className="w-12 h-12" />
              </button>

              {/* WhatsApp - появляется вторым */}
              <button
                onClick={() => handleContactClick('whatsapp')}
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mobile-support-button "
                title="WhatsApp"
                style={{ 
                  opacity: 0,
                  animation: 'mobile-support-fade-in-up 0.4s ease-out 0.15s forwards'
                }}
              >
                <img src="/supportIcons/WhatsApp.svg" alt="WhatsApp" className="w-12 h-12" />
              </button>

              {/* Email - появляется третьим */}
              <button
                onClick={() => handleContactClick('email')}
                className="w-16 h-16 rounded-full flex items-center justify-center mobile-support-button "
                title="Email"
                style={{ 
                  opacity: 0,
                  animation: 'mobile-support-fade-in-up 0.4s ease-out 0.3s forwards'
                }}
              >
                <img src="/supportIcons/Email.svg" alt="Email" className="w-12 h-12" />
              </button>
            </>
          )}

        </div>
      </div>

      {/* Стили уже добавлены в globals.css */}
    </div>
  );
};

export default MobileSupportWidget;