import api from './api';

/**
 * Authentication API Service
 * Handles user authentication and profile management
 */

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  token: string;
  expiresIn: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  notificationPreferences: {
    email: boolean;
    reminderHours: number;
  };
  createdAt: string;
}

/**
 * Register a new user
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/register', data);

  // Store token in localStorage
  if (response.data.token) {
    localStorage.setItem('auth_token', response.data.token);
  }

  return response.data;
}

/**
 * Login user
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', data);

  // Store token in localStorage
  if (response.data.token) {
    localStorage.setItem('auth_token', response.data.token);
  }

  return response.data;
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } finally {
    // Always remove token from localStorage
    localStorage.removeItem('auth_token');
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<UserProfile> {
  const response = await api.get<UserProfile>('/auth/me');
  return response.data;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('auth_token');
}

/**
 * Get stored auth token
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}
