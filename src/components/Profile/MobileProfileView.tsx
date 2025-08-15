'use client';

import React from 'react';

interface User {
  name: string;
  phone: string;
  email: string;
}

interface MobileProfileProps {
  user: User | null;
  isLoading: boolean;
  agreeToMarketing: boolean;
  setAgreeToMarketing: (value: boolean) => void;
  handleEditField: (field: string) => void;
  handleOrderHistory: () => void;
  handleLogout: () => void;
}

export const MobileProfileView: React.FC<MobileProfileProps> = ({
  user,
  isLoading,
  agreeToMarketing,
  setAgreeToMarketing,
  handleEditField,
  handleOrderHistory,
  handleLogout
}) => {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="font-product text-brand-gray">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Основной контент */}
      <div className="px-[10px] pt-[50px]">
        
        {/* Заголовок */}
        <div className="mb-[41px] flex">
          <h1 className="font-banner font-bold text-[25px] leading-[30px] text-black uppercase">
            ЛИЧНЫЙ КАБИНЕТ
          </h1>
          
          {/* Короткая линия под заголовком */}
          <div className="w-full h-0 border-t border-black mt-[21px] "></div>
        </div>

        {/* Блоки данных пользователя */}
        <div className="space-y-[46px] mb-[45px]">
          
          {/* Блок Имя, Фамилия */}
          <div className="relative">
            <p className="font-product text-[15px] leading-[20px] text-[#595047] mb-[8px]">
              Имя, Фамилия
            </p>
            <p className="font-product text-[20px] leading-[27px] text-black">
              {user?.name}
            </p>
          </div>

          {/* Блок Телефон */}
          <div className="relative">
            <p className="font-product text-[15px] leading-[20px] text-[#595047] mb-[8px]">
              Телефон
            </p>
            <p className="font-product text-[20px] leading-[27px] text-black">
              {user?.phone}
            </p>
          </div>

          {/* Блок Почта */}
          <div className="relative">
            <p className="font-product text-[15px] leading-[20px] text-[#595047] mb-[8px]">
              Почта
            </p>
            <p className="font-product text-[20px] leading-[27px] text-black">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Чекбокс согласия */}
        <div className="mb-[27px]">
          <label className="flex items-center gap-[20px] cursor-pointer">
            <div className="relative mt-[2px]">
              <input
                type="checkbox"
                checked={agreeToMarketing}
                onChange={(e) => setAgreeToMarketing(e.target.checked)}
                className="sr-only"
              />
              <div 
                className={`w-[11px] h-[11px] border border-black ${
                  agreeToMarketing ? 'bg-black' : 'bg-white'
                }`}
              >
                {agreeToMarketing && (
                  <svg 
                    width="7" 
                    height="5" 
                    viewBox="0 0 7 5" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute top-[2px] left-[2px]"
                  >
                    <path d="M1 2L3 4L6 1" stroke="white" strokeWidth="1"/>
                  </svg>
                )}
              </div>
            </div>
            <span className="font-product text-[9px] leading-[12px] text-black mt-8 max-w-[280px]">
              Согласен(-а) на получение рекламно-информационной рассылки
            </span>
          </label>
        </div>

        {/* Разделительная линия */}
        <div className="w-full h-0 border-t border-black mb-[27px]"></div>

        {/* Кнопки */}
        <div className="space-y-[11px] mb-[60px]">
          {/* Кнопка История заказов */}
          <button
            onClick={handleOrderHistory}
            className="w-full h-[41px] bg-[#0B0B0D] text-white font-product text-[20px] leading-[27px] hover:bg-gray-800 transition-colors flex items-center justify-center"
          >
            ИСТОРИЯ ЗАКАЗОВ
          </button>

          {/* Кнопка Выйти */}
          <button
            onClick={handleLogout}
            className="w-full h-[41px] bg-[#BFB3A3] text-[#595047] font-product text-[20px] leading-[27px] hover:bg-[#a69a89] transition-colors flex items-center justify-center"
          >
            ВЫЙТИ
          </button>
        </div>
      </div>
    </div>
  );
};