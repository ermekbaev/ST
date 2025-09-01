import { NextRequest, NextResponse } from 'next/server';
import { YooCheckout } from '@a2seven/yoo-checkout';

const checkout = new YooCheckout({
  shopId: process.env.YUKASSA_SHOP_ID!,
  secretKey: process.env.YUKASSA_SECRET_KEY!,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');


    if (!paymentId) {
      return NextResponse.json({
        success: false,
        error: 'Payment ID is required'
      }, { status: 400 });
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(paymentId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid payment ID format'
      }, { status: 400 });
    }

    const payment = await checkout.getPayment(paymentId);

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        metadata: payment.metadata,
        paid: payment.paid,
        created_at: payment.created_at,
        captured_at: payment.captured_at,
        ...(process.env.NODE_ENV === 'development' && {
          debug: {
            payment_method: payment.payment_method,
            confirmation: payment.confirmation,
            description: payment.description
          }
        })
      }
    });

  } catch (error: any) {
    
    let errorMessage = 'Ошибка получения статуса платежа';
    let statusCode = 500;
    
    if (error.response?.status === 404) {
      errorMessage = 'Платеж не найден';
      statusCode = 404;
    } else if (error.response?.status === 401) {
      errorMessage = 'Ошибка авторизации в ЮKassa';
      statusCode = 401;
    } else if (error.response?.data) {
      const yukassaError = error.response.data;
      if (yukassaError.description) {
        errorMessage = yukassaError.description;
      } else if (yukassaError.error) {
        errorMessage = yukassaError.error;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      paymentId: error.response?.data?.id || null,
      details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    }, { status: statusCode });
  }
}