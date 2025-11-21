import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Send, User, Search, Plus, Trash2, Minus, Package, FileText, CreditCard, AlertCircle } from 'lucide-react';
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
  const searchRef = useRef<HTMLDivElement>(null);

  // Estados del formulario
  const [notas, setNotas] = useState('');
  const [selectedClienteId, setSelectedClienteId] = useState<string>('');
  const [selectedVendedorId, setSelectedVendedorId] = useState<string>('');

  // Datos para selectores
  const [clientes, setClientes] = useState<UserType[]>([]);
  const [vendedores, setVendedores] = useState<UserType[]>([]);

  // Búsqueda rápida
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Equipo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // UI States
  const [loading, setLoading] = useState(false);
  const [, setLoadingData] = useState(false);

  const isAdminOrVendor = user?.role === 'admin' || user?.role === 'vendedor';

  // Cerrar resultados al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cargar usuarios si es Admin/Vendedor
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
        // No mostramos error toast al inicio para no saturar
      } finally {
        setLoadingData(false);
      }
    };
    fetchUsers();
  }, [user]);

  // Lógica de búsqueda en tiempo real
  useEffect(() => {
    const searchProducts = async () => {
      if (!searchTerm.trim() || searchTerm.length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      try {
        setIsSearching(true);
        setShowResults(true);
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
      // No limpiamos el término para permitir agregar varios, pero cerramos si se desea
      // setSearchTerm(''); 
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
      showToast('No puedes crear una cotización vacía', 'error');
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

  // Vista de carrito vacío para clientes (autoservicio)
  if (!isAdminOrVendor && cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center bg-white dark:bg-background-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-full mb-6">
          <ShoppingCart className="w-16 h-16 text-blue-400 dark:text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Tu carrito está vacío
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
          Para generar una cotización, primero debes explorar nuestro catálogo y agregar los equipos que necesitas.
        </p>
        <Button onClick={() => navigate(`/${user?.role}/catalogo`)} size="lg" className="px-8 shadow-lg shadow-blue-500/20">
          Ir al Catálogo
        </Button>
      </div>
    );
  }

  const clienteOptions = clientes.map(c => ({
    value: c.id,
    label: `${c.nombre} ${c.apellido || ''} ${c.empresa ? `— ${c.empresa}` : ''}`
  }));

  const vendedorOptions = vendedores.map(v => ({
    value: v.id,
    label: `${v.nombre} ${v.apellido || ''}`
  }));

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Nueva Cotización"
        subtitle="Revisa los ítems y genera tu solicitud"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* COLUMNA IZQUIERDA: Formulario y Productos */}
        <div className="lg:col-span-2 space-y-6">

          {/* Sección 1: Datos del Cliente */}
          <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-background-dark-tertiary/30">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Información del Cliente
              </h2>
            </div>

            <div className="p-6">
              {isAdminOrVendor ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Select
                      label="Cliente *"
                      options={clienteOptions}
                      value={selectedClienteId}
                      onChange={(e) => setSelectedClienteId(e.target.value)}
                      placeholder="Seleccionar cliente..."
                      fullWidth
                    />
                  </div>
                  {user?.role === 'admin' && (
                    <div>
                      <Select
                        label="Vendedor Asignado (Opcional)"
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
                <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div className="h-10 w-10 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold">
                    {user?.nombre.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user?.nombre} {user?.apellido}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.empresa || 'Cliente Particular'} • {user?.email}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sección 2: Agregar Productos (Solo Admin/Vendedor) */}
          {isAdminOrVendor && (
            <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-visible z-20 relative">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-background-dark-tertiary/30">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" />
                  Agregar Productos Rápidamente
                </h2>
              </div>

              <div className="p-6" ref={searchRef}>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Buscar por nombre, código o categoría..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      if (e.target.value.length >= 2) setShowResults(true);
                    }}
                    onFocus={() => {
                      if (searchTerm.length >= 2) setShowResults(true);
                    }}
                    fullWidth
                    autoComplete="off"
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loading size="sm" />
                    </div>
                  )}
                </div>

                {/* Resultados de búsqueda flotantes */}
                {showResults && (
                  <div className="absolute left-0 right-0 top-full mt-2 mx-6 bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-600 rounded-xl shadow-2xl z-50 max-h-[350px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700 ring-1 ring-black ring-opacity-5">
                    {searchResults.length > 0 ? (
                      searchResults.map((equipo) => (
                        <div
                          key={equipo.id}
                          onClick={() => handleQuickAdd(equipo)}
                          className="flex items-center justify-between p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                              {equipo.imagen_url ? (
                                <img
                                  src={equipo.imagen_url}
                                  className="w-full h-full object-cover rounded-lg"
                                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                                />
                              ) : (
                                <Package className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{equipo.nombre}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-2">
                                <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">{equipo.codigo}</span>
                                <span className={equipo.stock > 0 ? "text-green-600" : "text-red-500"}>
                                  Stock: {equipo.stock}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 pl-2">
                            <span className="text-sm font-bold text-primary whitespace-nowrap">S/. {Number(equipo.precio).toFixed(2)}</span>
                            <Button size="sm" variant="secondary" className="h-8 w-8 p-0 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      !isSearching && (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          No se encontraron productos.
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sección 3: Lista de Ítems */}
          <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-background-dark-tertiary/30 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                Detalle de la Cotización
              </h2>
              <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400">
                {cart.length} ítems
              </span>
            </div>

            <div className="p-6">
              {cart.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/30">
                  <p className="text-gray-500">No hay productos agregados actualmente</p>
                  {isAdminOrVendor && <p className="text-xs text-gray-400 mt-1">Usa el buscador de arriba para agregar ítems</p>}
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.equipo_id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 bg-white dark:bg-background-dark-tertiary/20 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:border-primary/30 transition-colors shadow-sm">
                      {/* Imagen e Info */}
                      <div className="flex items-center gap-4 flex-1 w-full">
                        <div className="w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0">
                          {item.imagen_url ? (
                            <img src={item.imagen_url} className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                          ) : (
                            <Package className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate" title={item.nombre}>{item.nombre}</h4>
                          <p className="text-xs text-gray-500 font-mono">{item.codigo}</p>
                          <p className="text-xs text-primary font-medium sm:hidden mt-1">S/. {item.precio_unitario.toFixed(2)} c/u</p>
                        </div>
                      </div>

                      {/* Controles y Precio */}
                      <div className="flex items-center justify-between w-full sm:w-auto gap-4 pl-16 sm:pl-0">
                        <div className="text-right min-w-[80px] sm:order-2">
                          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            S/. {(item.cantidad * item.precio_unitario).toFixed(2)}
                          </p>
                          <p className="text-[10px] text-gray-400 hidden sm:block">unit: {item.precio_unitario.toFixed(2)}</p>
                        </div>

                        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg h-8 sm:order-1">
                          <button
                            onClick={() => updateQuantity(item.equipo_id, item.cantidad - 1)}
                            className="px-2 hover:bg-gray-200 dark:hover:bg-gray-700 h-full flex items-center text-gray-500 transition-colors rounded-l-lg"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-gray-900 dark:text-gray-100">{item.cantidad}</span>
                          <button
                            onClick={() => updateQuantity(item.equipo_id, item.cantidad + 1)}
                            className="px-2 hover:bg-gray-200 dark:hover:bg-gray-700 h-full flex items-center text-gray-500 transition-colors rounded-r-lg"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.equipo_id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg sm:order-3"
                          title="Eliminar ítem"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* COLUMNA DERECHA: Resumen y Acciones */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">

            {/* Card de Resumen */}
            <div className="bg-white dark:bg-background-dark rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-background-dark-tertiary/30">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Resumen de Costos
                </h3>
              </div>

              <div className="p-6">
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>S/. {subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>IGV (18%)</span>
                    <span>S/. {igv.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between items-end">
                    <span className="font-bold text-gray-900 dark:text-gray-100 text-base">Total Estimado</span>
                    <span className="font-bold text-2xl text-primary">
                      S/. {total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Notas / Observaciones
                  </label>
                  <textarea
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-background-dark-tertiary focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder="Instrucciones especiales, condiciones de entrega..."
                  />
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleSubmit}
                    variant="primary"
                    fullWidth
                    size="lg"
                    disabled={loading || cart.length === 0}
                    className="shadow-lg shadow-blue-500/20 h-12"
                  >
                    {loading ? <Loading size="sm" /> : (
                      <div className="flex items-center justify-center gap-2 font-bold">
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
                    Seguir Comprando
                  </Button>
                </div>
              </div>
            </div>

            {/* Info Box */}
            {!isAdminOrVendor && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                  <p className="font-bold mb-1">Proceso de Cotización</p>
                  <p>Tu solicitud será enviada a un vendedor para su revisión y aprobación. Recibirás una notificación cuando el estado cambie.</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default NewQuotePage;