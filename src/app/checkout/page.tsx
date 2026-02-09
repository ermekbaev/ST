'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { createPayment, formatCartItemsForPayment } from '@/services/paymentService';
import NewOrderSummary from '@/components/Checkout/newCheckoutSummary';
import NewCheckoutForm from '@/components/Checkout/newChekoutForm';
import AuthModal from '@/components/Auth/AuthModal';

const CheckoutPage: React.FC = () => {
  const { items, clearCart } = useCart();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [selectedDelivery, setSelectedDelivery] = useState('store_pickup');
  const [selectedPayment, setSelectedPayment] = useState('order_form'); // ⚠️ Изменено на 'order_form' - только заявки пока

  const orderSummaryRef = useRef<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading && items.length === 0 && !orderCompleted && !isProcessing && !isProcessingPayment) {
      router.push('/');
    }
  }, [items, router, isLoading, orderCompleted, isProcessing, isProcessingPayment]);

  // ✅ НОВАЯ ФУНКЦИЯ: Получение изображения из товара корзины
  const getProductImageFromCartItem = (item: any): string | null => {
    // Проверяем все возможные поля с изображениями
    const possibleImageFields = [
      item.image,           // Основное поле image
      item.photo,           // Поле photo
      item.productImage,    // Поле productImage  
      item.mainPhoto,       // Поле mainPhoto
      item.images?.[0],     // Первое изображение из массива
      item.images?.src,     // Поле src в images
      item.imageUrl,        // Поле imageUrl
      item.src             // Прямое поле src
    ];

    for (const imageField of possibleImageFields) {
      if (imageField && 
          typeof imageField === 'string' && 
          imageField.trim() && 
          (imageField.startsWith('http://') || imageField.startsWith('https://'))) {
        return imageField.trim();
      }
    }

    return null;
  };

  // ✅ ДЕБАГ ФУНКЦИЯ: Для диагностики изображений в корзине
  const debugCartImages = (items: any[]) => {
    
    items.forEach((item, index) => {
      
      // Проверяем все возможные поля с изображениями
      const imageFields = {
        'item.image': item.image,
        'item.photo': item.photo,
        'item.productImage': item.productImage,
        'item.mainPhoto': item.mainPhoto,
        'item.images[0]': item.images?.[0],
        'item.images.src': item.images?.src,
        'item.imageUrl': item.imageUrl,
        'item.src': item.src
      };
      
      let foundValidImage = false;
      
      Object.entries(imageFields).forEach(([fieldName, value]) => {
        if (value) {
          const isValidUrl = typeof value === 'string' && 
                            value.trim() && 
                            (value.startsWith('http://') || value.startsWith('https://'));
          if (isValidUrl) {
            foundValidImage = true;
          }
        }
      });
      
      if (!foundValidImage) {
      }
    });
    
    const itemsWithImages = items.filter(item => getProductImageFromCartItem(item));
    
    return itemsWithImages.length;
  };

  const getPromoData = () => {
    if (orderSummaryRef.current?.getPromoCalculations) {
      const promoData = orderSummaryRef.current.getPromoCalculations();
      return promoData;
    } else {
      return null;
    }
  };

  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let deliveryPrice = 0;
    if (selectedDelivery === 'cdek_pickup') deliveryPrice = 300;
    if (selectedDelivery === 'cdek_courier') deliveryPrice = 500;
    if (selectedDelivery === 'post_russia') deliveryPrice = 250;
    if (selectedDelivery === 'boxberry') deliveryPrice = 350;
    
    return subtotal + deliveryPrice;
  };

  // Онлайн методы оплаты (через YooKassa)
  const ONLINE_PAYMENT_METHODS = ['card', 'sbp', 'tinkoff_bank', 'installments'];

  const processPayment = async (orderData: any, orderResponse: any) => {
    const isOnlinePayment = ONLINE_PAYMENT_METHODS.includes(orderData.paymentMethod);

    if (isOnlinePayment && orderResponse.orderId) {
      
      setIsProcessingPayment(true);
      
      try {
        const paymentData = {
          amount: orderData.total, // Используем финальную цену с промокодом
          orderId: orderResponse.orderId,
          customerEmail: orderData.customerInfo.email,
          customerPhone: orderData.customerInfo.phone,
          description: `Оплата заказа #${orderResponse.orderNumber || orderResponse.orderId} в Tigr Shop`,
          returnUrl: `${window.location.origin}/order-success?orderNumber=${orderResponse.orderNumber}`,
          paymentMethodType: orderData.paymentMethod, // Передаём выбранный метод оплаты
          items: formatCartItemsForPayment(items)
        };

        const paymentResponse = await createPayment(paymentData);
        
        if (paymentResponse.success && paymentResponse.confirmationUrl) {
          localStorage.setItem('pendingPaymentId', paymentResponse.paymentId || '');
          localStorage.setItem('pendingOrderId', orderResponse.orderId || '');
          localStorage.setItem('finalAmount', orderData.total.toString());
          
          window.location.href = paymentResponse.confirmationUrl;
          return;
          
        } else {
          console.error('❌ Ошибка создания платежа:', paymentResponse.error);
          throw new Error(paymentResponse.error || 'Ошибка создания платежа');
        }

      } catch (error) {
        console.error('❌ Ошибка обработки платежа:', error);
        setIsProcessingPayment(false);
        throw error;
      }
    } else {
      clearCart();
      setOrderCompleted(true);
      
      router.push(`/order-success?orderNumber=${orderResponse.orderNumber}`);
    }
  };

  const handleOrderSubmit = async (orderData: any) => {
    if (isProcessing || isProcessingPayment) return;

    const isOrderForm = (orderData.paymentMethod || selectedPayment) === 'order_form';

    // Проверка авторизации — не требуется для заявки без оплаты
    if (!isAuthenticated && !isOrderForm) {
      setShowAuthModal(true);
      return;
    }

    setIsProcessing(true);

    try {
      if (!orderData.firstName?.trim() || !orderData.phone?.trim()) {
        throw new Error('Заполните имя и телефон');
      }

      if (items.length === 0) {
        throw new Error('Корзина пуста');
      }

      // ✅ ДЕБАГ: Проверяем изображения в корзине
      debugCartImages(items);

      const finalTotal = orderData.total && orderData.total > 0 
        ? orderData.total           // ← Цена С ПРОМОКОДОМ
        : calculateTotal();         // ← Fallback если промокоды не работают

      // ✅ ОБНОВЛЕНО: Подготавливаем данные С ИЗОБРАЖЕНИЯМИ
      const orderPayload = {
        customerInfo: {
          name: orderData.firstName.trim(),
          phone: orderData.phone.trim(),
          email: orderData.email?.trim() || '',
        },
        items: items.map(item => {
          // Получаем изображение из корзины
          const productImage = getProductImageFromCartItem(item);
          
          return {
            productId: item.id || item.article,
            productName: item.name || item.title,
            //@ts-ignore
            size: item.selectedSize || item.size,
            quantity: item.quantity,
            priceAtTime: item.price,
            productImage: productImage || undefined // ✅ ДОБАВЛЯЕМ ИЗОБРАЖЕНИЕ
          };
        }),
        totalAmount: finalTotal, 
        deliveryMethod: selectedDelivery,
        paymentMethod: orderData.paymentMethod || selectedPayment,
        deliveryAddress: orderData.city && orderData.address 
          ? `${orderData.city.trim()}, ${orderData.address.trim()}`
          : '',
        notes: orderData.notes?.trim() || '',
        
        originalTotal: orderData.subtotal + (orderData.deliveryPrice || 0),
        promoDiscount: orderData.promoDiscount || 0,
        appliedPromoCode: orderData.appliedPromoCode || null
      };

      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(orderPayload)
      });

      const orderResponse = await response.json();

      if (!response.ok) {
        // Если ошибка авторизации - показываем модальное окно входа
        if (response.status === 401 || orderResponse.code === 'AUTH_REQUIRED' || orderResponse.code === 'INVALID_TOKEN') {
          setIsProcessing(false);
          setShowAuthModal(true);
          return;
        }
        throw new Error(orderResponse.error || 'Ошибка создания заказа');
      }

      // Для заявки — сразу на страницу успеха, без оплаты
      if (isOrderForm) {
        clearCart();
        setOrderCompleted(true);
        router.push(`/order-success?orderNumber=${orderResponse.orderNumber}`);
        return;
      }

      const paymentOrderData = {
        ...orderPayload,
        total: finalTotal,
        customerInfo: orderPayload.customerInfo,
        paymentMethod: orderPayload.paymentMethod
      };

      await processPayment(paymentOrderData, orderResponse);

    } catch (error: any) {
      console.error('❌ Ошибка при обработке заказа:', error);
      alert(`Ошибка: ${error.message}`);
      
      setIsProcessing(false);
      setIsProcessingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Загружаем страницу оформления...</p>
        </div>
      </div>
    );
  }

  const cartItems = items.map(item => ({
    id: item.id || item.article || '',
    name: item.name || item.title || 'Товар',
    price: item.price || 0,
    quantity: item.quantity || 1,
    image: item.images?.[0] || item.photo || item.image || '',
    size: item.size || '',
    article: item.article || item.id || ''
  }));

  return (
    <div className="min-h-screen lg:bg-[#E5DDD4] bg-white">
      {/* Основной контент */}
      <main className="min-h-screen">
        {/* Desktop Layout - 2 колонки */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-2 min-h-screen">
            {/* Левая колонка - Форма */}
            <div className="bg-[#E5DDD4] pl-[70px] pr-[20px] pt-8 pb-16">
              <NewCheckoutForm
                cartItems={cartItems}
                onSubmit={handleOrderSubmit}
                selectedDelivery={selectedDelivery}
                selectedPayment={selectedPayment}
                onDeliveryChange={setSelectedDelivery}
                onPaymentChange={setSelectedPayment}
                isMobile={false}
                isProcessing={isProcessing || isProcessingPayment}
                getPromoData={getPromoData}
              />
            </div>

            {/* Правая колонка - Сводка заказа */}
            <div className="bg-white pl-[20px] pr-[70px] py-8">
              <NewOrderSummary
                ref={orderSummaryRef}
                cartItems={cartItems}
                onSubmit={handleOrderSubmit}
                selectedDelivery={selectedDelivery}
                selectedPayment={selectedPayment}
                isMobile={false}
                isProcessing={isProcessing || isProcessingPayment}
                isAuthenticated={isAuthenticated}
                onAuthRequired={() => setShowAuthModal(true)}
              />
            </div>
          </div>
        </div>

        {/* Mobile Layout - 1 колонка с белым фоном */}
        <div className="lg:hidden bg-white min-h-screen">
          {/* Сводка заказа СВЕРХУ */}
          <div className="bg-white px-[10px] py-6">
            <NewOrderSummary
              ref={orderSummaryRef}
              cartItems={cartItems}
              onSubmit={handleOrderSubmit}
              selectedDelivery={selectedDelivery}
              selectedPayment={selectedPayment}
              isMobile={true}
              isProcessing={isProcessing || isProcessingPayment}
              isAuthenticated={isAuthenticated}
              onAuthRequired={() => setShowAuthModal(true)}
            />
          </div>

          {/* Форма СНИЗУ */}
          <div className="px-[10px] py-6 space-y-6">
            <NewCheckoutForm
              cartItems={cartItems}
              onSubmit={handleOrderSubmit}
              selectedDelivery={selectedDelivery}
              selectedPayment={selectedPayment}
              onDeliveryChange={setSelectedDelivery}
              onPaymentChange={setSelectedPayment}
              isMobile={true}
              isProcessing={isProcessing || isProcessingPayment}
              getPromoData={getPromoData}
              isAuthenticated={isAuthenticated}
              onAuthRequired={() => setShowAuthModal(true)}
            />
          </div>
        </div>
      </main>

      {/* Индикатор обработки платежа */}
      {isProcessingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg text-center max-w-sm mx-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Создаем платеж</h3>
            <p className="text-gray-600">Сейчас перенаправим вас на страницу оплаты ЮKassa...</p>
          </div>
        </div>
      )}

      {/* Модальное окно авторизации */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
};

export default CheckoutPage;