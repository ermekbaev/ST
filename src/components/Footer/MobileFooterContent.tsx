import React, { useState } from 'react';

const MobileFooterContent = () => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const sections = [
    {
      title: 'РАЗДЕЛЫ',
      key: 'sections',
      items: [
        { label: 'sale', href: '#' },
        { label: 'обувь', href: '#' },
        { label: 'одежда', href: '#' },
        { label: 'аксессуары', href: '#' },
        { label: 'коллекции', href: '#' },
        { label: 'другое', href: '#' }
      ]
    },
    {
      title: 'ИНФОРМАЦИЯ',
      key: 'info',
      items: [
        { label: 'контакты', href: '#' },
        { label: 'доставка', href: '#' },
        { label: 'оплата', href: '#' },
        { label: 'возврат', href: '#' },
        { label: 'FAQ', href: '#' },
        { label: 'о нас', href: '#' }
      ]
    },
    {
      title: 'КОНТАКТЫ',
      key: 'contacts',
      items: [
        { label: '+7 (996) 281-46-67', href: 'tel:+79962814667' },
        { label: 'em: tigran200615@gmail.com', href: 'mailto:tigran200615@gmail.com' },
        { label: 'tg: @PadvdH', href: '#' },
        { label: 'wa: +79962814667', href: 'https://wa.me/79962814667' }
      ]
    },
    {
      title: 'ДЕТАЛИ',
      key: 'details',
      items: [
        { label: 'Подвал - 320 рх.', href: '#' }
      ]
    }
  ];

  return (
    <div>
      {/* Аккордеон секций */}
      <div className="space-y-0">
        {sections.map((section) => (
          <div key={section.key} className="border-b border-gray-700">
            <button
              onClick={() => toggleSection(section.key)}
              className="w-full flex items-center justify-between py-6 text-left"
            >
              <span 
                className="text-white font-medium text-lg uppercase tracking-wider"
                style={{ 
                  fontFamily: 'Random Grotesque, Arial, sans-serif',
                  fontWeight: 500
                }}
              >
                {section.title}
              </span>
              <div 
                className="w-5 h-5 flex items-center justify-center transition-transform duration-300"
                style={{
                  transform: openSections[section.key] ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              >
                <svg width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L8 8L15 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>

            {/* Контент секции */}
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openSections[section.key] ? 'max-h-96 pb-6' : 'max-h-0'
              }`}
            >
              <ul className="space-y-4">
                {section.items.map((item, index) => (
                  <li key={index}>
                    <a 
                      href={item.href} 
                      className="text-gray-300 hover:text-white transition-colors text-base"
                      style={{ 
                        fontFamily: 'Random Grotesque, Arial, sans-serif',
                        fontWeight: 400
                      }}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Социальные сети */}
      <div className="mt-12 flex items-center justify-center space-x-4">
        <a 
          href="#" 
          className="w-12 h-12 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
          aria-label="VKontakte"
        >
          <img 
            src="/social/vk.svg" 
            alt="VK" 
            className="w-7 h-7"
          />
        </a>

        <a 
          href="#" 
          className="w-12 h-12 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
          aria-label="Instagram"
        >
          <img 
            src="/social/inst.svg" 
            alt="Instagram" 
            className="w-7 h-7"
          />
        </a>

        <a 
          href="#" 
          className="w-12 h-12 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
          aria-label="Telegram"
        >
          <img 
            src="/social/tg.svg" 
            alt="Telegram" 
            className="w-7 h-7"
          />
        </a>

        <a 
          href="https://wa.me/79962814667" 
          className="w-12 h-12 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
          aria-label="WhatsApp"
        >
          <img 
            src="/social/wa.svg" 
            alt="WhatsApp" 
            className="w-7 h-7"
          />
        </a>
      </div>
    </div>
  );
};

export default MobileFooterContent;