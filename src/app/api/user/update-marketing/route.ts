// /app/api/user/update-marketing/route.ts
import { NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function PUT(request: Request) {
  try {
    const { agreeToMarketing } = await request.json();
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        error: 'Необходима авторизация'
      }, { status: 401 });
    }

    // Обновляем в Strapi
    const response = await fetch(`${STRAPI_URL}/api/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        agreeToMarketing: Boolean(agreeToMarketing)
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return NextResponse.json({
        success: true,
        user: result,
        message: 'Настройки обновлены'
      });
    } else {
      const error = await response.json();
      return NextResponse.json({
        success: false,
        error: error.error?.message || 'Ошибка обновления'
      }, { status: response.status });
    }

  } catch (error) {
    console.error('❌ Ошибка API обновления маркетинга:', error);
    return NextResponse.json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    }, { status: 500 });
  }
}

// И в профиле использовать:
const handleMarketingChange = async (newValue: boolean) => {
  // Обновляем локально
  setAgreeToMarketing(newValue);
  
  // Обновляем в Strapi через наш API
  const authToken = localStorage.getItem('authToken');
  if (authToken) {
    try {
      const response = await fetch('/api/user/update-marketing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ agreeToMarketing: newValue }),
      });
      
      if (response.ok) {
        console.log('✅ Настройки синхронизированы с сервером');
      }
    } catch (error) {
      console.error('❌ Ошибка синхронизации:', error);
    }
  }
};