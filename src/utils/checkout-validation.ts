import { z } from 'zod';

export const checkoutValidationSchema = z.object({
  firstName: z.string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(50, 'Имя не должно превышать 50 символов'),
  
  lastName: z.string()
    .min(2, 'Фамилия должна содержать минимум 2 символа')
    .max(50, 'Фамилия не должна превышать 50 символов'),
  
  email: z.string()
    .email('Некорректный email адрес')
    .max(100, 'Email не должен превышать 100 символов'),
  
  phone: z.string()
    .regex(/^\+7\d{10}$/, 'Номер телефона должен быть в формате +7XXXXXXXXXX'),
  
  region: z.string()
    .min(2, 'Укажите регион')
    .max(100, 'Название региона слишком длинное'),
  
  city: z.string()
    .min(2, 'Укажите город')
    .max(100, 'Название города слишком длинное'),
  
  address: z.string()
    .min(10, 'Укажите полный адрес (минимум 10 символов)')
    .max(200, 'Адрес слишком длинный'),
  
  postalCode: z.string()
    .regex(/^\d{6}$/, 'Индекс должен содержать 6 цифр'),
  
  recipientFirstName: z.string().optional(),
  recipientLastName: z.string().optional(),
  recipientPhone: z.string().optional(),
  
  deliveryMethod: z.enum([
    'store_pickup',
    'courier_ts', 
    'cdek_pickup',
    'cdek_courier',
    'post_russia',
    'boxberry'
  ]),
  
  paymentMethod: z.enum([
    'card',
    'cash_vladivostok'
  ])
});

export type CheckoutValidationSchema = z.infer<typeof checkoutValidationSchema>;
