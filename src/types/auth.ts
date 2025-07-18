export interface User {
  id: string;
  phone: string;
  email: string;
  agreeToMarketing: boolean;
  registrationDate: string;
  lastLogin: string;
}

export interface AuthUser {
  id: string;
  email: string;
  phone: string;
}

export interface RegisterRequest {
  phone: string;
  email: string;
  agreeToMarketing: boolean;
}

export interface LoginRequest {
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  field?: string;
  user?: AuthUser;
}