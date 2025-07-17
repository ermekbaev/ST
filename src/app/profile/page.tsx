'use client';

import { useState, useEffect } from 'react';

// Типы для данных пользователя
interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

const UserProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [agreeToMarketing, setAgreeToMarketing] = useState(false);

  // useEffect(() => {
  //   loadUserData();
  // }, []);

  // const loadUserData = () => {
  //   setLoading(true);
    
  //   setTimeout(() => {
  //     const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  //     if (currentUser) {
  //       setUser(currentUser);
  //       setProfileForm({
  //         name: currentUser.name,
  //         email: currentUser.email,
  //         phone: currentUser.phone || ''
  //       });
  //     }
  //     setLoading(false);
  //   }, 500);
  // };

  // Временные моковые данные для разработки
  useEffect(() => {
    const mockUser = {
      id: 1,
      name: 'Иван Иванов',
      email: 'ivaniv@mail.com',
      phone: '+7 (895) 457-71-21',
      createdAt: '2025-01-15'
    };
    
    setUser(mockUser);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  };

  const handleOrderHistory = () => {
    console.log('Переход к истории заказов');
    // Здесь будет логика перехода к истории заказов
  };

  const handleEditField = (field: string) => {
    console.log(`Редактирование поля: ${field}`);
    // Здесь будет логика редактирования конкретного поля
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-product text-brand-gray">Загрузка...</p>
        </div>
      </div>
    );
  }

  // if (!user) {
  //   return (
  //     <div className="min-h-screen bg-white flex items-center justify-center">
  //       <div className="text-center p-8">
  //         <h1 className="font-banner text-2xl text-black mb-4 uppercase">Доступ ограничен</h1>
  //         <p className="font-product text-brand-gray mb-6">Для доступа к личному кабинету необходимо авторизоваться</p>
  //         <button 
  //           onClick={() => window.location.href = '/'}
  //           className="bg-black text-white px-6 py-3 rounded-lg font-product hover:bg-gray-800 transition-colors"
  //         >
  //           На главную
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-white">
      {/* Основной контент - точно по Figma */}
      <div className="px-5 pt-12"> {/* Отступы для хедера, футера и боковые 20% */}
        
        {/* ВЕРХНИЙ БЛОК - Заголовок и кнопки */}
        <div className="flex items-center justify-between mb-[90px]">
          
          {/* Левый блок - Заголовок */}
          <span className="font-banner font-bold text-[30px] lg:text-[50px] leading-[35px] lg:leading-[61px] text-black uppercase px-4 py-2">
            ЛИЧНЫЙ КАБИНЕТ
          </span>

          {/* Центральный блок - Линия */}
          <div className="hidden lg:block flex-1 mx-12">
            <div className="w-full h-0 border-t-2 border-black"></div>
          </div>

          {/* Правый блок - Кнопки с justify-between */}
          <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 lg:justify-between">
            <button
              onClick={handleOrderHistory}
              className="w-full lg:w-[218px] h-[41.42px] bg-black text-white font-product text-[16px] lg:text-[20px] leading-[27px] hover:bg-gray-800 transition-colors"
            >
              ИСТОРИЯ ЗАКАЗОВ
            </button>

            <button
              onClick={handleLogout}
              className="w-full lg:w-[218px] h-[41.42px] bg-[#BFB3A3] text-[#595047] font-product text-[16px] lg:text-[20px] leading-[27px] hover:bg-[#a69a89] transition-colors"
            >
              ВЫЙТИ
            </button>
          </div>

        </div>

        {/* ОСНОВНОЙ ТЕКСТОВЫЙ БЛОК - два столбца */}
        <div className="flex w-2xs">
          
          {/* Левый блок - только данные */}
          <div className="flex-1 space-y-[17px] lg:space-y-[17px]">
            
            {/* Блок Имя, Фамилия */}
            <div>
              <p className="font-product text-[16px] lg:text-[20px] leading-[27px] text-[#595047]">
                Имя, Фамилия
              </p>
              <p className="font-product text-[20px] lg:text-[25px] leading-[29px] lg:leading-[34px] text-black">
                {user?.name}
              </p>
            </div>

            {/* Блок Телефон */}
            <div>
              <p className="font-product text-[16px] lg:text-[20px] leading-[27px] text-[#595047]">
                Телефон
              </p>
              <p className="font-product text-[20px] lg:text-[25px] leading-[29px] lg:leading-[34px] text-black">
                {user?.phone}
              </p>
            </div>

            {/* Блок Почта */}
            <div>
              <p className="font-product text-[16px] lg:text-[20px] leading-[27px] text-[#595047]">
                Почта
              </p>
              <p className="font-product text-[20px] lg:text-[25px] leading-[29px] lg:leading-[34px] text-black">
                {user?.email}
              </p>
            </div>

          </div>

          {/* Правый блок - только иконки редактирования в ряд */}
          <div className="flex flex-col space-y-8 lg:space-y-15 ml-8">
            
            {/* Иконка для Имя, Фамилия */}
            <button
              onClick={() => handleEditField('name')}
              className="w-[15px] h-[15px] hover:opacity-70 transition-opacity"
            >
              <div className="relative">
                <div className="w-[11px] h-[11px] border border-black absolute top-[4px] left-0"></div>
                <div className="w-[10px] h-[10px] border border-black absolute top-0 left-[5px]"></div>
              </div>
            </button>

            {/* Иконка для Телефон */}
            <button
              onClick={() => handleEditField('phone')}
              className="w-[15px] h-[15px] hover:opacity-70 transition-opacity"
            >
              <div className="relative">
                <div className="w-[11px] h-[11px] border border-black absolute top-[4px] left-0"></div>
                <div className="w-[10px] h-[10px] border border-black absolute top-0 left-[5px]"></div>
              </div>
            </button>

            {/* Иконка для Почта */}
            <button
              onClick={() => handleEditField('email')}
              className="w-[15px] h-[15px] hover:opacity-70 transition-opacity"
            >
              <div className="relative">
                <div className="w-[11px] h-[11px] border border-black absolute top-[4px] left-0"></div>
                <div className="w-[10px] h-[10px] border border-black absolute top-0 left-[5px]"></div>
              </div>
            </button>

          </div>

        </div>

        {/* ЧЕКБОКС - взят из чекаута */}
        <div className="mt-[44px]">
          <label className="checkout-checkbox-item">
            <input
              type="checkbox"
              checked={agreeToMarketing}
              onChange={(e) => setAgreeToMarketing(e.target.checked)}
              className="sr-only"
            />
            <div 
              className={`checkout-checkbox ${agreeToMarketing ? 'checkout-checkbox--checked' : ''}`}
            />
            <span className="checkout-checkbox-label text-[13px] lg:text-[15px]">
              Согласен(-а) на получение рекламно-информационной рассылки
            </span>
          </label>
        </div>

      </div>
    </div>
  );
};

export default UserProfilePage;