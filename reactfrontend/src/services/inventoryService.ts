import api, { handleApiError } from './api';
import type { Equipo, Categoria, InventoryStats, ApiResponse, CatalogFilters } from '../types';

export interface CreateEquipmentData {
  categoria_id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  material?: string;
  dimensiones?: string;
  precio: number;
  stock: number;
  imagen_url?: string;
}

export interface UpdateEquipmentData extends CreateEquipmentData {
  id: number;
}

export interface CreateCategoryData {
  nombre: string;
  descripcion?: string;
}

export interface UpdateCategoryData extends CreateCategoryData {
  id: number;
}

export const inventoryService = {
  // ===== EQUIPMENT =====

  // Get all equipment with optional filters
  getAllEquipment: async (filters?: CatalogFilters): Promise<Equipo[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.categoria_id) params.append('categoria', filters.categoria_id.toString());
      if (filters?.min_precio) params.append('min_precio', filters.min_precio.toString());
      if (filters?.max_precio) params.append('max_precio', filters.max_precio.toString());

      const queryString = params.toString();
      const url = `/api/admin/equipment${queryString ? `?${queryString}` : ''}`;

      const response = await api.get<ApiResponse<Equipo[]>>(url);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Error al obtener equipos');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get equipment by ID
  getEquipmentById: async (id: number): Promise<Equipo> => {
    try {
      const response = await api.get<ApiResponse<Equipo>>(`/api/admin/equipment/${id}`);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Error al obtener equipo');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Create equipment
  createEquipment: async (data: CreateEquipmentData): Promise<Equipo> => {
    try {
      const response = await api.post<ApiResponse<Equipo>>('/api/admin/equipment', data);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Error al crear equipo');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update equipment
  updateEquipment: async (id: number, data: CreateEquipmentData): Promise<Equipo> => {
    try {
      const response = await api.put<ApiResponse<Equipo>>(`/api/admin/equipment/${id}`, data);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Error al actualizar equipo');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Delete equipment
  deleteEquipment: async (id: number): Promise<void> => {
    try {
      const response = await api.delete<ApiResponse<void>>(`/api/admin/equipment/${id}`);
      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al eliminar equipo');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update stock
  updateStock: async (id: number, stock: number): Promise<number> => {
    try {
      const response = await api.patch<ApiResponse<{ newStock: number }>>(`/api/admin/equipment/${id}/stock`, { stock });
      if (response.data.success && response.data.data) {
        return response.data.data.newStock;
      }
      throw new Error(response.data.error || 'Error al actualizar stock');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get inventory statistics
  getInventoryStats: async (): Promise<InventoryStats> => {
    try {
      const response = await api.get<ApiResponse<InventoryStats>>('/api/admin/equipment/stats');
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Error al obtener estadísticas');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ===== CATEGORIES =====

  // Get all categories
  getAllCategories: async (): Promise<Categoria[]> => {
    try {
      const response = await api.get<ApiResponse<Categoria[]>>('/api/admin/categories');
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Error al obtener categorías');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get category by ID
  getCategoryById: async (id: number): Promise<Categoria> => {
    try {
      const response = await api.get<ApiResponse<Categoria>>(`/api/admin/categories/${id}`);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Error al obtener categoría');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Create category
  createCategory: async (data: CreateCategoryData): Promise<Categoria> => {
    try {
      const response = await api.post<ApiResponse<Categoria>>('/api/admin/categories', data);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Error al crear categoría');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update category
  updateCategory: async (id: number, data: CreateCategoryData): Promise<Categoria> => {
    try {
      const response = await api.put<ApiResponse<Categoria>>(`/api/admin/categories/${id}`, data);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Error al actualizar categoría');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Delete category
  deleteCategory: async (id: number): Promise<void> => {
    try {
      const response = await api.delete<ApiResponse<void>>(`/api/admin/categories/${id}`);
      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al eliminar categoría');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
};
