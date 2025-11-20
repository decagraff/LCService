import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, X, Minus, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import Button from '../common/Button';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { cart, subtotal, igv, total, updateQuantity, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClearCart = async () => {
    if (window.confirm('¿Estás seguro de que deseas limpiar el carrito?')) {
      try {
        await clearCart();
        showToast('Carrito limpiado', 'success');
      } catch (error) {
        showToast('Error al limpiar carrito', 'error');
      }
    }
  };

  const handleProceedToQuote = () => {
    if (cart.length === 0) {
      showToast('El carrito está vacío', 'warning');
      return;
    }
    onClose();
    navigate(`/${user?.role}/cotizaciones/nueva`);
  };

  const handleUpdateQuantity = async (equipoId: number, cantidad: number) => {
    try {
      await updateQuantity(equipoId, cantidad);
    } catch (error) {
      showToast('Error al actualizar cantidad', 'error');
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-background-dark shadow-2xl transition-transform duration-300 z-50 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Carrito de Cotización</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Cerrar carrito"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">El carrito está vacío</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Agrega productos para solicitar una cotización</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.equipo_id}
                  className="flex gap-3 p-3 bg-gray-50 dark:bg-background-dark-tertiary rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  {/* Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.imagen_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect width="60" height="60" fill="%23e2e8f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" fill="%2364748b"%3E' + encodeURIComponent(item.codigo) + '%3C/text%3E%3C/svg%3E'}
                      alt={item.nombre}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect width="60" height="60" fill="%23e2e8f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" fill="%2364748b"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                      {item.nombre}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Código: {item.codigo}
                    </div>
                    <div className="text-sm font-bold text-primary mb-2">
                      S/. {(item.precio_unitario || 0).toFixed(2)}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-white dark:bg-background-dark rounded border border-gray-300 dark:border-gray-600">
                        <button
                          onClick={() => handleUpdateQuantity(item.equipo_id, item.cantidad - 1)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <span className="px-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.equipo_id, item.cantidad + 1)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleUpdateQuantity(item.equipo_id, 0)}
                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        aria-label="Eliminar del carrito"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Subtotal:</span>
                <span>S/. {(subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>IGV (18%):</span>
                <span>S/. {(igv || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-gray-100 pt-2 border-t border-gray-200 dark:border-gray-700">
                <span>Total:</span>
                <span>S/. {(total || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleClearCart} className="flex-1">
                Limpiar
              </Button>
              <Button variant="primary" size="sm" onClick={handleProceedToQuote} className="flex-1">
                Cotizar
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;
