// components/Footer/FooterContent.tsx
import React from 'react';

const FooterContent = () => {
  return (
    <div className="flex flex-wrap lg:flex-nowrap">
      <div className="w-full lg:w-auto space-y-4">
        <h3 className="text-white font-medium text-xl uppercase tracking-wider">
          РАЗДЕЛЫ
        </h3>
        <ul className="space-y-3">
          <li>
            <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
              sale
            </a>
          </li>
          <li>
            <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
              обувь
            </a>
          </li>
          <li>
            <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
              одежда
            </a>
          </li>
          <li>
            <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
              аксессуары
            </a>
          </li>
          <li>
            <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
              коллекции
            </a>
          </li>
          <li>
            <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
              другое
            </a>
          </li>
        </ul>
      </div>

      <div className="hidden lg:block w-[204px]"></div>

      <div className="w-full lg:w-auto space-y-4">
        <h3 className="text-white font-medium text-xl uppercase tracking-wider">
          ИНФОРМАЦИЯ
        </h3>
        <ul className="space-y-3">
          <li>
            <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
              контакты
            </a>
          </li>
          <li>
            <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
              доставка
            </a>
          </li>
          <li>
            <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
              оплата
            </a>
          </li>
          <li>
            <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
              возврат
            </a>
          </li>
          <li>
            <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
              FAQ
            </a>
          </li>
          <li>
            <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
              о нас
            </a>
          </li>
        </ul>
      </div>

      <div className="hidden lg:block w-[446px]"></div>

      <div className="w-full lg:w-auto space-y-4">
        <h3 className="text-white font-medium text-xl uppercase tracking-wider">
          КОНТАКТЫ
        </h3>
        <div className="space-y-3">
          <div className="text-gray-300 text-sm">
            <a href="tel:+79962814667" className="hover:text-white transition-colors">
              +7 (996) 281-46-67
            </a>
          </div>
          <div className="text-gray-300 text-sm">
            <a href="mailto:tigran200615@gmail.com" className="hover:text-white transition-colors">
              em: tigran200615@gmail.com
            </a>
          </div>
          <div className="text-gray-300 text-sm">
            tg: @PadvdH
          </div>
          <div className="text-gray-300 text-sm">
            <a href="https://wa.me/79962814667" className="hover:text-white transition-colors">
              wa: +79962814667
            </a>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-auto lg:ml-auto space-y-4">
        <div className="flex justify-start lg:justify-end space-x-3">
          <a 
            href="#" 
            className="w-10 h-10 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
            aria-label="VKontakte"
          >
            <img 
              src="/social/vk.svg" 
              alt="VK" 
              className="w-6 h-6"
            />
          </a>

          <a 
            href="#" 
            className="w-10 h-10 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
            aria-label="Instagram"
          >
            <img 
              src="/social/inst.svg" 
              alt="Instagram" 
              className="w-6 h-6"
            />
          </a>

          <a 
            href="#" 
            className="w-10 h-10 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
            aria-label="Telegram"
          >
            <img 
              src="/social/tg.svg" 
              alt="Telegram" 
              className="w-6 h-6"
            />
          </a>

          <a 
            href="https://wa.me/79962814667" 
            className="w-10 h-10 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
            aria-label="WhatsApp"
          >
            <img 
              src="/social/wa.svg" 
              alt="WhatsApp" 
              className="w-6 h-6"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default FooterContent;