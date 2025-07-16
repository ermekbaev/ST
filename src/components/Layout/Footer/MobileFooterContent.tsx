// MobileFooterContent.tsx
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
        { label: 'sale', href: '/catalog' },
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
        { label: 'контакты', href: '/contacts' },
        { label: 'доставка', href: '/delivery' },
        { label: 'оплата', href: '/payment' },
        { label: 'возврат', href: '/returns' },
        { label: 'FAQ', href: '/faq' },
        { label: 'о нас', href: '/about' }
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
  ];

  return (
    <div>
      {/* Аккордеон секций */}
      <div className="space-y-0">
        {sections.map((section) => (
          <div key={section.key} className="border-b border-gray-700">
            <button
              onClick={() => toggleSection(section.key)}
              className="footer-accordion-btn"
            >
              <span className="footer-accordion-title">
                {section.title}
              </span>
              <div 
                className="footer-accordion-icon"
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
              className={`footer-accordion-content ${
                openSections[section.key] ? 'footer-accordion-content--open' : ''
              }`}
            >
              <ul className="footer-accordion-list">
                {section.items.map((item, index) => (
                  <li key={index}>
                    <a 
                      href={item.href} 
                      className="footer-accordion-link"
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
      <div className="footer-social">
        <a 
          href="#" 
          className="footer-social-btn"
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
          className="footer-social-btn"
          aria-label="Instagram"
        >
          <img 
            src="/social/inst.svg" 
            alt="Instagram" 
            className="w-7 h-7"
          />
        </a>

        <a 
          href="https://t.me/TIGRSHOPsupport" 
          className="footer-social-btn"
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
          className="footer-social-btn"
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