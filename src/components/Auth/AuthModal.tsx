'use client';

import { useState } from 'react';

// 🆕 Интерфейс для пропсов
interface AuthModalProps {
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(false); // Начинаем с регистрации как на скриншоте
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    name: '',
    password: '',
    agreeToMarketing: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Очистка ошибок при вводе
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleRegister = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.phone.trim()) {
      newErrors.phone = 'Введите номер телефона';
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Регистрация успешна!');
      onClose(); // 🆕 Закрываем модальное окно после успеха
    }, 1500);
  };

  const handleLogin = () => {
    const newErrors: Record<string, string> = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Введите пароль';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Вход выполнен!');
      onClose(); // 🆕 Закрываем модальное окно после успеха
    }, 1500);
  };

  // 🆕 Обработчик клика по бэкдропу
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick} // 🆕 Закрытие по клику на фон
    >
      
      {/* Модальное окно - точные размеры из Figma */}
      <div className="relative bg-white w-full max-w-[520px] rounded-lg shadow-2xl">
        
        {/* Кнопка закрытия */}
        <button 
          className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 text-xl"
          onClick={onClose} // 🆕 Используем проп onClose
        >
          ×
        </button>

        {/* Контент модального окна */}
        <div className="p-8 pt-10">
          
          {!isLogin ? (
            // ФОРМА РЕГИСТРАЦИИ - как на скриншоте
            <>
              {/* Заголовок */}
              <h2 className="font-product text-[22px] leading-[28px] font-normal text-black mb-3">
                Зарегистрируйтесь на сайте
              </h2>
              
              {/* Подзаголовок */}
              <p className="font-product text-[14px] leading-[18px] text-gray-600 mb-8">
                Зарегистрированным пользователям доступен личный кабинет с<br />
                историей заказов, возможностью сохранения адресов
              </p>

              {/* Поля ввода */}
              <div className="space-y-4 mb-6">
                
                {/* Номер телефона */}
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="номер телефона"
                  className={`w-full h-12 px-4 font-product text-[14px] rounded-sm
                             bg-[#E5DDD4] border-none outline-none placeholder-gray-600
                             ${errors.phone ? 'ring-2 ring-red-500' : ''}`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs font-product">{errors.phone}</p>
                )}

                {/* Email */}
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e-mail"
                  className={`w-full h-12 px-4 font-product text-[14px] rounded-sm
                             bg-[#E5DDD4] border-none outline-none placeholder-gray-600
                             ${errors.email ? 'ring-2 ring-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs font-product">{errors.email}</p>
                )}

              </div>

              {/* Чекбокс согласия */}
              <div className="mb-8">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreeToMarketing"
                    checked={formData.agreeToMarketing}
                    onChange={handleInputChange}
                    className="mt-1 w-4 h-4 border border-gray-400 rounded-sm focus:ring-0 focus:ring-offset-0 text-black"
                  />
                  <span className="font-product text-[12px] leading-[16px] text-gray-700">
                    Согласен(-на) на получение рекламно-информационной рассылки
                  </span>
                </label>
                
                <p className="font-product text-[11px] leading-[14px] text-gray-500 mt-3 ml-7">
                  При регистрации Вы даете согласие с нашей{' '}
                  <span className="underline cursor-pointer">политикой конфиденциальности</span>{' '}
                  и{' '}
                  <span className="underline cursor-pointer">публичной офертой</span>
                </p>
              </div>

              {/* Кнопка регистрации */}
              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full h-12 bg-black text-white font-product text-[14px] font-medium 
                           rounded-sm hover:bg-gray-800 transition-colors duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
              >
                {loading ? 'РЕГИСТРАЦИЯ...' : 'ЗАРЕГИСТРИРОВАТЬСЯ'}
              </button>

              {/* Переключение на вход */}
              <div className="text-center mt-6">
                <button
                  onClick={() => setIsLogin(true)}
                  className="font-product text-[14px] text-black underline hover:no-underline"
                >
                  ВОЙТИ
                </button>
              </div>
            </>
          ) : (
            // ФОРМА ВХОДА
            <>
              {/* Заголовок */}
              <h2 className="font-product text-[22px] leading-[28px] font-normal text-black mb-3">
                Вход в личный кабинет
              </h2>
              
              {/* Подзаголовок */}
              <p className="font-product text-[14px] leading-[18px] text-gray-600 mb-8">
                Введите свои данные для входа в систему
              </p>

              {/* Поля ввода */}
              <div className="space-y-4 mb-8">
                
                {/* Email */}
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e-mail"
                  className={`w-full h-12 px-4 font-product text-[14px] rounded-sm
                             bg-[#E5DDD4] border-none outline-none placeholder-gray-600
                             ${errors.email ? 'ring-2 ring-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs font-product">{errors.email}</p>
                )}

              </div>

              {/* Кнопка входа */}
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full h-12 bg-black text-white font-product text-[14px] font-medium 
                           rounded-sm hover:bg-gray-800 transition-colors duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
              >
                {loading ? 'ВХОД...' : 'ВОЙТИ'}
              </button>

              {/* Переключение на регистрацию */}
              <div className="text-center mt-6">
                <button
                  onClick={() => setIsLogin(false)}
                  className="font-product text-[14px] text-black underline hover:no-underline"
                >
                  ЗАРЕГИСТРИРОВАТЬСЯ
                </button>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};

export default AuthModal;