import api from './api';
import type { Equipo, Categoria, CatalogStats, CatalogFilters, PaginatedResponse } from '../types';

export const catalogService = {
  getEquipos: async (role: string, filters?: CatalogFilters): Promise<PaginatedResponse<Equipo>> => {
    const params = new URLSearchParams();

    // Ahora TypeScript ya no marcará error aquí porque agregamos page/limit a la interfaz
    if (filters) {
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.categoria_id) params.append('categoria_id', filters.categoria_id.toString());
      if (filters.min_precio) params.append('min_precio', filters.min_precio.toString());
      if (filters.max_precio) params.append('max_precio', filters.max_precio.toString());
    }

    // Determinar endpoint
    const endpoint = role === 'admin'
      ? `/admin/equipment`
      : `/${role}/api/catalogo`;

    // Hacemos la petición
    const response = await api.get(`${endpoint}?${params.toString()}`);

    const resData = response.data;

    // NORMALIZACIÓN:
    // Caso 1: El backend devuelve un Array plano (ej: [ {...}, {...} ])
    if (Array.isArray(resData)) {
      return {
        data: resData as Equipo[],
        pagination: {
          total: resData.length,
          totalPages: 1,
          page: filters?.page || 1,
          limit: filters?.limit || resData.length || 10
        }
      };
    }

    // Caso 2: El backend ya devuelve estructura paginada { data: [...], pagination: {...} }
    if (resData && resData.data && Array.isArray(resData.data)) {
      return resData as PaginatedResponse<Equipo>;
    }

    // Fallback (Por si falla todo, devolver vacío válido)
    return {
      data: [],
      pagination: { total: 0, totalPages: 0, page: 1, limit: 10 }
    };
  },

  getEquipoById: async (role: string, id: number): Promise<Equipo> => {
    const url = role === 'admin'
      ? `/admin/equipment/${id}`
      : `/${role}/api/catalogo/${id}`;
    const response = await api.get(url);
    return response.data;
  },

  getCategorias: async (role: string): Promise<Categoria[]> => {
    const url = role === 'admin' ? '/admin/categories' : `/${role}/api/categorias`;
    const response = await api.get(url);
    return response.data;
  },

  getStats: async (role: string): Promise<CatalogStats> => {
    const url = role === 'admin' ? '/admin/equipment/stats' : `/${role}/api/catalogo/stats`;
    const response = await api.get(url);
    return response.data;
  },

  quickSearch: async (query: string): Promise<Equipo[]> => {
    const response = await api.get(`/catalogo/buscar?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // ADMINISTRACIÓN
  createEquipo: async (formData: FormData): Promise<Equipo> => {
    const response = await api.post('/admin/equipment', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateEquipo: async (id: number, formData: FormData): Promise<Equipo> => {
    const response = await api.put(`/admin/equipment/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteEquipo: async (id: number): Promise<void> => {
    await api.delete(`/admin/equipment/${id}`);
  }
};