import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Send, User, Search, Plus, Trash2, Minus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { cotizacionesService } from '../services/cotizacionesService';
import { userService } from '../services/userService';
import { catalogService } from '../services/catalogService';
import type { User as UserType, Equipo } from '../types';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import Select from '../components/common/Select';
import Input from '../components/common/Input';

const NewQuotePage: React.FC = () => {
  const { user } = useAuth();
  const { cart, subtotal, igv, total, clearCart, addToCart, updateQuantity, removeFromCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Estados del formulario
  const [notas, setNotas] = useState('');
  const [selectedClienteId, setSelectedClienteId] = useState<string>('');
  const [selectedVendedorId, setSelectedVendedorId] = useState<string>('');

  // Datos para selectores y búsqueda
  const [clientes, setClientes] = useState<UserType[]>([]);
  const [vendedores, setVendedores] = useState<UserType[]>([]);

  // Búsqueda de productos
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Equipo[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const isAdminOrVendor = user?.role === 'admin' || user?.role === 'vendedor';

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || user.role === 'cliente') return;

      try {
        setLoadingData(true);
        const allUsers = await userService.getAllUsers();
        setClientes(allUsers.filter(u => u.role === 'cliente'));
        setVendedores(allUsers.filter(u => u.role === 'vendedor'));
      } catch (error) {
        console.error('Error loading users:', error);
        showToast('No se pudo cargar la lista de usuarios', 'error');
      } finally {
        setLoadingData(false);
      }
    };
    fetchUsers();
  }, [user, showToast]);

  useEffect(() => {
    const searchProducts = async () => {
      if (!searchTerm.trim() || searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setIsSearching(true);
        const results = await catalogService.quickSearch(searchTerm);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching products:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchProducts, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleQuickAdd = async (equipo: Equipo) => {
    try {
      await addToCart(equipo.id, 1);
      showToast(`${equipo.nombre} agregado`, 'success');
      setSearchTerm('');
      setSearchResults([]);
    } catch (error) {
      showToast('Error al agregar producto', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (isAdminOrVendor && !selectedClienteId) {
      showToast('Debes seleccionar un cliente obligatoriamente', 'warning');
      return;
    }

    if (cart.length === 0) {
      showToast('No puedes crear una cotización vacía. Agrega productos.', 'error');
      return;
    }

    try {
      setLoading(true);

      const params = {
        notas,
        cliente_id: selectedClienteId ? parseInt(selectedClienteId) : undefined,
        vendedor_id: selectedVendedorId ? parseInt(selectedVendedorId) : undefined
      };

      const cotizacion = await cotizacionesService.createCotizacion(user.role, params);

      await clearCart();
      showToast(`Cotización ${cotizacion.numero_cotizacion} generada con éxito`, 'success');
      navigate(`/${user.role}/cotizaciones/${cotizacion.id}`);

    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Error al crear cotización', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) return <Loading fullScreen message="Cargando datos..." />;

  if (!isAdminOrVendor && cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <ShoppingCart className="w-20 h-20 text-gray-300 dark:text-gray-600 mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Tu carrito está vacío
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md text-center">
          Para solicitar una cotización, primero debes agregar productos desde nuestro catálogo.
        </p>
        <Button onClick={() => navigate(`/${user?.role}/catalogo`)} size="lg">
          Ir al Catálogo
        </Button>
      </div>
    );
  }

  const clienteOptions = clientes.map(c => ({
    value: c.id,
    label: `${c.nombre} ${c.apellido || ''} ${c.empresa ? `(${c.empresa})` : ''}`
  }));

  const vendedorOptions = vendedores.map(v => ({
    value: v.id,
    label: `${v.nombre} ${v.apellido || ''}`
  }));

  return (
    <div className="space-y-6">
      <DashboardHeader title="Nueva Cotización" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* COLUMNA IZQUIERDA */}
        <div className="lg:col-span-2 space-y-6">

          {/* Datos del Cliente */}
          <div className="bg-white dark:bg-background-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <User className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Datos del Cliente</h2>
            </div>

            {isAdminOrVendor ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cliente *
                  </label>
                  <Select
                    options={clienteOptions}
                    value={selectedClienteId}
                    onChange={(e) => setSelectedClienteId(e.target.value)}
                    placeholder="Seleccionar cliente..."
                    fullWidth
                  />
                </div>
                {user?.role === 'admin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Vendedor (Opcional)
                    </label>
                    <Select
                      options={vendedorOptions}
                      value={selectedVendedorId}
                      onChange={(e) => setSelectedVendedorId(e.target.value)}
                      placeholder="Asignación automática"
                      fullWidth
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-background-dark-tertiary rounded-lg border border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Solicitando como: <strong className="text-gray-900 dark:text-gray-100">{user?.nombre} {user?.apellido}</strong>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Empresa: {user?.empresa || 'Particular'}
                </p>
              </div>
            )}
          </div>

          {/* Buscador Rápido */}
          {isAdminOrVendor && (
            <div className="bg-white dark:bg-background-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Search className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Agregar Productos</h2>
              </div>

              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar por nombre o código (ej: Mesa, MT-120)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  fullWidth
                  autoComplete="off"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loading size="sm" />
                  </div>
                )}
              </div>

              {/* Resultados */}
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                  {searchResults.map((equipo) => (
                    <div
                      key={equipo.id}
                      onClick={() => handleQuickAdd(equipo)}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={equipo.imagen_url}
                          className="w-10 h-10 object-cover rounded bg-gray-200"
                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{equipo.nombre}</p>
                          <p className="text-xs text-gray-500">{equipo.codigo} • Stock: {equipo.stock}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-primary">S/. {equipo.precio}</span>
                        <Button size="sm" variant="secondary" className="h-8 w-8 p-0 flex items-center justify-center">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Lista de Productos */}
          <div className="bg-white dark:bg-background-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex justify-between items-center">
              <span>Detalle de Productos</span>
              <span className="text-sm font-normal text-gray-500">{cart.length} ítems</span>
            </h3>

            {cart.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No hay productos agregados</p>
                {isAdminOrVendor && <p className="text-xs text-gray-400">Usa el buscador de arriba para agregar</p>}
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.equipo_id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-background-dark-tertiary rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">{item.nombre}</h4>
                        <span className="font-bold text-primary text-sm">S/. {(item.cantidad * item.precio_unitario).toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-gray-500 mb-2">Unit: S/. {item.precio_unitario.toFixed(2)}</div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-white dark:bg-background-dark rounded border border-gray-300 dark:border-gray-600 h-8">
                          <button
                            onClick={() => updateQuantity(item.equipo_id, item.cantidad - 1)}
                            className="px-2 hover:bg-gray-100 dark:hover:bg-gray-700 h-full flex items-center"
                            type="button"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-sm font-medium w-8 text-center">{item.cantidad}</span>
                          <button
                            onClick={() => updateQuantity(item.equipo_id, item.cantidad + 1)}
                            className="px-2 hover:bg-gray-100 dark:hover:bg-gray-700 h-full flex items-center"
                            type="button"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.equipo_id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Eliminar"
                          type="button"
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
        </div>

        {/* COLUMNA DERECHA */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-background-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Resumen</h3>

            <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>S/. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>IGV (18%)</span>
                <span>S/. {igv.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-gray-100 pt-2">
                <span>Total</span>
                <span className="text-primary">S/. {total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notas (Opcional)
              </label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark-tertiary text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Instrucciones especiales..."
              />
            </div>

            <Button
              onClick={handleSubmit}
              variant="primary"
              fullWidth
              size="lg"
              disabled={loading || cart.length === 0}
              className="mb-3"
            >
              {loading ? <Loading size="sm" /> : (
                <div className="flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  {isAdminOrVendor ? 'Generar Cotización' : 'Solicitar Cotización'}
                </div>
              )}
            </Button>

            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => navigate(`/${user?.role}/catalogo`)}
            >
              Cancelar
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NewQuotePage;