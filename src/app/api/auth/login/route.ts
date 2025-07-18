import { NextResponse } from 'next/server';
import { updateLastLogin } from '@/services/googleSheetsService';

interface LoginRequest {
  email: string;
}

const SHEET_ID = '1naTkxDrQFfj_d7Q2U46GOj24hSqTAqrt_Yz1ImaKyVc';
const USERS_SHEET_GID = '288409925'; // ИСПРАВЛЕНО: правильный gid листа "Пользователи"

export async function POST(request: Request) {
  try {
    const body: LoginRequest = await request.json();
    console.log('🔐 Попытка входа:', body.email);

    // Валидация email
    if (!validateEmail(body.email)) {
      return NextResponse.json({
        success: false,
        error: 'Некорректный email адрес',
        field: 'email'
      }, { status: 400 });
    }

    // Ищем пользователя по email
    const user = await findUserByEmail(body.email);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Пользователь с таким email не найден. Зарегистрируйтесь сначала.',
        field: 'email'
      }, { status: 404 });
    }

    console.log('✅ Пользователь найден:', user.id);

    // Обновляем дату последнего входа в Google Sheets
    try {
      if (process.env.GOOGLE_APPS_SCRIPT_URL) {
        console.log('🔄 Обновляем дату последнего входа через webhook...');
        await updateLastLogin(body.email);
      } else {
        console.log('⚠️ Google Apps Script webhook не настроен для обновления даты входа');
      }
    } catch (error) {
      console.error('❌ Ошибка обновления даты входа:', error);
      // Не прерываем вход, если не удалось обновить дату
    }

    return NextResponse.json({
      success: true,
      message: 'Вход выполнен успешно',
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('❌ Ошибка входа:', error);
    return NextResponse.json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    }, { status: 500 });
  }
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function findUserByEmail(email: string): Promise<any | null> {
  try {
    // ИСПРАВЛЕНО: Используем правильный gid листа "Пользователи"
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${USERS_SHEET_GID}`;
    
    console.log('🔍 Ищем пользователя в листе "Пользователи" с gid=', USERS_SHEET_GID);
    
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
    console.log('📄 CSV получен для поиска пользователя, длина:', csvText.length);
    
    const lines = csvText.split('\n').filter(line => line.trim());
    console.log('📄 Найдено строк:', lines.length);

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      console.log(`🔍 Проверяем строку ${i}:`, values);
      
      if (values.length >= 6) {
        const userId = cleanString(values[0]);
        const userPhone = cleanString(values[1]);
        const userEmail = cleanString(values[2]);
        const agreeToMarketing = cleanString(values[3]) === 'true';
        const registrationDate = cleanString(values[4]);
        const lastLogin = cleanString(values[5]);

        console.log(`🔍 Сравниваем email: "${userEmail}" с "${email}"`);

        if (userEmail.toLowerCase() === email.toLowerCase()) {
          console.log('👤 Найден пользователь:', userId);
          return {
            id: userId,
            phone: userPhone,
            email: userEmail,
            agreeToMarketing,
            registrationDate,
            lastLogin
          };
        }
      }
    }

    console.log('❌ Пользователь с email не найден:', email);
    return null;

  } catch (error) {
    console.error('❌ Ошибка поиска пользователя:', error);
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