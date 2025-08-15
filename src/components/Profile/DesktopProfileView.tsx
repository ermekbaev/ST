'use client';

import React from 'react';

interface User {
  name: string;
  phone: string;
  email: string;
}

interface DesktopProfileProps {
  user: User | null;
  isLoading: boolean;
  agreeToMarketing: boolean;
  setAgreeToMarketing: (value: boolean) => void;
  handleEditField: (field: string) => void;
  handleOrderHistory: () => void;
  handleLogout: () => void;
}

export const DesktopProfileView: React.FC<DesktopProfileProps> = ({
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
        <div className="text-center p-8">
          <p className="font-product text-brand-gray">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-5 pt-12">
        
        {/* ВЕРХНИЙ БЛОК - Заголовок и кнопки */}
        <div className="flex items-center justify-between mb-[90px]">
          
          {/* Левый блок - Заголовок */}
          <span className="font-banner font-bold text-[50px] leading-[61px] text-black uppercase py-2">
            ЛИЧНЫЙ КАБИНЕТ
          </span>

          {/* Центральный блок - Линия */}
          <div className="flex-1 mx-12">
            <div className="w-full h-0 border-t-2 border-black"></div>
          </div>

          {/* Правый блок - Кнопки */}
          <div className="flex flex-wrap gap-12">
            <button
              onClick={handleOrderHistory}
              className="w-[218px] h-[41.42px] bg-black text-white font-product text-[20px] leading-[27px] hover:bg-gray-800 transition-colors flex items-center justify-center"
            >
              ИСТОРИЯ ЗАКАЗОВ
            </button>

            <button
              onClick={handleLogout}
              className="w-[218px] h-[41.42px] bg-[#BFB3A3] text-[#595047] font-product text-[20px] leading-[27px] hover:bg-[#a69a89] transition-colors flex items-center justify-center"
            >
              ВЫЙТИ
            </button>
          </div>
        </div>

        {/* ОСНОВНОЙ ТЕКСТОВЫЙ БЛОК - два столбца */}
        <div className="flex w-2xs">
          
          {/* Левый блок - только данные */}
          <div className="flex-1 space-y-[17px]">
            
            {/* Блок Имя, Фамилия */}
            <div>
              <p className="font-product text-[20px] leading-[27px] text-[#595047]">
                Имя, Фамилия
              </p>
              <p className="font-product text-[25px] leading-[34px] text-black">
                {user?.name}
              </p>
            </div>

            {/* Блок Телефон */}
            <div>
              <p className="font-product text-[20px] leading-[27px] text-[#595047]">
                Телефон
              </p>
              <p className="font-product text-[25px] leading-[34px] text-black">
                {user?.phone}
              </p>
            </div>

            {/* Блок Почта */}
            <div>
              <p className="font-product text-[20px] leading-[27px] text-[#595047]">
                Почта
              </p>
              <p className="font-product text-[25px] leading-[34px] text-black">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* ЧЕКБОКС - взят из чекаута */}
        <div className="mt-[44px]">
          <label className="flex items-center gap-4 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeToMarketing}
              onChange={(e) => setAgreeToMarketing(e.target.checked)}
              className="sr-only"
            />
            <div 
              className={`w-4 h-4 border border-black relative ${agreeToMarketing ? 'bg-black' : 'bg-white'}`}
            >
              {agreeToMarketing && (
                <svg 
                  width="10" 
                  height="8" 
                  viewBox="0 0 10 8" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute top-[2px] left-[2px]"
                >
                  <path d="M1 3L4 6L9 1" stroke="white" strokeWidth="1.5"/>
                </svg>
              )}
            </div>
            <span className="font-product text-[15px] leading-[20px] text-black">
              Согласен(-а) на получение рекламно-информационной рассылки
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};