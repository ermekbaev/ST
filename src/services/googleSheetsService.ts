// Сервис для работы с Google Sheets через webhook (без googleapis)

interface UserData {
  id: string;
  phone: string;
  email: string;
  agreeToMarketing: boolean;
  registrationDate: string;
  lastLogin: string;
}

const WEBHOOK_URL = process.env.GOOGLE_APPS_SCRIPT_URL;

// Функция для записи пользователя через Google Apps Script
export const saveUserToGoogleSheets = async (userData: UserData): Promise<boolean> => {
  try {
    console.log('📝 Начинаем сохранение пользователя через Google Apps Script...');
    console.log('📊 Данные пользователя:', userData);

    // Проверяем наличие webhook URL
    if (!WEBHOOK_URL) {
      console.log('⚠️ Google Apps Script webhook не настроен');
      return false;
    }

    // Отправляем данные на webhook
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'register',
        id: userData.id,
        phone: userData.phone,
        email: userData.email,
        agreeToMarketing: userData.agreeToMarketing,
        registrationDate: userData.registrationDate,
        lastLogin: userData.lastLogin
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Пользователь успешно сохранен в Google Sheets через webhook');
      return true;
    } else {
      console.error('❌ Ошибка от Google Apps Script:', result.error);
      return false;
    }

  } catch (error) {
    console.error('❌ Ошибка при сохранении через webhook:', error);
    return false;
  }
};

// Функция для обновления даты последнего входа через Google Apps Script
export const updateLastLogin = async (userEmail: string): Promise<boolean> => {
  try {
    console.log('🔄 Обновляем дату последнего входа через webhook для:', userEmail);

    // Проверяем наличие webhook URL
    if (!WEBHOOK_URL) {
      console.log('⚠️ Google Apps Script webhook не настроен');
      return false;
    }

    // Отправляем данные на webhook
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'updateLogin',
        email: userEmail,
        lastLogin: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Дата последнего входа обновлена через webhook');
      return true;
    } else {
      console.error('❌ Ошибка от Google Apps Script:', result.error);
      return false;
    }

  } catch (error) {
    console.error('❌ Ошибка при обновлении даты входа через webhook:', error);
    return false;
  }
};

// Функция для тестирования webhook
export const testGoogleSheetsConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 Тестируем подключение к Google Apps Script webhook...');

    if (!WEBHOOK_URL) {
      console.log('⚠️ Google Apps Script webhook не настроен');
      return false;
    }

    // Отправляем тестовый запрос
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'test'
      })
    });

    if (response.ok) {
      console.log('✅ Webhook доступен');
      return true;
    } else {
      console.log('❌ Webhook недоступен, статус:', response.status);
      return false;
    }

  } catch (error) {
    console.error('❌ Ошибка подключения к webhook:', error);
    return false;
  }
};

// УДАЛЯЕМ все функции, связанные с googleapis, чтобы избежать ошибок
// Если в будущем понадобится полная интеграция с Google Sheets API,
// можно будет установить googleapis и раскомментировать соответствующие функции

// Заглушка для совместимости с существующим кодом
export const saveUserToGoogleSheetsAPI = async (userData: UserData): Promise<boolean> => {
  console.log('⚠️ Google Sheets API не настроен, используйте webhook');
  return false;
};