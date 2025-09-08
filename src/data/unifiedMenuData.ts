import { MenuKey, MegaMenuData, InfoMenuData } from './menuTypes';

// ✅ ЕДИНЫЕ данные для ОБОИХ хедеров
export const UNIFIED_MENU_DATA: Record<MenuKey, MegaMenuData | InfoMenuData> = {
  'обувь': {
    title: 'ОБУВЬ',
    categories: [
      'Все',
      'Кеды и кроссовки',
      'Ботинки и угги',
    ],
    links: {
      'Все': '/catalog',
      'Кеды и кроссовки': '/catalog?categories=Кроссовки+и+кеды',
      'Ботинки и угги': '/catalog?categories=Ботинки+и+угги',
    },
    subcategories: [
      'Новые релизы',
      'Эксклюзивы',
      'Мастхэв',
      'Хиты продаж',
      'Коллаборации'
    ]
  },
  'одежда': {
    title: 'ОДЕЖДА',
    categories: [
      'Все',
      'Куртки и пуховики',
      'Футболки и лонгсливы',
      'Штаны и джинсы',
      'Шорты',
      'Худи и свитшоты'
    ],
    links: {
      'Все': '/catalog',
      'Куртки и пуховики': '/catalog?categories=Пуховики+и+куртки',
      'Футболки и лонгсливы': '/catalog?categories=Футболки+и+поло',
      'Штаны и джинсы': '/catalog?categories=Штаны+и+брюки',
      'Шорты': '/catalog?categories=Шорты',
      'Худи и свитшоты': '/catalog?categories=Толстовки+и+свитшоты'
    },
    subcategories: [
      'Худи и свитшоты',
      'Другая одежда'
    ],
    additional: [
      'Новые релизы',
      'Эксклюзивы',
      'Мастхэв',
      'Хиты продаж',
      'Коллаборации'
    ]
  },
  'аксессуары': {
    title: 'АКСЕССУАРЫ',
    categories: [
      'Все',
      'Бельё',
      'Головные уборы',
      'Рюкзаки и сумки',
      'Кошельки'
    ],
    links: {
      'Все': '/catalog?categories=Аксессуары',
      'Бельё': '/catalog?categories=Бельё',
      'Головные уборы': '/catalog?categories=Головные+уборы',
      'Рюкзаки и сумки': '/catalog?categories=Сумки+и+рюкзаки',
      'Кошельки': '/catalog?categories=Кошельки'
    },
    subcategories: [
      'Очки',
      'Другие аксессуары'
    ],
    additional: [
      'Новые релизы',
      'Эксклюзивы',
      'Мастхэв',
      'Хиты продаж',
      'Коллаборации'
    ]
  },
  'коллекции': {
    title: 'КОЛЛЕКЦИИ',
    categories: [
      'Все',
      'Фигурки',
    ],
    links: {
      'Все': '/catalog?categories=Коллекция',
      'Фигурки': '/catalog?categories=Фигурки',
    },
    subcategories: [
      'Новые релизы',
      'Эксклюзивы',
      'Мастхэв',
      'Хиты продаж',
      'Коллаборации'
    ]
  },
  'другое': {
    title: 'ДРУГОЕ',
    categories: [
      'Все',
      'Электроника',
      'Спорт и отдых',
    ],
    links: {
      'Все': '/catalog',
      'Электроника': '/catalog?categories=Электроника',
      'Спорт и отдых': '/catalog?categories=Спорт+и+отдых',
    },
    subcategories: [
      'Новые релизы',
      'Эксклюзивы',
      'Мастхэв',
      'Хиты продаж',
      'Коллаборации'
    ]
  },
  'бренды': {
    title: 'БРЕНДЫ',
    categories: [
      'Все',
      'Nike',
      'Adidas',
      'Puma',
      'Reebok'
    ],
    links: {
      'Все': '/catalog',
      'Nike': '/catalog?brands=Nike',
      'Adidas': '/catalog?brands=Adidas',
      'Puma': '/catalog?brands=Puma',
      'Reebok': '/catalog?brands=Reebok'
    },
    subcategories: [
      'Новые релизы',
      'Эксклюзивы',
      'Мастхэв',
      'Хиты продаж',
      'Коллаборации'
    ]
  },
  'информация': {
    title: 'ИНФОРМАЦИЯ',
    categories: [
      'Контакты',
      'Доставка', 
      'Возврат',
      'Оплата',
      'FAQ',
      'О нас'
    ],
    links: {  
      'Контакты': '/contacts',
      'Доставка': '/delivery',
      'Возврат': '/returns', 
      'Оплата': '/payment',
      'FAQ': '/faq',
      'О нас': '/about'
    },
    subcategories: [] 
  }
};

export const MENU_ITEMS: string[] = [
  'sale',
  'обувь',
  'одежда',
  'аксессуары',
  'коллекции',
  'другое',
  'бренды',
  'информация'
];

// ✅ Хелперы для типобезопасности
export const isInfoSection = (section: MegaMenuData | InfoMenuData): section is InfoMenuData => {
  return 'links' in section && Array.isArray((section as InfoMenuData).links);
};

export const isMegaMenuSection = (section: MegaMenuData | InfoMenuData): section is MegaMenuData => {
  return 'categories' in section;
};
