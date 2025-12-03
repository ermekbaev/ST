import React from "react";

const FooterContent = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-0">
      <div className="lg:col-span-2 space-y-4">
        <h3 className="text-white font-medium text-xl uppercase tracking-wider">
          РАЗДЕЛЫ
        </h3>
        <ul className="space-y-3">
          {/* <li>
            <a href="/catalog" className="text-gray-300 hover:text-white transition-colors text-sm">
              sale
            </a>
          </li> */}
          <li>
            <a
              href="/catalog?categories=Кроссовки+и+кеды,Шлёпанцы+и+сандалии,Ботинки+и+угги"
              className="text-gray-300 hover:text-white transition-colors text-sm"
            >
              обувь
            </a>
          </li>
          <li>
            <a
              href="/catalog?categories=Толстовки+и+свитшоты,Футболки+и+поло,Штаны+и+брюки,Шорты,Пуховики+и+куртки"
              className="text-gray-300 hover:text-white transition-colors text-sm"
            >
              одежда
            </a>
          </li>
          <li>
            <a
              href="/catalog?categories=Аксессуары,Головные+уборы,Кошельки,Сумки+и+рюкзаки,Бельё"
              className="text-gray-300 hover:text-white transition-colors text-sm"
            >
              аксессуары
            </a>
          </li>
          <li>
            <a
              href="/catalog?categories=Коллекция,Фигурки"
              className="text-gray-300 hover:text-white transition-colors text-sm"
            >
              коллекции
            </a>
          </li>
          <li>
            <a
              href="/catalog?categories=Спорт+и+отдых,Электроника"
              className="text-gray-300 hover:text-white transition-colors text-sm"
            >
              другое
            </a>
          </li>
        </ul>
      </div>

      {/* ИНФОРМАЦИЯ - занимает 2 колонки, начинается с 4-й (сблизили с РАЗДЕЛЫ) */}
      <div className="lg:col-span-2 lg:col-start-4 space-y-4">
        <h3 className="text-white font-medium text-xl uppercase tracking-wider">
          ИНФОРМАЦИЯ
        </h3>
        <ul className="space-y-3">
          <li>
            <a
              href="/contacts"
              className="text-gray-300 hover:text-white transition-colors text-sm"
            >
              контакты
            </a>
          </li>
          <li>
            <a
              href="/delivery"
              className="text-gray-300 hover:text-white transition-colors text-sm"
            >
              доставка
            </a>
          </li>
          <li>
            <a
              href="/payment"
              className="text-gray-300 hover:text-white transition-colors text-sm"
            >
              оплата
            </a>
          </li>
          <li>
            <a
              href="/returns"
              className="text-gray-300 hover:text-white transition-colors text-sm"
            >
              возврат
            </a>
          </li>
          <li>
            <a
              href="/faq"
              className="text-gray-300 hover:text-white transition-colors text-sm"
            >
              FAQ
            </a>
          </li>
          <li>
            <a
              href="/about"
              className="text-gray-300 hover:text-white transition-colors text-sm"
            >
              о нас
            </a>
          </li>
        </ul>
      </div>

      {/* КОНТАКТЫ - занимает 2 колонки, начинается с 8-й (равные отступы) */}
      <div className="lg:col-span-2 lg:col-start-8 space-y-4">
        <h3 className="text-white font-medium text-xl uppercase tracking-wider">
          КОНТАКТЫ
        </h3>
        <div className="space-y-3">
          <div className="text-gray-300 text-sm">
            <a
              href="tel:+79958714667"
              className="hover:text-white transition-colors"
            >
              +7 (995) 871-46-67
            </a>
          </div>
          <div className="text-gray-300 text-sm">
            <a
              href="mailto:contact@tigrshop.ru"
              className="hover:text-white transition-colors"
            >
              em: contact@tigrshop.ru
            </a>
          </div>
          <div className="text-gray-300 text-sm">
            <a
              href="https://t.me/TIGRSHOPsupport"
              className="hover:text-white transition-colors"
            >
              tg: @TIGRSHOPsupport
            </a>
          </div>
          <div className="text-gray-300 text-sm">
            <a
              href="https://wa.me/79958714667"
              className="hover:text-white transition-colors"
            >
              wa: +79958714667
            </a>
          </div>
        </div>
      </div>

      {/* СОЦИАЛЬНЫЕ ИКОНКИ - занимают 2 колонки, последние */}
      <div className="lg:col-span-2 lg:col-start-11 space-y-4">
        <div className="flex justify-start lg:justify-end space-x-3">
          <a
            href="https://www.instagram.com/tigrshop.ru?"
            className="w-10 h-10 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
            aria-label="Instagram"
          >
            <img src="/social/inst.svg" alt="Instagram" className="w-6 h-6" />
          </a>

          <a
            href="https://t.me/TIGRSHOPsupport"
            className="w-10 h-10 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
            aria-label="Telegram"
          >
            <img src="/social/tg.svg" alt="Telegram" className="w-6 h-6" />
          </a>

          <a
            href="https://wa.me/79958714667"
            className="w-10 h-10 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
            aria-label="WhatsApp"
          >
            <img src="/social/wa.svg" alt="WhatsApp" className="w-6 h-6" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default FooterContent;
