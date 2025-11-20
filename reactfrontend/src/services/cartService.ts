import api, { handleApiError } from './api';
import type { CartItem, ApiResponse, UserRole } from '../types';

export interface CartResponse {
  success: boolean;
  carrito: CartItem[];
}

export const cartService = {
  // Get cart
  getCart: async (role: UserRole): Promise<CartItem[]> => {
    try {
      const response = await api.get<CartResponse>(`/${role}/api/carrito`);
      if (response.data.success) {
        return response.data.carrito;
      }
      return [];
    } catch (error) {
      console.error('Error getting cart:', error);
      return [];
    }
  },

  // Add item to cart
  addToCart: async (role: UserRole, equipoId: number, cantidad: number = 1): Promise<CartItem[]> => {
    try {
      const response = await api.post<CartResponse>(`/${role}/api/carrito/agregar`, {
        equipoId,
        cantidad,
      });
      if (response.data.success) {
        return response.data.carrito;
      }
      throw new Error('Error al agregar al carrito');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update cart item quantity
  updateCartItem: async (role: UserRole, equipoId: number, cantidad: number): Promise<CartItem[]> => {
    try {
      const response = await api.put<CartResponse>(`/${role}/api/carrito/${equipoId}`, {
        cantidad,
      });
      if (response.data.success) {
        return response.data.carrito;
      }
      throw new Error('Error al actualizar carrito');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Clear cart
  clearCart: async (role: UserRole): Promise<void> => {
    try {
      const response = await api.delete<ApiResponse<void>>(`/${role}/api/carrito`);
      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al limpiar carrito');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Calculate cart totals
  calculateTotals: (items: CartItem[]) => {
    const subtotal = items.reduce((total, item) => total + (item.cantidad * item.precio_unitario), 0);
    const igv = subtotal * 0.18;
    const total = subtotal + igv;
    return { subtotal, igv, total };
  },

  // Get total items count
  getTotalItems: (items: CartItem[]): number => {
    return items.reduce((total, item) => total + item.cantidad, 0);
  },
};
