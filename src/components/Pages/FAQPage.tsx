'use client';

import React, { useState, useEffect } from 'react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQPage: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const faqData: FAQItem[] = [
    // ТОВАР
    {
      id: 'original-products',
      question: 'Вы реализуете оригинальные товары?',
      answer: 'В нашем магазине вы можете быть абсолютно уверены в подлинности каждого приобретаемого товара. Мы строго следуем политике продажи исключительно новых и гарантированно оригинальных изделий.'
    },
    {
      id: 'new-products',
      question: 'В Вашем магазине представлены новые товары?',
      answer: 'Мы продаём только новые оригинальные товары в их первозданном состоянии.'
    },
    {
      id: 'sizes',
      question: 'Какие размеры указаны на сайте?',
      answer: 'Вы можете самостоятельно определить свой размер, воспользовавшись таблицей размеров на странице товара. Вся обувь на сайте представлена в RU размерах. Для удобства в таблице размеров показано соответствие RU размеров с UK, EUR, US размерами и длиной стопы.'
    },
    {
      id: 'size-pricing',
      question: 'Почему цена зависит от размера?',
      answer: 'Все модели и размеры выпускаются в ограниченном количестве, стоимость каждого размера зависит от спроса на него на рынке.'
    },
    {
      id: 'price-formation',
      question: 'Как формируются цены на сайте?',
      answer: 'Все модели выпускаются в ограниченном тираже и быстро распродаются. Стоимость товара формирует его спрос и количество на рынке. Цена может вырасти или упасть, в зависимости от времени, сезона и при переиздании модели.'
    },
    // ДОСТАВКА И ВОЗВРАТ
    {
      id: 'payment-options',
      question: 'Какие варианты оплаты доступны?',
      answer: 'При оформлении заказа на сайте оплата доступна: онлайн банковской картой. В городе Владивосток, заказ можно оплатить наличными'
    },
    {
      id: 'wrong-product',
      question: 'Что делать, если пришел другой товар?',
      answer: 'В этом случае Вам стоит незамедлительно связаться с нами. Менеджер подробно изучит всю информацию по Вашему заказу и проинформирует о дальнейших действиях. Связаться с нами можно по адресу: tigran200615@gmail.com'
    },
    {
      id: 'defective-product',
      question: 'Что делать, если товар пришел с браком или дефектом?',
      answer: 'Свяжитесь с нами удобным для Вас способом, сообщите характер проблемы, номер заказа и дату получения, а также прикрепите несколько фотографий дефекта. Нам потребуется немного времени, чтобы изучить проблему, но мы постараемся максимально быстро решить Ваш вопрос.'
    },
    {
      id: 'returns',
      question: 'Возможен ли возврат товара?',
      answer: 'Если Ваш заказ пришёл с браком, Вы можете обменять товар в течение 7 дней с момента получения при условии, что первоначальный вид полностью сохранен, в том числе все навесные бирки, оригинальная упаковка и этикетки. Обратите внимание, что при обмене вы самостоятельно несете все связанные с этим расходы, в том числе расходы на доставку. В том случае, если брак будет доказан, то Мы произведём возврат средств'
    },
    {
      id: 'self-pickup',
      question: 'Могу ли я сам забрать свой заказ?',
      answer: 'Да, Вы можете оформить самовывоз в городе Владивосток'
    },
    {
      id: 'track-order',
      question: 'Как я могу отследить свой заказ?',
      answer: 'Просто войдите в свою учетную запись, чтобы просмотреть последний статус заказа. Как только заказ будет отправлен, вы получите сообщение с информацией об отслеживании, чтобы вы знали, когда ожидать доставку. Пожалуйста, свяжитесь с нашей службой поддержки клиентов, если у вас возникли проблемы с отслеживанием вашего заказа.'
    },
    {
      id: 'order-origin',
      question: 'Откуда идёт Мой заказ?',
      answer: 'Мы покупаем и привозим каждую вещь индивидуально, под каждого клиента. Вещи выкупаем на различных зарубежных площадках, которые реализуют оригинальную продукцию. Все вещи идут сначала до Владивостока, затем отправляются логистическими компаниями к вам. Цена на сайте указана до Владивостока. За цену отправки по стране продавец ответственности не несёт.'
    }
  ];

  // Группируем вопросы по категориям
  const productQuestions = faqData.slice(0, 5);
  const deliveryQuestions = faqData.slice(5);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const FAQAccordion = ({ item }: { item: FAQItem }) => {
    const isOpen = openItems[item.id];
    
    return (
      <div className="faq-item">
        {/* Линия сверху */}
        <div className="faq-divider"></div>
        
        {/* Вопрос */}
        <button
          onClick={() => toggleItem(item.id)}
          className="faq-question-button"
        >
          <span className="faq-question-text">
            {item.question}
          </span>
          
          {/* Стрелка */}
          <div 
            className="faq-arrow"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
          ></div>
        </button>
        
        {/* Ответ */}
        {isOpen && (
          <div className="faq-answer">
            <p className="faq-answer-text">
              {item.answer}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Контейнер страницы с отступами по 10px согласно макету */}
      <div className="px-[10px] lg:px-[10px] pb-4 lg:pb-6">

        {/* Заголовок с линией */}
        <div className="mb-8 pt-8">
          <div className="relative flex items-center">
            {/* Заголовок "FAQ" */}
            <h1 className="faq-page-title">
              FAQ
            </h1>
            
            {/* Линия справа от заголовка - только на десктопе */}
            <div className="faq-page-line"></div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="mt-[50px] lg:mt-[70px]">
          <div className="faq-page-content">
            
            {/* DESKTOP ВЕРСИЯ */}
            <div className="hidden lg:block">
              {/* Заголовок ТОВАР */}
              <div className="mb-8">
                <h2 className="faq-section-title">ТОВАР</h2>
                <div className="space-y-0">
                  {productQuestions.map((item) => (
                    <FAQAccordion key={item.id} item={item} />
                  ))}
                </div>
              </div>

              {/* Заголовок ДОСТАВКА И ВОЗВРАТ */}
              <div className="mb-8">
                <h2 className="faq-section-title">ДОСТАВКА И ВОЗВРАТ</h2>
                <div className="space-y-0">
                  {deliveryQuestions.map((item) => (
                    <FAQAccordion key={item.id} item={item} />
                  ))}
                </div>
              </div>
            </div>

            {/* MOBILE ВЕРСИЯ */}
            <div className="block lg:hidden">
              {/* Заголовок ТОВАР */}
              <div className="mb-6">
                <h2 className="faq-section-title-mobile">ТОВАР</h2>
                <div className="space-y-0">
                  {productQuestions.map((item) => (
                    <FAQAccordion key={item.id} item={item} />
                  ))}
                </div>
              </div>

              {/* Заголовок ДОСТАВКА И ВОЗВРАТ */}
              <div className="mb-6">
                <h2 className="faq-section-title-mobile">ДОСТАВКА И ВОЗВРАТ</h2>
                <div className="space-y-0">
                  {deliveryQuestions.map((item) => (
                    <FAQAccordion key={item.id} item={item} />
                  ))}
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;