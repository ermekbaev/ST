'use client';

import React, { useState, useEffect } from 'react';

interface SupportWidgetProps {
  forceVisible?: boolean;
  onToggle?: (isExpanded: boolean) => void;
}

const SupportWidget: React.FC<SupportWidgetProps> = ({ forceVisible = false, onToggle }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComment, setShowComment] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Определяем мобильное устройство
  useEffect(() => {
    setMounted(true);
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Автоматически показываем через 30 секунд (если не форсирована видимость)
    // Работает и на мобильном, и на десктопе
    if (!forceVisible) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 30000); 

      return () => clearTimeout(timer);
    }
  }, [forceVisible, mounted]);

  // Обновляем видимость при изменении forceVisible
  useEffect(() => {
    if (forceVisible) {
      setIsVisible(true);
      setShowComment(false); // Скрываем комментарий при принудительном показе
      // Добавляем задержку для появления развернутого виджета
      setTimeout(() => {
        setIsExpanded(true);
      }, 400);
    } else {
      // При закрытии принудительного режима сворачиваем виджет
      setIsExpanded(false);
      // Возвращаем комментарий если виджет был показан автоматически
      if (isVisible && !forceVisible) {
        setTimeout(() => {
          setShowComment(true);
        }, 500);
      }
    }
  }, [forceVisible, isVisible]);

  const toggleExpanded = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    
    // Уведомляем родительский компонент об изменении состояния
    if (onToggle) {
      onToggle(newExpandedState);
    }
    
    // Если виджет закрывается, показываем комментарий обратно (только если не принудительный режим)
    if (!newExpandedState && !forceVisible) {
      setTimeout(() => {
        setShowComment(true);
      }, 300);
    } else if (newExpandedState) {
      // Если открывается, скрываем комментарий
      setShowComment(false);
    }
  };

  const handleContactClick = (type: string) => {
    console.log(`Клик по ${type}`);
    
    switch(type) {
      case 'telegram':
        window.open('https://t.me/TIGRSHOPsupport', '_blank');
        break;
      case 'whatsapp':
        window.open('https://wa.me/79962814667', '_blank');
        break;
      case 'email':
        window.location.href = 'mailto:contact@tigrshop.ru';
        break;
      case 'chat':
        console.log('Открыть чат');
        break;
    }
  };

  // Показываем виджет если:
  // 1. Форсирована видимость ИЛИ
  // 2. Прошло 30 секунд (isVisible = true)
  const shouldShow = mounted && (isVisible || forceVisible);

  return (
    <div className={`fixed ${forceVisible ? 'bottom-[90px]' : 'bottom-8'} right-4 lg:bottom-8 lg:right-8 z-50 flex items-end space-x-4 ${
      !shouldShow ? 'opacity-0 pointer-events-none' : ''
    } transition-all duration-500`}>
      
      {/* Комментарий - показываем на всех устройствах если автоматически появился виджет И не принудительно вызван */}
      {!forceVisible && (
        <div 
          className={`bg-white rounded-xl relative transition-all duration-500 ease-in-out ${
            mounted && isVisible && !isExpanded && showComment ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-4 pointer-events-none'
          }`} 
          style={{ 
            fontFamily: 'Arial, sans-serif',
            border: '4px solid #595047',
            width: isMobile ? '280px' : '310px',
            height: '115px',
            padding: '15px 30px 13px 20px',
              ...(isMobile && { 
              position: 'absolute',
              bottom: '50px', // Поднимаем на 100px выше основной позиции
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
          {/* Кнопки связи - показываются когда принудительно вызван виджет ИЛИ развернут на десктопе */}
          <button
            onClick={() => handleContactClick('telegram')}
            className={`absolute bottom-0 right-0 rounded-full flex items-center justify-center hover:opacity-80 hover:scale-105 ${
              (forceVisible || isExpanded) ? 'w-12 h-12 opacity-100 transform translate-y-[-156px]' : 'w-12 h-12 opacity-0 pointer-events-none transform translate-y-0'
            }`}
            title="Telegram"
            style={{ 
              transitionDelay: (forceVisible || isExpanded) ? '200ms' : '0ms',
              transitionDuration: '300ms',
              transitionTimingFunction: 'ease-out',
              transitionProperty: 'all'
            }}
          >
            <img src="/supportIcons/Telegram.svg" alt="Telegram" className="w-10 h-10" />
          </button>

          <button
            onClick={() => handleContactClick('whatsapp')}
            className={`absolute bottom-0 right-0 rounded-full flex items-center justify-center hover:opacity-80 hover:scale-105 ${
              (forceVisible || isExpanded) ? 'w-12 h-12 opacity-100 transform translate-y-[-104px]' : 'w-12 h-12 opacity-0 pointer-events-none transform translate-y-0'
            }`}
            title="WhatsApp"
            style={{ 
              transitionDelay: (forceVisible || isExpanded) ? '300ms' : '0ms',
              transitionDuration: '300ms',
              transitionTimingFunction: 'ease-out',
              transitionProperty: 'all'
            }}
          >
            <img src="/supportIcons/WhatsApp.svg" alt="WhatsApp" className="w-10 h-10" />
          </button>

          <button
            onClick={() => handleContactClick('email')}
            className={`absolute bottom-0 right-0 rounded-full flex items-center justify-center hover:opacity-80 hover:scale-105 ${
              (forceVisible || isExpanded) ? 'w-12 h-12 opacity-100 transform translate-y-[-52px]' : 'w-12 h-12 opacity-0 pointer-events-none transform translate-y-0'
            }`}
            title="Email"
            style={{ 
              transitionDelay: (forceVisible || isExpanded) ? '400ms' : '0ms',
              transitionDuration: '300ms',
              transitionTimingFunction: 'ease-out',
              transitionProperty: 'all'
            }}
          >
            <img src="/supportIcons/Email.svg" alt="Email" className="w-10 h-10" />
          </button>

          {/* Главная кнопка поддержки - показывается ТОЛЬКО НА ДЕСКТОПЕ и только если автоматически появился */}
          {!forceVisible && !isMobile && (
            <button
              onClick={toggleExpanded}
              className={`relative rounded-full flex items-center justify-center hover:opacity-80 hover:scale-105 ${
                isExpanded ? 'w-12 h-12' : 'w-16 h-16'
              } ${
                shouldShow ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-[100px] pointer-events-none'
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
          )}

          {/* НА МОБИЛЬНОМ: невидимая область для клика по комментарию (расширяем зону клика) */}
          {!forceVisible && isMobile && showComment && (
            <div
              onClick={() => {
                setShowComment(false);
                // На мобильном при клике на комментарий сразу показываем кнопки связи
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