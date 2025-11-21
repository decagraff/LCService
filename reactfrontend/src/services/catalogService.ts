import api from './api';
import type { Equipo, Categoria, CatalogStats, CatalogFilters, PaginatedResponse } from '../types';

export const catalogService = {
  getEquipos: async (role: string, filters?: CatalogFilters): Promise<PaginatedResponse<Equipo>> => {
    const params = new URLSearchParams();

    if (filters) {
      // Pasamos los filtros a la URL
      if (filters.search) params.append('search', filters.search);
      if (filters.categoria_id) params.append('categoria', filters.categoria_id.toString());
      if (filters.min_precio) params.append('min_precio', filters.min_precio.toString());
      if (filters.max_precio) params.append('max_precio', filters.max_precio.toString());
    }

    // 1. CORRECCIÓN DE ENDPOINT: Usar prefijo /api
    const endpoint = role === 'admin'
      ? `/api/admin/equipment`
      : `/${role}/api/catalogo`; // Este endpoint sí suele paginar en backend

    try {
      const response = await api.get(`${endpoint}?${params.toString()}`);
      const resData = response.data;

      // CASO A: Respuesta Paginada (Backend ya devuelve estructura correcta)
      if (resData.success && resData.pagination) {
        return {
          data: resData.data,
          pagination: resData.pagination
        };
      }

      // CASO B: Respuesta Plana (Backend de Admin devuelve { success: true, data: [...] })
      if (resData.success && Array.isArray(resData.data)) {
        const allItems = resData.data as Equipo[];
        const page = filters?.page || 1;
        const limit = filters?.limit || 12;

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedItems = allItems.slice(startIndex, endIndex);

        return {
          data: paginatedItems,
          pagination: {
            total: allItems.length,
            totalPages: Math.ceil(allItems.length / limit),
            page,
            limit
          }
        };
      }

      // Fallback vacio
      return {
        data: [],
        pagination: { total: 0, totalPages: 0, page: 1, limit: 10 }
      };

    } catch (error) {
      console.error("Error en catalogService:", error);
      return {
        data: [],
        pagination: { total: 0, totalPages: 0, page: 1, limit: 10 }
      };
    }
  },

  getEquipoById: async (role: string, id: number): Promise<Equipo> => {
    const url = role === 'admin'
      ? `/api/admin/equipment/${id}` // Corrección ruta
      : `/${role}/api/catalogo/${id}`;
    const response = await api.get(url);
    return response.data.data || response.data; // Manejar ambos formatos
  },

  getCategorias: async (role: string): Promise<Categoria[]> => {
    const url = role === 'admin' ? '/api/admin/categories' : `/${role}/api/categorias`; // Corrección ruta
    const response = await api.get(url);
    return Array.isArray(response.data) ? response.data : (response.data.data || response.data.categorias || []);
  },

  getStats: async (role: string): Promise<CatalogStats> => {
    const url = role === 'admin' ? '/api/admin/equipment/stats' : `/${role}/api/catalogo/stats`; // Corrección ruta
    const response = await api.get(url);
    return response.data.data || response.data;
  },

  // 2. CORRECCIÓN DE BÚSQUEDA RÁPIDA
  quickSearch: async (query: string): Promise<Equipo[]> => {
    const response = await api.get(`/api/catalogo/buscar?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // ADMINISTRACIÓN (FormData para subida de imágenes)
  createEquipo: async (formData: FormData): Promise<Equipo> => {
    const response = await api.post('/api/admin/equipment', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  updateEquipo: async (id: number, formData: FormData): Promise<Equipo> => {
    const response = await api.put(`/api/admin/equipment/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  deleteEquipo: async (id: number): Promise<void> => {
    await api.delete(`/api/admin/equipment/${id}`);
  }
};