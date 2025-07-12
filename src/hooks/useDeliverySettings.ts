// src/hooks/useDeliverySettings.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ
import { useState, useEffect } from 'react';
import { DeliveryOption, PaymentOption, PromoCode } from '@/types/checkout';
import { getDeliverySettings, DeliverySettingsData } from '@/services/deliverySettingsService';

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

      console.log('🔄 Загружаем настройки доставки из Google Таблицы...');
      
      // ✅ ИСПРАВЛЕНО: используем реальный API
      const settings: DeliverySettingsData = await getDeliverySettings(forceRefresh);

      setDeliveryOptions(settings.deliveryOptions);
      setPaymentOptions(settings.paymentOptions);
      setPromoCodes(settings.promoCodes);
      setGeneralSettings(settings.generalSettings);

      console.log('✅ Настройки доставки загружены из API:', {
        deliveryOptions: settings.deliveryOptions.length,
        paymentOptions: settings.paymentOptions.length,
        promoCodes: settings.promoCodes.length
      });

      // Отладочная информация по ценам
      console.log('💰 Цены доставки:');
      settings.deliveryOptions.forEach(option => {
        console.log(`  ${option.name}: ${option.price}₽`);
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