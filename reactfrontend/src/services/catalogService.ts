import api, { handleApiError } from './api';
import type { Equipo, Categoria, CatalogFilters, CatalogStats, ApiResponse, UserRole } from '../types';

export const catalogService = {
  // Get all equipos with filters
  getEquipos: async (role: UserRole, filters?: CatalogFilters): Promise<Equipo[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.categoria_id) params.append('categoria', filters.categoria_id.toString());
      if (filters?.min_precio) params.append('min_precio', filters.min_precio.toString());
      if (filters?.max_precio) params.append('max_precio', filters.max_precio.toString());

      const response = await api.get<Equipo[]>(`/${role}/api/catalogo?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get equipo by ID
  getEquipoById: async (role: UserRole, id: number): Promise<Equipo> => {
    try {
      const response = await api.get<ApiResponse<Equipo>>(`/${role}/api/catalogo/${id}`);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Equipo no encontrado');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get all categories
  getCategorias: async (role: UserRole): Promise<Categoria[]> => {
    try {
      const response = await api.get<Categoria[]>(`/${role}/api/categorias`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get catalog stats
  getStats: async (role: UserRole): Promise<CatalogStats> => {
    try {
      const response = await api.get<ApiResponse<CatalogStats>>(`/${role}/api/catalogo/stats`);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Error al obtener estadísticas');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Quick search
  quickSearch: async (query: string): Promise<Equipo[]> => {
    try {
      const response = await api.get<Equipo[]>(`/api/catalogo/buscar?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
