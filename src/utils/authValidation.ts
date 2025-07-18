import { RegisterRequest } from "@/types/auth";

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const validatePhone = (phone: string): boolean => {
  // Убираем все символы кроме цифр, +, -, (, ), пробелов
  const cleanPhone = phone.replace(/[^\d+\-() ]/g, '');
  
  // Убираем все кроме цифр для проверки длины
  const digitsOnly = cleanPhone.replace(/[^\d]/g, '');
  
  // Проверяем длину (от 10 до 12 цифр для российских номеров)
  if (digitsOnly.length < 10 || digitsOnly.length > 12) {
    return false;
  }
  
  // Проверяем российские форматы
  const russianPhoneRegex = /^(\+7|8|7)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
  return russianPhoneRegex.test(cleanPhone);
};

export const formatPhone = (phone: string): string => {
  // Убираем все кроме цифр
  const digitsOnly = phone.replace(/[^\d]/g, '');
  
  // Если начинается с 8, заменяем на +7
  if (digitsOnly.startsWith('8') && digitsOnly.length === 11) {
    return '+7' + digitsOnly.slice(1);
  }
  
  // Если начинается с 7, добавляем +
  if (digitsOnly.startsWith('7') && digitsOnly.length === 11) {
    return '+' + digitsOnly;
  }
  
  // Если 10 цифр, добавляем +7
  if (digitsOnly.length === 10) {
    return '+7' + digitsOnly;
  }
  
  return phone; // Возвращаем как есть, если не подходит под форматы
};

export const validateRegistrationData = (data: RegisterRequest): { 
  isValid: boolean; 
  errors: Record<string, string> 
} => {
  const errors: Record<string, string> = {};

  if (!data.email || !validateEmail(data.email)) {
    errors.email = 'Введите корректный email адрес';
  }

  if (!data.phone || !validatePhone(data.phone)) {
    errors.phone = 'Введите корректный номер телефона';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};