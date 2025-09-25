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

