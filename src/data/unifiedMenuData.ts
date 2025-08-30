import { MenuKey, MegaMenuData, InfoMenuData } from './menuTypes';

// ✅ ЕДИНЫЕ данные для ОБОИХ хедеров
export const UNIFIED_MENU_DATA: Record<MenuKey, MegaMenuData | InfoMenuData> = {
  'обувь': {
    title: 'ОБУВЬ',
    categories: [
      'все',
      'кеды и кроссовки',
      'ботинки и угги',
      'слэды',
      'детская обувь'
    ],
    links: {
      'все': '/catalog',
      'кеды и кроссовки': '/catalog?categories=Кроссовки+и+кеды',
      'ботинки и угги': '/catalog?categories=Ботинки+и+угги',
      'слэды': '/catalog?categories=Слэды',
      'детская обувь': '/catalog?categories=Детская+обувь'
    },
    subcategories: [
      'новые релизы',
      'эксклюзивы',
      'мастхэв',
      'хиты продаж',
      'коллаборации'
    ]
  },
  'одежда': {
    title: 'ОДЕЖДА',
    categories: [
      'все',
      'куртки и пуховики',
      'футболки и лонгсливы',
      'штаны и джинсы',
      'шорты',
      'худи и свитшоты'
    ],
    links: {
      'все': '/catalog',
      'куртки и пуховики': '/catalog?categories=Пуховики+и+куртки',
      'футболки и лонгсливы': '/catalog?categories=Футболки+и+поло',
      'штаны и джинсы': '/catalog?categories=Штаны+и+брюки',
      'шорты': '/catalog?categories=Шорты',
      'худи и свитшоты': '/catalog?categories=Толстовки+и+свитшоты'
    },
    subcategories: [
      'худи и свитшоты',
      'другая одежда'
    ],
    additional: [
      'новые релизы',
      'эксклюзивы',
      'мастхэв',
      'хиты продаж',
      'коллаборации'
    ]
  },
  'аксессуары': {
    title: 'АКСЕССУАРЫ',
    categories: [
      'все',
      'белье',
      'головные уборы',
      'рюкзаки и сумки',
      'кошельки'
    ],
    links: {
      'все': '/catalog?categories=Аксессуары',
      'белье': '/catalog?categories=Белье',
      'головные уборы': '/catalog?categories=Головные+уборы',
      'рюкзаки и сумки': '/catalog?categories=Сумки+и+рюкзаки',
      'кошельки': '/catalog?categories=Кошельки'
    },
    subcategories: [
      'очки',
      'другие аксессуары'
    ],
    additional: [
      'новые релизы',
      'эксклюзивы',
      'мастхэв',
      'хиты продаж',
      'коллаборации'
    ]
  },
  'коллекции': {
    title: 'КОЛЛЕКЦИИ',
    categories: [
      'все',
      'другие аксессуары',
      'фигурки',
      'предметы интерьера',
      'другое всё'
    ],
    links: {
      'все': '/catalog?categories=Коллекция',
      'другие аксессуары': '/catalog?categories=Аксессуары',
      'фигурки': '/catalog?categories=Фигурки',
      'предметы интерьера': '/catalog?categories=Предметы+интерьера',
      'другое всё': '/catalog?categories=Другое'
    },
    subcategories: [
      'новые релизы',
      'эксклюзивы',
      'мастхэв',
      'хиты продаж',
      'коллаборации'
    ]
  },
  'другое': {
    title: 'ДРУГОЕ',
    categories: [
      'все',
      'электроника',
      'товары для дома',
      'спорт и отдых',
      'красота и здоровье'
    ],
    links: {
      'все': '/catalog',
      'электроника': '/catalog?categories=Электроника',
      'товары для дома': '/catalog?categories=Товары+для+дома',
      'спорт и отдых': '/catalog?categories=Спорт+и+отдых',
      'красота и здоровье': '/catalog?categories=Красота+и+здоровье'
    },
    subcategories: [
      'новые релизы',
      'эксклюзивы',
      'мастхэв',
      'хиты продаж',
      'коллаборации'
    ]
  },
  'бренды': {
    title: 'БРЕНДЫ',
    categories: [
      'все',
      'nike',
      'adidas',
      'puma',
      'reebok'
    ],
    links: {
      'все': '/catalog',
      'nike': '/catalog?brands=Nike',
      'adidas': '/catalog?brands=Adidas',
      'puma': '/catalog?brands=Puma',
      'reebok': '/catalog?brands=Reebok'
    },
    subcategories: [
      'новые релизы',
      'эксклюзивы',
      'мастхэв',
      'хиты продаж',
      'коллаборации'
    ]
  },
  'информация': {
    title: 'ИНФОРМАЦИЯ',
    categories: [
      'контакты',
      'доставка', 
      'возврат',
      'оплата',
      'FAQ',
      'о нас'
    ],
    links: {  
      'контакты': '/contacts',
      'доставка': '/delivery',
      'возврат': '/returns', 
      'оплата': '/payment',
      'FAQ': '/faq',
      'о нас': '/about'
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
