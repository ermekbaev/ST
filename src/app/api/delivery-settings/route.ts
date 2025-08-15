import { NextResponse } from 'next/server';
import { getDeliverySettings } from '@/services/deliverySettingsService';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get('refresh') === 'true';
    
    const settings = await getDeliverySettings(forceRefresh);
    
    return NextResponse.json({
      success: true,
      data: settings,
      timestamp: new Date().toISOString(),
      cached: !forceRefresh
    });
    
  } catch (error) {
    console.error('❌ API: Ошибка загрузки настроек доставки:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Не удалось загрузить настройки доставки',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    
    const settings = await getDeliverySettings(true);
    
    return NextResponse.json({
      success: true,
      data: settings,
      message: 'Настройки доставки обновлены',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ API: Ошибка обновления настроек:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Не удалось обновить настройки доставки',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}