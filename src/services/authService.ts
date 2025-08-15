import { RegisterRequest } from "@/types/auth";

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const validatePhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/[^\d+\-() ]/g, '');
  
  const digitsOnly = cleanPhone.replace(/[^\d]/g, '');
  
  if (digitsOnly.length < 10 || digitsOnly.length > 12) {
    return false;
  }
  
  const russianPhoneRegex = /^(\+7|8|7)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
  return russianPhoneRegex.test(cleanPhone);
};

export const formatPhone = (phone: string): string => {
  const digitsOnly = phone.replace(/[^\d]/g, '');
  
  if (digitsOnly.startsWith('8') && digitsOnly.length === 11) {
    return '+7' + digitsOnly.slice(1);
  }
  
  if (digitsOnly.startsWith('7') && digitsOnly.length === 11) {
    return '+' + digitsOnly;
  }
  
  if (digitsOnly.length === 10) {
    return '+7' + digitsOnly;
  }
  
  return phone; 
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