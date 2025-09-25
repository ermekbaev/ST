import { NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || '';

export interface SimplePromoCode {
  id: number;
  code: string;
  title: string;
  discountType: 'percentage' | 'fixed_amount' | 'free_delivery';
  discountValue: number;
  minOrderAmount: number;
  isActive: boolean;
}

export async function GET() {
  try {

    const response = await fetch(`${STRAPI_URL}/api/promocodes`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error(`❌ Ошибка Strapi API: ${response.status}`);
      return NextResponse.json({
        success: false,
        promocodes: [],
        error: `Strapi API error: ${response.status}`
      }, { status: response.status });
    }

    const data = await response.json();
    const rawPromocodes = data.data || [];


    const promocodes: SimplePromoCode[] = rawPromocodes
      .map((promo: any) => {
        const discountTypeRaw = promo.discountType || 'percentage';
        
        const cleanDiscountType = discountTypeRaw.trim().replace(/,$/, '');
        const cleanCode = promo.code?.trim() || ''; 
        
        return {
          id: promo.id,
          code: cleanCode.toUpperCase(),
          title: promo.title || '',
          discountType: cleanDiscountType === 'percentage' ? 'percentage' : 
                       cleanDiscountType === 'fixed_amount' ? 'fixed_amount' :
                       cleanDiscountType === 'free_delivery' ? 'free_delivery' : 'percentage',
          discountValue: parseFloat(promo.discountValue) || 0,
          minOrderAmount: parseFloat(promo.minOrderAmount) || 0,
          isActive: promo.isActive !== false
        };
      })
      .filter((promo: SimplePromoCode) => promo.isActive && promo.code);

    
    return NextResponse.json({
      success: true,
      promocodes,
      total: promocodes.length,
      source: 'strapi-v5'
    });

  } catch (error) {
    console.error('❌ Ошибка соединения со Strapi:', error);
    
    return NextResponse.json({
      success: false,
      promocodes: [],
      error: 'Connection error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, promoCodeId } = body;
    
    if (promoCodeId) {
      return NextResponse.json({ success: true });
    }
    
    if (!code) {
      return NextResponse.json({
        success: false,
        error: 'Код не указан'
      }, { status: 400 });
    }
    
    if (!code) {
      return NextResponse.json({
        success: false,
        error: 'Код не указан'
      }, { status: 400 });
    }

    const response = await fetch(`${STRAPI_URL}/api/promocodes`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Strapi недоступен'
      }, { status: 503 });
    }

    const data = await response.json();
    const rawPromocodes = data.data || [];

    const foundPromo = rawPromocodes.find((promo: any) => 
      promo.code?.trim().toUpperCase() === code.toUpperCase() && 
      promo.isActive !== false
    );

    if (foundPromo) {
      const cleanDiscountType = (foundPromo.discountType || '').trim().replace(/,$/, '');
      
      return NextResponse.json({
        success: true,
        promocode: {
          id: foundPromo.id,
          code: foundPromo.code?.trim().toUpperCase() || '',
          title: foundPromo.title || '',
          discountType: cleanDiscountType === 'percentage' ? 'percentage' : 
                       cleanDiscountType === 'fixed_amount' ? 'fixed_amount' :
                       cleanDiscountType === 'free_delivery' ? 'free_delivery' : 'percentage',
          discountValue: parseFloat(foundPromo.discountValue) || 0,
          minOrderAmount: parseFloat(foundPromo.minOrderAmount) || 0,
          isActive: foundPromo.isActive !== false
        },
        message: 'Промокод найден'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Промокод не найден или неактивен'
      }, { status: 404 });
    }

  } catch (error) {
    console.error('❌ Ошибка проверки промокода:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка сервера'
    }, { status: 500 });
  }
}