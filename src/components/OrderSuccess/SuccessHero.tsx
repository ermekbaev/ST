'use client';

import React, { useEffect, useState } from 'react';
import { checkPaymentStatus, getPaymentStatusText } from '@/services/paymentService';

interface PaymentInfo {
  status: string;
  amount?: {
    value: string;
    currency: string;
  };
  paid: boolean;
}

interface SuccessHeroProps {
  orderNumber?: string;
  paymentId?: string;
}

const SuccessHero: React.FC<SuccessHeroProps> = ({ orderNumber = "TS-127702", paymentId }) => {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false); // 🔥 ИСПРАВЛЕНО: изначально false
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    const checkPayment = async () => {
      if (!paymentId) {
        setIsLoadingPayment(false);
        return;
      }

      setIsLoadingPayment(true);
      
      try {
        const response = await checkPaymentStatus(paymentId);
        
        if (response.success && response.payment) {
          setPaymentInfo({
            status: response.payment.status,
            amount: response.payment.amount,
            paid: response.payment.paid
          });
        } else {
          console.error('❌ Ошибка проверки платежа:', response.error);
          setPaymentError(response.error || 'Ошибка проверки платежа');
        }
      } catch (err) {
        console.error('❌ Сетевая ошибка при проверке платежа:', err);
        setPaymentError('Ошибка проверки статуса платежа');
      }
      
      setIsLoadingPayment(false);
    };

    if (paymentId) {
      const timer = setTimeout(checkPayment, 1000);
      return () => clearTimeout(timer);
    }
  }, [paymentId]);

  useEffect(() => {
    if (paymentInfo?.status === 'pending' && paymentId) {
      const interval = setInterval(async () => {
        try {
          const response = await checkPaymentStatus(paymentId);
          if (response.success && response.payment) {
            setPaymentInfo({
              status: response.payment.status,
              amount: response.payment.amount,
              paid: response.payment.paid
            });
            
            if (response.payment.status !== 'pending') {
              clearInterval(interval);
            }
          }
        } catch (err) {
          console.error('❌ Ошибка автопроверки платежа:', err);
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [paymentInfo?.status, paymentId]);

  const getTitle = () => {
    if (isLoadingPayment) {
      return 'ПРОВЕРЯЕМ СТАТУС ОПЛАТЫ';
    }
    
    if (!paymentId) {
      return 'ВАШ ЗАКАЗ ПРИНЯТ';
    }
    
    if (paymentError) {
      return 'ЗАКАЗ ПРИНЯТ';
    }
    
    if (paymentInfo) {
      switch (paymentInfo.status) {
        case 'succeeded':
          return 'ВАШ ЗАКАЗ УСПЕШНО ОПЛАЧЕН';
        case 'pending':
          return 'ОЖИДАЕМ ПОДТВЕРЖДЕНИЯ ОПЛАТЫ';
        case 'canceled':
          return 'ЗАКАЗ СОЗДАН, ОПЛАТА ОТМЕНЕНА';
        default:
          return 'ВАШ ЗАКАЗ ПРИНЯТ';
      }
    }
    
    return 'ВАШ ЗАКАЗ ПРИНЯТ';
  };

  const getSubtitle = () => {
    if (isLoadingPayment) {
      return 'Это займет несколько секунд...';
    }
    
    if (!paymentId) {
      return 'Мы свяжемся с вами в ближайшее время';
    }
    
    if (paymentError) {
      return 'Мы свяжемся с вами для уточнения способа оплаты';
    }
    
    if (paymentInfo) {
      switch (paymentInfo.status) {
        case 'succeeded':
          return 'Мы свяжемся с вами в ближайшее время';
        case 'pending':
          return 'Платеж обрабатывается, ожидайте подтверждения';
        case 'canceled':
          return 'Свяжитесь с нами для повторной оплаты';
        default:
          return 'Мы свяжемся с вами в ближайшее время';
      }
    }
    
    return 'Мы свяжемся с вами в ближайшее время';
  };

  const renderPaymentStatus = () => {
    if (!paymentId || isLoadingPayment) return null;
    
    if (paymentError && paymentId) {
      return (
        <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-500 rounded">
          <p className="text-yellow-300 text-center text-sm">
            ⚠️ Не удалось проверить статус платежа
          </p>
          <p className="text-yellow-200 text-xs text-center mt-1">
            Заказ создан успешно, проверьте оплату позже
          </p>
        </div>
      );
    }
    
    if (paymentInfo) {
      const statusColor = paymentInfo.status === 'succeeded' ? 'text-green-300' : 
                         paymentInfo.status === 'pending' ? 'text-yellow-300' : 'text-red-300';
      
      return (
        <div className="mt-4 p-3 bg-black/30 border border-white/20 rounded">
          <div className="text-center">
            <p className={`font-medium ${statusColor}`}>
              {getPaymentStatusText(paymentInfo.status)}
            </p>
            {paymentInfo.amount && (
              <p className="text-white text-sm mt-1">
                Сумма: {paymentInfo.amount.value} {paymentInfo.amount.currency}
              </p>
            )}
            
            {paymentInfo.status === 'pending' && (
              <p className="text-yellow-200 text-xs mt-2">
                💡 Обновляем статус автоматически каждые 10 секунд
              </p>
            )}
            
            {paymentInfo.status === 'canceled' && (
              <p className="text-red-200 text-xs mt-2">
                📞 Обратитесь в поддержку для повторной оплаты
              </p>
            )}
          </div>
        </div>
      );
    }
    
    return null;
  };

  const handleGoToMain = () => {
    window.location.href = '/';
  };

  const handleTrackOrder = () => {
    window.location.href = '/order-history';
  };

  return (
    <div className="order-success-hero-container relative w-full min-h-screen overflow-hidden">
      
      {/* ======== ДЕСКТОПНАЯ ВЕРСИЯ ======== */}
      <div className="hidden lg:block relative z-20 min-h-screen">
        <div className="min-h-screen flex flex-col justify-center items-center px-8">
          
          <div className="w-full mb-16">
            <div className="flex items-start justify-between w-full px-5">
              <div className="flex-1 flex justify-start items-start pt-[1.2em] pr-8">
                <div className="w-full h-0.5 bg-white"></div>
              </div>
              
              <div className="text-center flex-shrink-0">
                <h1 className="order-success-title text-white font-bold text-[50px] leading-[59px] mb-4 whitespace-nowrap">
                  {getTitle()}
                </h1>
                <p className="order-success-subtitle text-[#d9cdbf] text-[20px] leading-[27px]">
                  {getSubtitle()}
                </p>
                
                {renderPaymentStatus()}
              </div>
              
              <div className="flex-1 flex justify-end items-start pt-[1.2em] pl-8">
                <div className="w-full h-0.5 bg-white"></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-50 max-w-4xl w-full ">
            <div className="flex flex-col items-start gap-4 ml-8">
              <p className="order-success-subtitle text-white text-[20px] leading-[27px] font-normal">
                Номер заказа: {orderNumber}
              </p>
              
              <button
                onClick={handleTrackOrder}
                className="order-success-subtitle flex items-center gap-3 text-white text-[20px] leading-[27px] font-normal underline bg-transparent border-none p-0 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <span>Отслеживать заказ</span>
                <div className="w-[10px] h-[10px] border-t-2 border-r-2 border-white transform rotate-45"></div>
              </button>
              
              <button
                onClick={handleGoToMain}
                className="order-success-subtitle bg-[#0b0b0d] hover:bg-[#2a2a2a] text-white font-normal transition-colors w-[255px] h-[50px] text-[20px] leading-[27px] mt-4"
              >
                НА ГЛАВНУЮ
              </button>
            </div>

            <div className="flex flex-col items-start gap-4">
              <p className="order-success-subtitle text-[#d9cdbf] text-[20px] leading-[27px] font-normal">
                Если у вас остались вопросы<br />напишите нам
              </p>
              
              <div className="flex gap-5 items-center">
                <button
                  onClick={() => window.open('https://t.me/TIGRSHOPsupport')}
                  className="bg-transparent rounded cursor-pointer flex items-center justify-center transition-all hover:scale-110"
                  title="Telegram"
                >
                  <img src="/social/tg.svg" alt="" className="w-10 h-10" />
                </button>
                
                <button
                  onClick={() => window.open('https://wa.me/79958714667')}
                  className="bg-transparent rounded cursor-pointer flex items-center justify-center transition-all hover:scale-110"
                  title="WhatsApp"
                >
                  <img src="/social/wa.svg" alt="" className="w-10 h-10" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======== МОБИЛЬНАЯ ВЕРСИЯ ======== */}
      <div className="lg:hidden relative z-20 min-h-screen">
        <div className="min-h-screen flex flex-col justify-center items-center px-4">
          
          <div className="flex-1 flex items-end justify-center pb-8">
            <div className="w-px h-[25vh] bg-white"></div>
          </div>

          <div className="flex-shrink-0 text-center py-8">
            <h1 className="order-success-title text-white font-bold text-[30px] leading-[35px] mb-3 max-w-[300px] mx-auto">
              {getTitle()}
            </h1>
            <p className="order-success-subtitle text-white text-[10px] leading-[10px] max-w-[300px] mx-auto">
              {getSubtitle()}
            </p>
            
            {renderPaymentStatus()}
          </div>

          <div className="flex-1 flex items-start justify-center pt-8 w-full">
            <div className="flex w-full max-w-sm relative">
              
              <div className="flex-1 flex flex-col items-center gap-3 pr-4">
                <p className="text-white text-[10px] leading-[14px] font-normal text-center">
                  Номер заказа: {orderNumber}
                </p>
                
                <button
                  onClick={handleTrackOrder}
                  className="flex items-center justify-center text-white text-[10px] leading-[14px] font-normal w-[140px] h-[25px] bg-[#595047] px-3"
                >
                  <span>ОТСЛЕЖИВАТЬ ЗАКАЗ</span>
                </button>
                
                <button
                  onClick={handleGoToMain}
                  className="bg-[#0b0b0d] hover:bg-[#2a2a2a] text-white font-normal transition-colors w-[140px] h-[25px] text-[10px] leading-[14px] mt-2"
                >
                  НА ГЛАВНУЮ
                </button>
              </div>

              <div className="absolute left-1/2 top-0 w-px h-[25vh] bg-white transform -translate-x-1/2"></div>

              <div className="flex-1 flex flex-col items-center gap-3 pl-4">
                <p className="text-white text-[10px] leading-[14px] font-normal text-center">
                  Если у вас остались вопросы<br />напишите нам
                </p>
                
                <div className="flex gap-5 items-center justify-center">
                  <button
                    onClick={() => window.open('https://t.me/TIGRSHOPsupport')}
                    className="bg-transparent rounded cursor-pointer flex items-center justify-center transition-all hover:scale-110"
                    title="Telegram"
                  >
                    <img src="/social/tg.svg" alt="" className="w-6 h-6" />
                  </button>
                  
                  <button
                    onClick={() => window.open('https://wa.me/79958714667')}
                    className="bg-transparent rounded cursor-pointer flex items-center justify-center transition-all hover:scale-110"
                    title="WhatsApp"
                  >
                    <img src="/social/wa.svg" alt="" className="w-6 h-6" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default SuccessHero;