import React, { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';
import type { CartItem } from '../types';

interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  cartCount: number;
  subtotal: number;
  igv: number;
  total: number;
  addToCart: (equipoId: number, cantidad?: number) => Promise<void>;
  updateQuantity: (equipoId: number, cantidad: number) => Promise<void>;
  removeFromCart: (equipoId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Calculate cart totals
  const cartCount = cart.reduce((total, item) => total + item.cantidad, 0);
  const subtotal = cart.reduce((total, item) => total + item.cantidad * item.precio_unitario, 0);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart([]);
      return;
    }

    try {
      setLoading(true);
      const cartItems = await cartService.getCart(user.role);
      setCart(cartItems);
    } catch (error) {
      console.error('Error refreshing cart:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (equipoId: number, cantidad: number = 1) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      setLoading(true);
      const updatedCart = await cartService.addToCart(user.role, equipoId, cantidad);
      setCart(updatedCart);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (equipoId: number, cantidad: number) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      setLoading(true);
      const updatedCart = await cartService.updateCartItem(user.role, equipoId, cantidad);
      setCart(updatedCart);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (equipoId: number) => {
    await updateQuantity(equipoId, 0);
  };

  const clearCart = async () => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      setLoading(true);
      await cartService.clearCart(user.role);
      setCart([]);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: CartContextType = {
    cart,
    loading,
    cartCount,
    subtotal,
    igv,
    total,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
