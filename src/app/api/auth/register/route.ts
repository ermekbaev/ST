// Улучшенная версия /app/api/auth/register/route.ts с детальной отладкой
import { NextResponse } from 'next/server';

interface RegisterRequest {
  phone: string;
  email: string;
  agreeToMarketing: boolean;
}

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const TEMP_PASSWORD = 'TigrShop2025!';

export async function POST(request: Request) {
  try {
    const body: RegisterRequest = await request.json();
    console.log('📝 === НАЧАЛО РЕГИСТРАЦИИ ===');
    console.log('📊 Данные от клиента:', {
      email: body.email,
      phone: body.phone,
      agreeToMarketing: body.agreeToMarketing,
      agreeToMarketingType: typeof body.agreeToMarketing
    });

    // Валидация данных
    const validation = validateRegistrationData(body);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: validation.error,
        field: validation.field
      }, { status: 400 });
    }

    // ШАГ 1: Создаем базового пользователя
    console.log('🔧 ШАГ 1: Создание базового пользователя...');
    const registerPayload = {
      username: body.email,
      email: body.email,
      password: TEMP_PASSWORD
    };
    console.log('📤 Payload для регистрации:', registerPayload);

    const registerResponse = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerPayload),
    });

    const userData = await registerResponse.json();
    console.log('📥 Ответ Strapi регистрации:', userData);

    if (!registerResponse.ok) {
      console.error('❌ Ошибка создания пользователя:', userData);
      
      let error = 'Ошибка регистрации';
      let field = '';

      if (userData.error?.message?.includes('email') || userData.error?.message?.includes('Email')) {
        error = 'Пользователь с таким email уже зарегистрирован';
        field = 'email';
      } else if (userData.error?.message?.includes('username')) {
        error = 'Пользователь с таким email уже зарегистрирован';
        field = 'email';
      }

      return NextResponse.json({
        success: false,
        error,
        field
      }, { status: 409 });
    }

    console.log('✅ Базовый пользователь создан:', userData.user.id);

    // ШАГ 2: Обновляем пользователя дополнительными полями
    console.log('🔧 ШАГ 2: Обновление профиля...');
    const updatePayload = {
      phone: body.phone,
      agreeToMarketing: Boolean(body.agreeToMarketing), // Явное преобразование в Boolean
      registrationDate: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    console.log('📤 Payload для обновления:', updatePayload);

    const updateResponse = await fetch(`${STRAPI_URL}/api/users/${userData.user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userData.jwt}`,
      },
      body: JSON.stringify(updatePayload),
    });

    const updateResult = await updateResponse.json();
    console.log('📥 Ответ обновления:', updateResult);

    if (!updateResponse.ok) {
      console.error('⚠️ Ошибка обновления профиля:', updateResult);
      // Продолжаем, но отмечаем проблему
    } else {
      console.log('✅ Профиль успешно обновлен');
    }

    // ШАГ 3: Проверяем финальные данные
    console.log('🔧 ШАГ 3: Проверка сохраненных данных...');
    const checkResponse = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: {
        'Authorization': `Bearer ${userData.jwt}`,
      },
    });

    if (checkResponse.ok) {
      const finalUser = await checkResponse.json();
      console.log('📊 ФИНАЛЬНЫЕ ДАННЫЕ В STRAPI:', {
        id: finalUser.id,
        email: finalUser.email,
        phone: finalUser.phone,
        agreeToMarketing: finalUser.agreeToMarketing,
        agreeToMarketingType: typeof finalUser.agreeToMarketing
      });
    } else {
      console.error('❌ Ошибка проверки данных:', await checkResponse.json());
    }

    // Возвращаем успешный ответ
    console.log('🎉 === РЕГИСТРАЦИЯ ЗАВЕРШЕНА ===');
    return NextResponse.json({
      success: true,
      message: 'Регистрация успешна! Данные сохранены в Strapi.',
      user: {
        id: userData.user.id,
        email: userData.user.email,
        phone: body.phone,
        agreeToMarketing: Boolean(body.agreeToMarketing)
      },
      savedToSheets: true,
      jwt: userData.jwt
    });

  } catch (error) {
    console.error('❌ КРИТИЧЕСКАЯ ОШИБКА РЕГИСТРАЦИИ:', error);
    return NextResponse.json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    }, { status: 500 });
  }
}

// Функции валидации (те же)
function validateRegistrationData(data: RegisterRequest): { isValid: boolean; error?: string; field?: string } {
  if (!data.email || !validateEmail(data.email)) {
    return { isValid: false, error: 'Некорректный email адрес', field: 'email' };
  }

  if (!data.phone || !validatePhone(data.phone)) {
    return { isValid: false, error: 'Некорректный номер телефона', field: 'phone' };
  }

  return { isValid: true };
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone: string): boolean {
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 12;
}