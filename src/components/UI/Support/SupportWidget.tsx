'use client';

import React, { useState, useEffect } from 'react';

interface SupportWidgetProps {
  forceVisible?: boolean;
  onToggle?: (isExpanded: boolean) => void;
}

const SupportWidget: React.FC<SupportWidgetProps> = ({ forceVisible = false, onToggle }) => {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
    
    // Автоматическое появление через 30 секунд только на десктопе
    if (!isMobile) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        // Показываем комментарий через 500ms после появления виджета
        setTimeout(() => {
          setShowComment(true);
        }, 500);
      }, 30000);
      
      return () => clearTimeout(timer);
    }
  }, [isMobile]);

  const handleContactClick = (type: 'telegram' | 'whatsapp' | 'email') => {
    const links = {
      telegram: 'https://t.me/TIGRSHOPsupport',
      whatsapp: 'https://wa.me/79962814667',
      email: 'mailto:support@tigrshop.ru'
    };
    
    window.open(links[type], '_blank');
  };

  const handleMainButtonClick = () => {
    if (forceVisible) {
      // В принудительном режиме показываем кнопки связи
      setIsExpanded(!isExpanded);
      if (onToggle) {
        onToggle(!isExpanded);
      }
    } else {
      // В обычном режиме скрываем комментарий и показываем кнопки
      setShowComment(false);
      setIsExpanded(!isExpanded);
    }
  };

  // ✅ Определяем состояния показа элементов
  const shouldShow = mounted && (isVisible || forceVisible);
  const shouldShowComment = !forceVisible && mounted && isVisible && !isExpanded && showComment;
  
  // 🚨 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: если виджет полностью скрыт, не рендерим вообще
  if (!shouldShow) {
    return null;
  }

  return (
    <div 
      className={`fixed ${forceVisible ? 'bottom-[90px]' : 'bottom-8'} right-4 lg:bottom-8 lg:right-8 flex items-end space-x-4 transition-all duration-500`}
      style={{
        zIndex: 45,
      }}
    >
      
      {/* 🎯 ИСПРАВЛЕНИЕ КОММЕНТАРИЯ: полностью убираем из DOM когда не нужен */}
      {shouldShowComment && (
        <div 
          className="bg-white rounded-xl relative transition-all duration-500 ease-in-out"
          style={{ 
            fontFamily: 'Arial, sans-serif',
            border: '4px solid #595047',
            width: isMobile ? '280px' : '310px',
            height: '115px',
            padding: '15px 30px 13px 20px',
            ...(isMobile && { 
              position: 'absolute',
              bottom: '50px',
              right: '0'
            })
          }}
        >
          <button
            onClick={() => setShowComment(false)}
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-black hover:text-gray-600 transition-colors font-bold text-lg leading-none"
          >
            ×
          </button>
          
          <div>
            <div className="text-base font-bold text-black" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', marginBottom: '4px' }}>
              TIGR SHOP
            </div>
            <div className="text-sm text-gray-700" style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.3' }}>
              Это <span className="font-bold text-black">TIGR SHOP</span>!<br/>
              Если у вас возникли вопросы,<br/>
              обратитесь в чат.
            </div>
          </div>
        </div>
      )}

      <div className="relative flex flex-col items-center">
        <div className="relative">
          {/* Кнопки связи - показываем только когда нужно */}
          {(forceVisible || isExpanded) && (
            <>
              <button
                onClick={() => handleContactClick('telegram')}
                className="absolute bottom-0 right-0 rounded-full flex items-center justify-center hover:opacity-80 hover:scale-105 w-12 h-12"
                title="Telegram"
                style={{ 
                  backgroundColor: '#0088cc',
                  transform: 'translateY(-156px)',
                  transitionDelay: '0ms',
                  transitionDuration: '300ms',
                  transitionTimingFunction: 'ease-out',
                  transitionProperty: 'all'
                }}
              >
                <img src="/supportIcons/tg_white.svg" alt="Telegram" className="w-7 h-7" />
              </button>

              <button
                onClick={() => handleContactClick('whatsapp')}
                className="absolute bottom-0 right-0 rounded-full flex items-center justify-center hover:opacity-80 hover:scale-105 w-12 h-12"
                title="WhatsApp"
                style={{ 
                  backgroundColor: '#25D366',
                  transform: 'translateY(-104px)',
                  transitionDelay: '100ms',
                  transitionDuration: '300ms',
                  transitionTimingFunction: 'ease-out',
                  transitionProperty: 'all'
                }}
              >
                <img src="/supportIcons/wa_white.svg" alt="WhatsApp" className="w-7 h-7" />
              </button>

              <button
                onClick={() => handleContactClick('email')}
                className="absolute bottom-0 right-0 rounded-full flex items-center justify-center hover:opacity-80 hover:scale-105 w-12 h-12"
                title="Email"
                style={{ 
                  backgroundColor: '#EA4335',
                  transform: 'translateY(-52px)',
                  transitionDelay: '200ms',
                  transitionDuration: '300ms',
                  transitionTimingFunction: 'ease-out',
                  transitionProperty: 'all'
                }}
              >
                <img src="/supportIcons/email_white.svg" alt="Email" className="w-7 h-7" />
              </button>
            </>
          )}

          {/* Основная кнопка поддержки */}
          <button
            onClick={handleMainButtonClick}
            className={`bg-[#595047] rounded-full flex items-center justify-center hover:opacity-90 hover:scale-105 ${
              isExpanded ? 'w-12 h-12' : 'w-16 h-16'
            }`}
            title="Связаться с нами"
            style={{ 
              transitionDuration: '500ms',
              transitionTimingFunction: 'ease-out',
              transitionProperty: 'all'
            }}
          >
            <img 
              src="/supportIcons/Support.svg" 
              alt="Support" 
              className={`${
                isExpanded ? 'w-10 h-10' : 'w-14 h-14'
              }`}
              style={{
                transitionDuration: '300ms',
                transitionTimingFunction: 'ease-out',
                transitionProperty: 'all'
              }}
            /> 
          </button>

          {/* НА МОБИЛЬНОМ: невидимая область для клика - только когда комментарий показан */}
          {shouldShowComment && isMobile && (
            <div
              onClick={() => {
                setShowComment(false);
                setIsExpanded(true);
              }}
              className="absolute bottom-0 right-0 w-16 h-16 cursor-pointer"
              title="Связаться с нами"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportWidget;