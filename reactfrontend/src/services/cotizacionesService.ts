import api, { handleApiError } from './api';
import type { Cotizacion, CotizacionStats, CotizacionFilters, ApiResponse, UserRole } from '../types';

// Definimos la interfaz para los parámetros de creación
interface CreateCotizacionParams {
  notas?: string;
  cliente_id?: number;
  vendedor_id?: number;
}

export const cotizacionesService = {
  // Get all cotizaciones for user with filters
  getCotizaciones: async (role: UserRole, filters?: CotizacionFilters): Promise<Cotizacion[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.estado) params.append('estado', filters.estado);

      const response = await api.get<Cotizacion[]>(`/${role}/api/cotizaciones?${params.toString()}`);
      return response.data;
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
  // NOTA: Aquí cambiamos 'notas?: string' por 'params: CreateCotizacionParams'
  createCotizacion: async (role: UserRole, params: CreateCotizacionParams): Promise<Cotizacion> => {
    try {
      // Enviamos 'params' directamente. Como 'params' ya es un objeto { notas: "...", ... },
      // el backend recibirá req.body.notas correctamente como string.
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
  }
};
