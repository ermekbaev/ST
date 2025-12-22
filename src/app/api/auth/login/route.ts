import { NextResponse } from 'next/server';

interface LoginRequest {
  email?: string;
  phone?: string;
}

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const TEMP_PASSWORD = 'TigrShop2025!';

export async function POST(request: Request) {
  try {
    const body: LoginRequest = await request.json();

    let emailToLogin: string;
    let loginField: 'email' | 'phone';

    // Определяем метод входа
    if (body.phone) {
      // Вход по телефону - сначала находим пользователя
      loginField = 'phone';

      if (!validatePhone(body.phone)) {
        return NextResponse.json({
          success: false,
          error: 'Некорректный номер телефона',
          field: 'phone'
        }, { status: 400 });
      }

      // Ищем пользователя по телефону через Strapi API (поле "number" в Strapi)
      const usersResponse = await fetch(
        `${STRAPI_URL}/api/users?filters[number][$eq]=${encodeURIComponent(body.phone)}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const users = await usersResponse.json();

      if (!usersResponse.ok || !users || users.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Пользователь с таким номером телефона не найден. Зарегистрируйтесь сначала.',
          field: 'phone'
        }, { status: 404 });
      }

      emailToLogin = users[0].email;
    } else if (body.email) {
      // Вход по email
      loginField = 'email';

      if (!validateEmail(body.email)) {
        return NextResponse.json({
          success: false,
          error: 'Некорректный email адрес',
          field: 'email'
        }, { status: 400 });
      }

      emailToLogin = body.email;
    } else {
      return NextResponse.json({
        success: false,
        error: 'Необходимо указать email или телефон',
        field: 'email'
      }, { status: 400 });
    }

    const loginResponse = await fetch(`${STRAPI_URL}/api/auth/local`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: emailToLogin,
        password: TEMP_PASSWORD,
      }),
    });

    const userData = await loginResponse.json();

    if (!loginResponse.ok) {
      const errorMessage = loginField === 'phone'
        ? 'Пользователь с таким номером телефона не найден. Зарегистрируйтесь сначала.'
        : 'Пользователь с таким email не найден. Зарегистрируйтесь сначала.';

      if (userData.error?.message?.includes('blocked')) {
        return NextResponse.json({
          success: false,
          error: 'Аккаунт заблокирован. Обратитесь к администратору.',
          field: loginField
        }, { status: 403 });
      }

      return NextResponse.json({
        success: false,
        error: errorMessage,
        field: loginField
      }, { status: 404 });
    }


    let fullUserData = userData.user;
    try {
      const meResponse = await fetch(`${STRAPI_URL}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${userData.jwt}`,
        },
      });

      if (meResponse.ok) {
        fullUserData = await meResponse.json();
      }
    } catch (error) {
      console.error('⚠️ Ошибка получения полных данных:', error);
    }

    try {
      await updateUserLastLogin(userData.user.id, userData.jwt);
    } catch (error) {
      console.error('⚠️ Ошибка обновления даты входа:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Вход выполнен успешно',
      user: {
        id: fullUserData.id,
        email: fullUserData.email,
        phone: fullUserData.number || '', // В Strapi поле называется "number"
        agreeToMarketing: Boolean(fullUserData.agreeToMarketing)
      },
      jwt: userData.jwt
    });

  } catch (error) {
    console.error('❌ Ошибка входа:', error);
    return NextResponse.json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    }, { status: 500 });
  }
}

async function updateUserLastLogin(userId: string, jwt: string): Promise<void> {
  try {
    const response = await fetch(`${STRAPI_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        lastLogin: new Date().toISOString()
      }),
    });
  } catch (error) {
    console.error('❌ Ошибка обновления даты входа:', error);
  }
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone: string): boolean {
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  return cleanPhone.length >= 11 && cleanPhone.length <= 12;
}