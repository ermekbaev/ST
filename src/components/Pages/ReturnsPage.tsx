'use client'
import React from 'react';

const ReturnsPage = () => {
  // Функция для скачивания файлов
  const handleDownload = (fileType: 'shoes' | 'clothes') => {
    const fileUrls = {
      shoes: '/downloads/return-form-shoes.doc', // Путь к файлу заявления на обувь
      clothes: '/downloads/return-form-clothes.doc' // Путь к файлу заявления на одежду
    };

    const fileNames = {
      shoes: 'Заявление_на_возврат_обуви.pdf',
      clothes: 'Заявление_на_возврат_одежды.pdf'
    };

    // Создаем ссылку для скачивания
    const link = document.createElement('a');
    link.href = fileUrls[fileType];
    link.download = fileNames[fileType];
    link.style.display = 'none';
    
    // Добавляем в DOM, кликаем и удаляем
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-white pb-16">
      {/* Page Title with Line */}
      <div className="px-5 pt-8 lg:pt-12">
        <div className="flex items-center mb-8 lg:mb-12">
          <h1 className="font-black italic text-[28px] leading-[24px] lg:text-[40px] lg:leading-[48px] text-black uppercase w-[180px] lg:w-[260px] min-w-[180px] lg:min-w-[260px]">
            ВОЗВРАТ
          </h1>
          <div className="hidden lg:block bg-black h-[2px] flex-1 ml-[71px]"></div>
        </div>

        {/* Main Content */}
        <div className="text-[20px] lg:text-[30px] leading-[30px] lg:leading-[45px]">
          
          {/* Main Title */}
          <div className="mb-8 lg:mb-12 font-black text-black">
            УСЛОВИЯ ВОЗВРАТА И ОБМЕНА
          </div>

          {/* Content Sections */}
          <div className="space-y-4 lg:space-y-6">
            
            {/* Defective Products Section */}
            <div className="text-[15px] lg:text-[20px] leading-[20px] lg:leading-[30px] text-black">
              <p className="mb-4 lg:mb-6">
                *Если вы считаете, что вам пришел товар с браком или товар ненадлежащего качества, 
                свяжитесь с нами по почте <a href="mailto:contact@tigrshop.ru" className="underline hover:text-gray-600 transition-colors">contact@tigrshop.ru</a>
              </p>
              <p className="mb-4 lg:mb-6">
                Приложите к обращению фото и подробное описание вашей проблемы, наша команда свяжется 
                с вами и мы обязательно решим этот вопрос в частном порядке
              </p>
              <p className="mb-6 lg:mb-8">
                *Обмен товара производится исключительно через возврат и оформление нового заказа
              </p>
            </div>

            {/* Step-by-step Instructions */}
            <div className="text-[15px] lg:text-[20px] leading-[20px] lg:leading-[30px] text-black">
              <p className="mb-4 lg:mb-6">
                Для возврата Товара надлежащего качества покупатель обязан произвести следующие 
                действия согласно пошаговой инструкции:
              </p>

              {/* Step 1 */}
              <div className="mb-6 lg:mb-8">
                <p className="mb-3 lg:mb-4">
                  <strong>1.</strong> Распечатать и заполнить бланк возврата (Обязательно заполните все пункты)
                </p>
                <p className="mb-2 lg:mb-3">Бланк возврата можно скачать тут:</p>
                <div className="ml-4 space-y-1 lg:space-y-2">
                  <p>- <button 
                      onClick={() => handleDownload('shoes')} 
                      className="underline hover:text-gray-600 transition-colors cursor-pointer bg-transparent border-none p-0 text-inherit font-inherit"
                    >
                      Заявление на обувь
                    </button></p>
                  <p>- <button 
                      onClick={() => handleDownload('clothes')} 
                      className="underline hover:text-gray-600 transition-colors cursor-pointer bg-transparent border-none p-0 text-inherit font-inherit"
                    >
                      Заявление на одежду
                    </button></p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="mb-6 lg:mb-8">
                <p className="mb-3 lg:mb-4">
                  <strong>2.</strong> Вложить заполненный бланк возврата и надежно упаковать товар в 
                  транспортировочную коробку (Ответственность за товар до момента приема посылки в 
                  магазине несет покупатель)
                </p>
                <p className="mb-3 lg:mb-4">
                  К заказу на возврат/обмен должны быть приложен чек и товарная накладная.
                </p>
                <p className="mb-3 lg:mb-4">
                  При отправке почтовым отправлением либо курьерской службой возврат/обмен оформляется 
                  в виде посылки с описью вложения с отметкой «Возврат товара»/ «Обмен товара».
                </p>
              </div>

              {/* Step 3 */}
              <div className="mb-6 lg:mb-8">
                <p className="mb-3 lg:mb-4">
                  <strong>3.</strong> Отправить посылку по указанному ниже адресу (Пересылку товара 
                  надлежащего качества оплачивает покупатель)
                </p>
                <div className="ml-4 space-y-1 lg:space-y-2">
                  <p>г.Владивосток, ул. 1-я пригородная д. 15</p>
                  <p>тел.: +7 950 298 46 67</p>
                  <p>Получатель: ИП "Айвазян Тигран"</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="mb-6 lg:mb-8">
                <p>
                  <strong>4.</strong> Ожидать квитанцию о проведении возврата средств на почту 
                  (В случае возникновения дополнительных вопросов, сотрудники свяжутся с вами по 
                  указанным в бланке возврата данным)
                </p>
              </div>
            </div>

            {/* Pickup Location */}
            <div className="text-[15px] lg:text-[20px] leading-[20px] lg:leading-[30px] text-black">
              <p className="mb-3 lg:mb-4">
                Товар также может быть возвращен в <a href="/contacts" className="underline hover:text-gray-600 transition-colors">пункте самовывоза</a> по адресу:
              </p>
              <div className="ml-4 mb-3 lg:mb-4">
                <p>г.Владивосток ул. 1-я пригородная 15</p>
              </div>
              <p className="mb-3 lg:mb-4">
                Для возврата в магазине необходимо заполнить бланк возврата и передать комплект 
                сотруднику магазина.
              </p>
              <p className="mb-4 lg:mb-6">
                <button 
                  onClick={() => handleDownload('shoes')} 
                  className="underline hover:text-gray-600 transition-colors cursor-pointer bg-transparent border-none p-0 text-inherit font-inherit"
                >
                  Бланк возврата можно скачать тут
                </button>
              </p>
              <p>
                Спасибо за доверие! Будем рады видеть вас снова
              </p>
            </div>

            {/* Additional Terms */}
            <div className="text-[15px] lg:text-[20px] leading-[20px] lg:leading-[30px] text-black">
              <div className="text-[18px] lg:text-[24px] leading-[27px] lg:leading-[36px] mb-6 lg:mb-8 font-black">
                Дополнительно приложения к процессу возврата товара в TIGR SHOP
              </div>

              <div className="space-y-4 lg:space-y-6">
                <p>
                  Продавец вправе в течение 10 рабочих дней с момента возврата товара ненадлежащего 
                  качества провести проверку его качества.
                </p>

                <p>
                  В случае, если Покупатель отказывается от товара надлежащего качества, Продавец 
                  возвращает денежные средства в течение 10 дней с момента получения возвращаемого Товара. 
                  Покупатель не вправе отказаться от Товара надлежащего качества, имеющего индивидуально-определенные 
                  свойства, если указанный Товар может быть использован исключительно приобретающим его потребителем.
                </p>

                <div>
                  <p className="mb-3 lg:mb-4 font-semibold">
                    Возврат денежных средств может быть осуществлен одним из следующих способов:
                  </p>
                  
                  <div className="space-y-3 lg:space-y-4">
                    <p>
                      - Путем перечисления на расчетный счет Покупателя, с которого производилась оплата 
                      (в случае оплаты банковской картой на Сайте);
                    </p>

                    <p>
                      - Для возврата денежных средств на банковскую карту Покупателю необходимо заполнить 
                      «Заявление о возврате денежных средств», Возврат денежных средств будет осуществлен 
                      на банковский счет Покупателя, указанный в заявлении, в течение 10 (Десяти) рабочих 
                      дней со дня получения «Заявление о возврате денежных средств» Продавцом.
                    </p>

                    <p>
                      - Возврат денежных средств осуществляется только лицу, приобретавшему товар, либо 
                      лицу, уполномоченному на получение денежных средств нотариально удостоверенной доверенностью.
                    </p>

                    <p>
                      - В случае, если Покупатель отказывается от товара ненадлежащего качества, Продавец 
                      возвращает денежные средства в течение 10 дней с момента завершения проверки (если она проводится) 
                      качества при условии, что выводы проверки подтверждают наличие производственных дефектов. 
                      Замена товара ненадлежащего качества производится в течение 14 дней с момента предъявления 
                      требования Покупателя, а при необходимости дополнительной проверки качества товара - в 
                      течение 30 дней со дня предъявления указанного требования. Если у Продавца в момент 
                      предъявления требования отсутствует необходимый для замены товар, замена производится 
                      в течение месяца со дня предъявления такого требования.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnsPage;