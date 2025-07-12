// app/api/delivery-settings/route.ts
import { NextResponse } from 'next/server';
import { getDeliverySettings, type DeliverySettingsData } from '@/services/deliverySettingsService';

interface ApiResponse {
  success: boolean;
  data?: DeliverySettingsData;
  error?: string;
}

export async function GET(request: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get('refresh') === 'true';
    
    const settings = await getDeliverySettings(forceRefresh);
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data: settings
    });
    
  } catch (error) {
    console.error('Error in delivery-settings API:', error);
    
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Ошибка загрузки настроек доставки'
    }, { status: 500 });
  }
}