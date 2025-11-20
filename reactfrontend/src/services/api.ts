import axios, { type AxiosError } from 'axios';
import type { ApiResponse } from '../types';

// Detectar si estamos en producción o desarrollo
const getBaseURL = (): string => {
  // En producción, usar la URL permitida
  if (import.meta.env.PROD) {
    return 'https://lc-service.decatron.net';
  }
  // En desarrollo, usar localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:3005';
};

// Crear instancia de axios
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Para enviar cookies de sesión
});

// Interceptor de respuestas para manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.log('Unauthorized request - user needs to login');
    }
    return Promise.reject(error);
  }
);

// Helper para manejar errores de API
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiResponse<unknown>;
    return apiError?.error || apiError?.message || 'Error al procesar la solicitud';
  }
  return 'Error inesperado';
};

export default api;
