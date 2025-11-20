import api, { handleApiError } from './api';
import type { Cotizacion, CotizacionStats, CotizacionFilters, ApiResponse, UserRole } from '../types';

// Definimos la interfaz para los parámetros de creación
interface CreateCotizacionParams {
  notas?: string;
  cliente_id?: number;
  vendedor_id?: number;
}

export const cotizacionesService = {
  // Get all cotizaciones for user with filters and pagination
  getCotizaciones: async (
    role: UserRole,
    filters?: CotizacionFilters & { page?: number; limit?: number }
  ): Promise<{ data: Cotizacion[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> => {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.estado) params.append('estado', filters.estado);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await api.get<{
        success: boolean;
        data: Cotizacion[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>(`/${role}/api/cotizaciones?${params.toString()}`);

      return {
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get cotizacion by ID
  getCotizacionById: async (role: UserRole, id: number): Promise<Cotizacion> => {
    try {
      const response = await api.get<ApiResponse<Cotizacion>>(`/${role}/api/cotizaciones/${id}`);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Cotización no encontrada');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get cotizaciones stats
  getStats: async (role: UserRole): Promise<CotizacionStats> => {
    try {
      const response = await api.get<ApiResponse<CotizacionStats>>(`/${role}/api/cotizaciones/stats`);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Error al obtener estadísticas');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Create nueva cotizacion from cart
  createCotizacion: async (role: UserRole, params: CreateCotizacionParams): Promise<Cotizacion> => {
    try {
      const response = await api.post<ApiResponse<Cotizacion>>(`/${role}/api/cotizaciones/nueva`, params);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Error al crear cotización');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Delete cotizacion (only drafts)
  deleteCotizacion: async (role: UserRole, id: number): Promise<void> => {
    try {
      const response = await api.delete<ApiResponse<void>>(`/${role}/api/cotizaciones/${id}`);
      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al eliminar cotización');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Reportes
  getReportKPIs: async (role: UserRole): Promise<any> => {
    try {
      const response = await api.get<ApiResponse<any>>(`/${role}/api/reports/kpis`);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getReportSalesByMonth: async (role: UserRole): Promise<any[]> => {
    try {
      const response = await api.get<ApiResponse<any[]>>(`/${role}/api/reports/sales-by-month`);
      return response.data.data || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getReportSalesBySeller: async (role: UserRole): Promise<any[]> => {
    try {
      const response = await api.get<ApiResponse<any[]>>(`/${role}/api/reports/sales-by-seller`);
      return response.data.data || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getReportSalesStatus: async (role: UserRole): Promise<any[]> => {
    try {
      const response = await api.get<ApiResponse<any[]>>(`/${role}/api/reports/sales-status`);
      return response.data.data || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getThesisKPIs: async (role: UserRole): Promise<any> => {
    try {
      const response = await api.get<ApiResponse<any>>(`/${role}/api/reports/thesis-kpis`);
      return response.data.data || {};
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // NEW: Filtered Report Methods
  getFilteredReportKPIs: async (role: UserRole, filters: any): Promise<any> => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      const response = await api.get<ApiResponse<any>>(`/${role}/api/reports/kpis?${params.toString()}`);
      return response.data.data || {};
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getFilteredSalesByPeriod: async (role: UserRole, filters: any): Promise<any> => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      const response = await api.get<ApiResponse<any>>(`/${role}/api/reports/sales-by-month?${params.toString()}`);
      return response.data.data || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getSalesByCategory: async (role: UserRole, filters: any = {}): Promise<any[]> => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      const response = await api.get<ApiResponse<any[]>>(`/${role}/api/reports/sales-by-category?${params.toString()}`);
      return response.data.data || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getPreTestDetailed: async (role: UserRole, filters: any = {}): Promise<any> => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      const response = await api.get<ApiResponse<any>>(`/${role}/api/reports/pre-test-detailed?${params.toString()}`);
      return response.data.data || {};
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getPostTestDetailed: async (role: UserRole, filters: any = {}): Promise<any> => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      const response = await api.get<ApiResponse<any>>(`/${role}/api/reports/post-test-detailed?${params.toString()}`);
      return response.data.data || {};
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
};
