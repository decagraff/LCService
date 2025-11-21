import api, { handleApiError } from './api';
import type { User, ApiResponse } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  apellido: string; // Agregado (Requerido en DB)
  email: string;
  password: string;
  confirmPassword: string;
  telefono?: string;
  direccion?: string;
  empresa?: string; // Agregado (Opcional en DB)
}

export const authService = {
  // Login
  login: async (credentials: LoginCredentials): Promise<User> => {
    try {
      const response = await api.post<ApiResponse<User>>('/api/auth/login', credentials);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Error al iniciar sesión');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Register
  register: async (data: RegisterData): Promise<User> => {
    try {
      const response = await api.post<ApiResponse<User>>('/api/auth/register', data);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Error al registrarse');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await api.get<ApiResponse<User>>('/api/auth/me');
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  // Update profile
  updateProfile: async (userId: number, data: Partial<User>): Promise<User> => {
    try {
      const response = await api.put<ApiResponse<User>>(`/api/profile/${userId}`, data);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Error al actualizar perfil');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};