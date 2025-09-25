import { NextResponse } from 'next/server';

interface LoginRequest {
  email: string;
}

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const TEMP_PASSWORD = 'TigrShop2025!';

export async function POST(request: Request) {
  try {
    const body: LoginRequest = await request.json();

    if (!validateEmail(body.email)) {
      return NextResponse.json({
        success: false,
        error: 'Некорректный email адрес',
        field: 'email'
      }, { status: 400 });
    }

    const loginResponse = await fetch(`${STRAPI_URL}/api/auth/local`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: body.email,
        password: TEMP_PASSWORD,
      }),
    });

    const userData = await loginResponse.json();

    if (!loginResponse.ok) {
      
      let errorMessage = 'Пользователь с таким email не найден. Зарегистрируйтесь сначала.';
      
      if (userData.error) {
        if (userData.error.message?.includes('Invalid identifier or password')) {
          errorMessage = 'Пользователь с таким email не найден. Зарегистрируйтесь сначала.';
        } else if (userData.error.message?.includes('blocked')) {
          errorMessage = 'Аккаунт заблокирован. Обратитесь к администратору.';
        }
      }

      return NextResponse.json({
        success: false,
        error: errorMessage,
        field: 'email'
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
        phone: fullUserData.phone || '',
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