'use client';

import React, { useState, useEffect } from 'react';

const SupportWidget = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComment, setShowComment] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 30000); 

    return () => clearTimeout(timer);
  }, []);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleContactClick = (type: string) => {
    console.log(`Клик по ${type}`);
    
    switch(type) {
      case 'telegram':
        window.open('https://t.me/PadvdH', '_blank');
        break;
      case 'whatsapp':
        window.open('https://wa.me/79962814667', '_blank');
        break;
      case 'email':
        window.location.href = 'mailto:tigran200615@gmail.com';
        break;
      case 'chat':
        console.log('Открыть чат');
        break;
    }
  };

  return (
    <div className={`fixed bottom-8 right-8 z-50 flex items-end space-x-4 ${
      !mounted || !isVisible ? 'opacity-0 pointer-events-none' : ''
    }`}>
      <div 
        className={`bg-white rounded-xl relative transition-all duration-500 ease-in-out ${
          mounted && isVisible && !isExpanded && showComment ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-4 pointer-events-none'
        }`} 
        style={{ 
          fontFamily: 'Arial, sans-serif',
          border: '4px solid #595047',
          width: '310px',
          height: '115px',
          padding: '15px 30px 13px 20px'
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

      <div className="relative flex flex-col items-center">
        <div className="relative">
          <button
            onClick={() => handleContactClick('telegram')}
            className={`absolute bottom-0 right-0 rounded-full flex items-center justify-center hover:opacity-80 transition-all duration-300 hover:scale-105 ${
              isExpanded ? 'w-12 h-12 opacity-100 transform translate-y-[-156px]' : 'w-12 h-12 opacity-0 pointer-events-none transform translate-y-0'
            }`}
            title="Telegram"
            style={{ transitionDelay: isExpanded ? '100ms' : '0ms' }}
          >
            <img src="/supportIcons/Telegram.svg" alt="Telegram" className="w-10 h-10" />
          </button>

          <button
            onClick={() => handleContactClick('whatsapp')}
            className={`absolute bottom-0 right-0 rounded-full flex items-center justify-center hover:opacity-80 transition-all duration-300 hover:scale-105 ${
              isExpanded ? 'w-12 h-12 opacity-100 transform translate-y-[-104px]' : 'w-12 h-12 opacity-0 pointer-events-none transform translate-y-0'
            }`}
            title="WhatsApp"
            style={{ transitionDelay: isExpanded ? '200ms' : '0ms' }}
          >
            <img src="/supportIcons/WhatsApp.svg" alt="WhatsApp" className="w-10 h-10" />
          </button>

          <button
            onClick={() => handleContactClick('email')}
            className={`absolute bottom-0 right-0 rounded-full flex items-center justify-center hover:opacity-80 transition-all duration-300 hover:scale-105 ${
              isExpanded ? 'w-12 h-12 opacity-100 transform translate-y-[-52px]' : 'w-12 h-12 opacity-0 pointer-events-none transform translate-y-0'
            }`}
            title="Email"
            style={{ transitionDelay: isExpanded ? '300ms' : '0ms' }}
          >
            <img src="/supportIcons/Email.svg" alt="Email" className="w-10 h-10" />
          </button>

          <button
            onClick={toggleExpanded}
            className={`relative rounded-full flex items-center justify-center hover:opacity-80 transition-all duration-300 hover:scale-105 ${
              isExpanded ? 'w-12 h-12' : 'w-16 h-16'
            }`}
            title="Связаться с нами"
          >
            <img 
              src="/supportIcons/Support.svg" 
              alt="Support" 
              className={`transition-all duration-300 ${
                isExpanded ? 'w-10 h-10' : 'w-14 h-14'
              }`} 
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupportWidget;