import api, { handleApiError } from './api';
import type { User, ApiResponse } from '../types';

export interface UserStats {
  total: number;
  admins: number;
  vendedores: number;
  clientes: number;
  activos: number;
}

export interface UpdateUserRoleData {
  role: 'cliente' | 'vendedor' | 'admin';
}

export const userService = {
  // Get all users (admin only)
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get<ApiResponse<User[]>>('/api/admin/users');
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Error al obtener usuarios');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get user by ID (admin only)
  getUserById: async (id: number): Promise<User> => {
    try {
      const response = await api.get<ApiResponse<User>>(`/api/admin/users/${id}`);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Error al obtener usuario');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update user role (admin only)
  updateUserRole: async (id: number, data: UpdateUserRoleData): Promise<User> => {
    try {
      const response = await api.put<ApiResponse<User>>(`/api/admin/users/${id}`, data);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Error al actualizar rol');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get user statistics (admin only)
  getUserStats: async (): Promise<UserStats> => {
    try {
      const response = await api.get<ApiResponse<UserStats>>('/api/admin/users/stats');
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Error al obtener estadísticas');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
};
