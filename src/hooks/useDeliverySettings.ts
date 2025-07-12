// src/hooks/useDeliverySettings.ts - ВРЕМЕННЫЙ ФИКС
import { useState, useEffect } from 'react';
import { DeliveryOption, PaymentOption, PromoCode } from '@/types/checkout';

interface GeneralSettings {
  deliveryTimeGeneral: string;
  minOrderFreeDelivery: number;
  currency: string;
}

interface DeliverySettings {
  deliveryOptions: DeliveryOption[];
  paymentOptions: PaymentOption[];
  promoCodes: PromoCode[];
  generalSettings: GeneralSettings;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useDeliverySettings = (): DeliverySettings => {
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    deliveryTimeGeneral: '16-21 дней',
    minOrderFreeDelivery: 5000,
    currency: '₽'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDeliverySettings = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // 🔧 ВРЕМЕННО: используем встроенные настройки
      console.log('⚡ Используем встроенные настройки доставки');
      
      const testDeliveryOptions: DeliveryOption[] = [
        {
          id: 'store_pickup',
          name: 'Доставить в магазин TS',
          price: 0,
          estimatedDays: '5-7 дней',
          description: 'Бесплатный самовывоз'
        },
        {
          id: 'courier_ts',
          name: 'Доставка курьером TS',
          price: 0,
          estimatedDays: '5-7 дней',
          description: 'Бесплатная доставка по Владивостоку'
        },
        {
          id: 'cdek_pickup',
          name: 'СДЭК - доставка до пункта выдачи',
          price: 300,
          estimatedDays: '3-5 дней',
          description: 'Доставка до ближайшего пункта СДЭК'
        },
        {
          id: 'cdek_courier',
          name: 'СДЭК - доставка курьером',
          price: 500,
          estimatedDays: '3-5 дней',
          description: 'Доставка курьером СДЭК'
        },
        {
          id: 'post_russia',
          name: 'Почта России',
          price: 250,
          estimatedDays: '7-14 дней',
          description: 'Доставка Почтой России'
        },
        {
          id: 'boxberry',
          name: 'BoxBerry',
          price: 350,
          estimatedDays: '4-6 дней',
          description: 'Доставка до пункта BoxBerry'
        }
      ];

      const testPaymentOptions: PaymentOption[] = [
        {
          id: 'card',
          name: 'Оплата картой (МИР, VISA, MasterCard)',
          description: 'Онлайн оплата банковской картой'
        },
        {
          id: 'cash_vladivostok',
          name: 'Оплата наличными в городе Владивосток',
          description: 'Оплата наличными при получении'
        }
      ];

      const testPromoCodes: PromoCode[] = [
        {
          code: 'WELCOME10',
          discount: 10,
          type: 'percentage'
        },
        {
          code: 'SAVE500',
          discount: 500,
          type: 'amount'
        },
        {
          code: 'FREESHIP',
          discount: 0,
          type: 'free_shipping'
        }
      ];

      // Имитируем небольшую задержку
      await new Promise(resolve => setTimeout(resolve, 300));

      setDeliveryOptions(testDeliveryOptions);
      setPaymentOptions(testPaymentOptions);
      setPromoCodes(testPromoCodes);

      console.log('✅ Настройки доставки загружены:', {
        deliveryOptions: testDeliveryOptions.length,
        paymentOptions: testPaymentOptions.length,
        promoCodes: testPromoCodes.length
      });

    } catch (err) {
      console.error('❌ Ошибка загрузки настроек:', err);
      setError(err instanceof Error ? err.message : 'Ошибка загрузки настроек доставки');
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await loadDeliverySettings(true);
  };

  useEffect(() => {
    loadDeliverySettings();
  }, []);

  return {
    deliveryOptions,
    paymentOptions,
    promoCodes,
    generalSettings,
    loading,
    error,
    refetch
  };
};