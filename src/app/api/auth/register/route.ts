import { NextResponse } from 'next/server';
import { saveUserToGoogleSheets } from '@/services/googleSheetsService';

interface RegisterRequest {
  phone: string;
  email: string;
  agreeToMarketing: boolean;
}

interface User {
  id: string;
  phone: string;
  email: string;
  agreeToMarketing: boolean;
  registrationDate: string;
  lastLogin: string;
}

const SHEET_ID = '1naTkxDrQFfj_d7Q2U46GOj24hSqTAqrt_Yz1ImaKyVc';
const USERS_SHEET_GID = '288409925';

export async function POST(request: Request) {
  try {
    const body: RegisterRequest = await request.json();
    console.log('📝 Регистрация пользователя:', { email: body.email, phone: body.phone });

    // Валидация данных
    const validation = validateRegistrationData(body);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: validation.error,
        field: validation.field
      }, { status: 400 });
    }

    // Проверяем, существует ли пользователь
    const existingUser = await checkUserExists(body.email, body.phone);
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: existingUser.field === 'email' 
          ? 'Пользователь с таким email уже зарегистрирован' 
          : 'Пользователь с таким номером телефона уже зарегистрирован',
        field: existingUser.field
      }, { status: 409 });
    }

    // Создаем нового пользователя
    const newUser: User = {
      id: generateUserId(),
      phone: body.phone,
      email: body.email,
      agreeToMarketing: body.agreeToMarketing,
      registrationDate: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    console.log('✅ Пользователь создан:', newUser.id);

    // Сохраняем через Google Apps Script webhook
    let savedToSheets = false;
    let sheetsError = null;
    
    try {
      if (process.env.GOOGLE_APPS_SCRIPT_URL) {
        console.log('💾 Сохраняем через Google Apps Script webhook...');
        savedToSheets = await saveUserToGoogleSheets(newUser);
      } else {
        console.log('⚠️ Google Apps Script webhook не настроен');
        sheetsError = 'Webhook не настроен';
      }
    } catch (error) {
      console.error('❌ Ошибка при сохранении в Google Sheets:', error);
      sheetsError = error instanceof Error ? error.message : 'Неизвестная ошибка';
    }

    // Формируем сообщение о результате
    let message = 'Регистрация успешна!';
    if (savedToSheets) {
      message += ' Данные сохранены в Google Таблицы.';
    } else if (sheetsError) {
      message += ` (Google Sheets: ${sheetsError})`;
    } else {
      message += ' Данные сохранены локально.';
    }

    return NextResponse.json({
      success: true,
      message,
      user: {
        id: newUser.id,
        email: newUser.email,
        phone: newUser.phone
      },
      savedToSheets
    });

  } catch (error) {
    console.error('❌ Ошибка регистрации:', error);
    return NextResponse.json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    }, { status: 500 });
  }
}

function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function validateRegistrationData(data: RegisterRequest): { isValid: boolean; error?: string; field?: string } {
  if (!data.email || !validateEmail(data.email)) {
    return { isValid: false, error: 'Некорректный email адрес', field: 'email' };
  }

  if (!data.phone || !validatePhone(data.phone)) {
    return { isValid: false, error: 'Некорректный номер телефона', field: 'phone' };
  }

  return { isValid: true };
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone: string): boolean {
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 12;
}

async function checkUserExists(email: string, phone: string): Promise<{ exists: true; field: 'email' | 'phone' } | null> {
  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${USERS_SHEET_GID}`;
    
    console.log('🔍 Проверяем лист "Пользователи" с gid=', USERS_SHEET_GID);
    
    const response = await fetch(csvUrl, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

    if (!response.ok) {
      console.log('❌ Ошибка доступа к листу "Пользователи":', response.status);
      return null;
    }

    const csvText = await response.text();
    const lines = csvText.split('\n').filter(line => line.trim());

    // Проверяем каждую строку (пропускаем заголовок)
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      
      if (values.length >= 3) {
        const userPhone = cleanString(values[1]);
        const userEmail = cleanString(values[2]);

        if (userEmail.toLowerCase() === email.toLowerCase()) {
          console.log('❌ Email уже существует:', userEmail);
          return { exists: true, field: 'email' };
        }

        if (userPhone === phone) {
          console.log('❌ Телефон уже существует:', userPhone);
          return { exists: true, field: 'phone' };
        }
      }
    }

    console.log('✅ Пользователь не найден, можно регистрировать');
    return null;

  } catch (error) {
    console.error('❌ Ошибка проверки пользователя:', error);
    return null;
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim()); 
  return result;
}

function cleanString(str: string): string {
  return str.replace(/^["']+|["']+$/g, '').trim();
}