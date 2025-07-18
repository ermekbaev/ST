'use client';

import { useState } from 'react';

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
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

  const handleRegister = async () => {
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
    
    try {
      console.log('📤 Отправка данных регистрации...');
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.phone,
          email: formData.email,
          agreeToMarketing: formData.agreeToMarketing
        })
      });

      const data = await response.json();
      console.log('📥 Ответ сервера:', data);

      if (data.success) {
        // Сохраняем пользователя в localStorage
        if (typeof window !== 'undefined') {
          const userToSave = {
            id: data.user.id,
            name: data.user.email.split('@')[0], // Временно используем часть email как имя
            phone: data.user.phone,
            email: data.user.email
          };
          localStorage.setItem('currentUser', JSON.stringify(userToSave));
          console.log('💾 Пользователь сохранен в localStorage');
        }
        
        // Показываем успешное сообщение с деталями
        const sheetsMessage = data.savedToSheets 
          ? '📊 Данные сохранены в Google Таблицы!' 
          : '💾 Данные сохранены локально.';
        
        const goToProfile = confirm(
          `✅ Регистрация прошла успешно!\n\n${sheetsMessage}\n\n` +
          '👤 Хотите перейти в личный кабинет?\n\n' +
          'Нажмите "ОК" для перехода или "Отмена" чтобы остаться на странице.'
        );
        
        onClose();
        
        // Переход на существующую страницу профиля
        if (goToProfile) {
          window.location.href = '/profile';
        } else {
          // Обновляем страницу, чтобы обновить состояние авторизации
          window.location.reload();
        }
      } else {
        if (data.field) {
          setErrors({ [data.field]: data.error });
        } else {
          setErrors({ general: data.error });
        }
      }

    } catch (error) {
      console.error('❌ Ошибка регистрации:', error);
      setErrors({ general: 'Ошибка подключения к серверу. Попробуйте еще раз.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    const newErrors: Record<string, string> = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    
    try {
      console.log('📤 Отправка данных входа...');
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email
        })
      });

      const data = await response.json();
      console.log('📥 Ответ сервера:', data);

      if (data.success) {
        // Сохраняем пользователя в localStorage в формате, совместимом с существующим профилем
        if (typeof window !== 'undefined') {
          const userToSave = {
            id: data.user.id,
            name: data.user.email.split('@')[0], // Временно используем часть email как имя
            phone: data.user.phone,
            email: data.user.email
          };
          localStorage.setItem('currentUser', JSON.stringify(userToSave));
          console.log('💾 Пользователь сохранен в localStorage');
        }
        
        const goToProfile = confirm(
          '✅ Вход выполнен успешно!\n\n' +
          `Добро пожаловать, ${data.user.email}!\n\n` +
          '👤 Хотите перейти в личный кабинет?\n\n' +
          'Нажмите "ОК" для перехода или "Отмена" чтобы остаться на странице.'
        );
        
        onClose();
        
        // Переход на существующую страницу профиля
        if (goToProfile) {
          window.location.href = '/profile';
        } else {
          // Обновляем страницу, чтобы обновить состояние авторизации
          window.location.reload();
        }
      } else {
        if (data.field) {
          setErrors({ [data.field]: data.error });
        } else {
          setErrors({ general: data.error });
        }
      }

    } catch (error) {
      console.error('❌ Ошибка входа:', error);
      setErrors({ general: 'Ошибка подключения к серверу. Попробуйте еще раз.' });
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  // Запрещаем ввод символа +
  if (e.key === '+') {
    e.preventDefault();
  }
};

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      
      <div className="relative bg-white w-full max-w-[520px] rounded-lg shadow-2xl">
        
        <button 
          className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 text-xl"
          onClick={onClose}
        >
          ×
        </button>

        <div className="p-8 pt-10">
          
          {!isLogin ? (
            // ФОРМА РЕГИСТРАЦИИ
            <>
              <h2 className="font-product text-[22px] leading-[28px] font-normal text-black mb-3">
                Зарегистрируйтесь на сайте
              </h2>
              
              <p className="font-product text-[14px] leading-[18px] text-gray-600 mb-8">
                Зарегистрированным пользователям доступен личный кабинет с<br />
                историей заказов, возможностью сохранения адресов
              </p>

              <div className="space-y-4 mb-6">
                
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="номер телефона"
                  onKeyDown={handlePhoneKeyDown}
                  className={`w-full h-12 px-4 font-product text-[14px] rounded-sm
                             bg-[#E5DDD4] border-none outline-none placeholder-gray-600
                             ${errors.phone ? 'ring-2 ring-red-500' : ''}`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs font-product">{errors.phone}</p>
                )}

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

              {errors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm">
                  <p className="text-red-600 text-sm font-product">{errors.general}</p>
                </div>
              )}

              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full h-12 bg-black text-white font-product text-[14px] font-medium 
                           rounded-sm hover:bg-gray-800 transition-colors duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
              >
                {loading ? 'РЕГИСТРАЦИЯ...' : 'ЗАРЕГИСТРИРОВАТЬСЯ'}
              </button>

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
              <h2 className="font-product text-[22px] leading-[28px] font-normal text-black mb-3">
                Вход в личный кабинет
              </h2>
              
              <p className="font-product text-[14px] leading-[18px] text-gray-600 mb-8">
                Введите свой email для входа в систему
              </p>

              <div className="space-y-4 mb-8">
                
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

              {errors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm">
                  <p className="text-red-600 text-sm font-product">{errors.general}</p>
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full h-12 bg-black text-white font-product text-[14px] font-medium 
                           rounded-sm hover:bg-gray-800 transition-colors duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
              >
                {loading ? 'ВХОД...' : 'ВОЙТИ'}
              </button>

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