import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Filter, Search, ShoppingCart, Eye, Trash2, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { cotizacionesService } from '../services/cotizacionesService';
import type { Cotizacion, CotizacionStats, CotizacionFilters, CotizacionEstado } from '../types';
import Sidebar from '../components/dashboard/Sidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import StatCard from '../components/dashboard/StatCard';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';

const CotizacionesPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [stats, setStats] = useState<CotizacionStats>({
    total: 0,
    borrador: 0,
    enviada: 0,
    aprobada: 0,
    rechazada: 0,
    vencida: 0
  });
  const [filters, setFilters] = useState<CotizacionFilters>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, filters]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [cotizacionesData, statsData] = await Promise.all([
        cotizacionesService.getCotizaciones(user.role, filters),
        cotizacionesService.getStats(user.role)
      ]);

      setCotizaciones(cotizacionesData);
      setStats(statsData);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Error al cargar cotizaciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof CotizacionFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleFilterByStatus = (estado: CotizacionEstado) => {
    setFilters({ estado });
  };

  const handleDelete = async (id: number) => {
    if (!user) return;
    if (!confirm('¿Estás seguro de eliminar esta cotización?')) return;

    try {
      await cotizacionesService.deleteCotizacion(user.role, id);
      showToast('Cotización eliminada correctamente', 'success');
      loadData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Error al eliminar cotización', 'error');
    }
  };

  const getStatusBadge = (estado: CotizacionEstado) => {
    const badges: Record<CotizacionEstado, { icon: React.ReactNode; className: string; label: string }> = {
      borrador: {
        icon: <AlertCircle className="w-4 h-4" />,
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        label: 'Borrador'
      },
      enviada: {
        icon: <Clock className="w-4 h-4" />,
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        label: 'Enviada'
      },
      aprobada: {
        icon: <CheckCircle className="w-4 h-4" />,
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        label: 'Aprobada'
      },
      rechazada: {
        icon: <XCircle className="w-4 h-4" />,
        className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        label: 'Rechazada'
      },
      vencida: {
        icon: <XCircle className="w-4 h-4" />,
        className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        label: 'Vencida'
      }
    };

    const badge = badges[estado];
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.className}`}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  const isExpired = (fechaVencimiento?: string) => {
    if (!fechaVencimiento) return false;
    return new Date(fechaVencimiento) < new Date();
  };

  if (loading && cotizaciones.length === 0) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-background-dark-secondary">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loading message="Cargando cotizaciones..." />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-background-dark-secondary">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 p-6 overflow-y-auto">
          <DashboardHeader title="Mis Cotizaciones" />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Cotizaciones"
              value={stats.total.toString()}
              subtitle="Solicitadas"
              icon={<FileText className="w-6 h-6" />}
              color="blue"
            />
            <StatCard
              title="En Proceso"
              value={stats.enviada.toString()}
              subtitle="Pendientes"
              icon={<Clock className="w-6 h-6" />}
              color="yellow"
            />
            <StatCard
              title="Aprobadas"
              value={stats.aprobada.toString()}
              subtitle="Listas"
              icon={<CheckCircle className="w-6 h-6" />}
              color="green"
            />
            <StatCard
              title="Borradores"
              value={stats.borrador.toString()}
              subtitle="Por enviar"
              icon={<AlertCircle className="w-6 h-6" />}
              color="gray"
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-background-dark rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to={`/${user?.role}/catalogo`}>
                <Button variant="primary" size="lg" className="w-full">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Ver Catálogo
                </Button>
              </Link>
              <Link to={`/${user?.role}/cotizaciones/nueva`}>
                <Button variant="primary" size="lg" className="w-full">
                  <FileText className="w-5 h-5 mr-2" />
                  Nueva Cotización
                </Button>
              </Link>
              <Button variant="secondary" size="lg" onClick={() => handleFilterByStatus('enviada')} className="w-full">
                <Clock className="w-5 h-5 mr-2" />
                Ver Pendientes
              </Button>
              <Button variant="secondary" size="lg" onClick={() => handleFilterByStatus('aprobada')} className="w-full">
                <CheckCircle className="w-5 h-5 mr-2" />
                Ver Aprobadas
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-background-dark rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtrar Cotizaciones
            </h2>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Número de cotización..."
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-background-dark-tertiary text-gray-900 dark:text-gray-100
                             focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado
                </label>
                <select
                  value={filters.estado || ''}
                  onChange={(e) => handleFilterChange('estado', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-background-dark-tertiary text-gray-900 dark:text-gray-100
                           focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Todos los estados</option>
                  <option value="borrador">Borrador</option>
                  <option value="enviada">Enviada</option>
                  <option value="aprobada">Aprobada</option>
                  <option value="rechazada">Rechazada</option>
                  <option value="vencida">Vencida</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="md" onClick={handleClearFilters}>
                  Limpiar
                </Button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-background-dark rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Mis Cotizaciones ({cotizaciones.length})
              </h2>
              <Link to={`/${user?.role}/catalogo`}>
                <Button variant="primary" size="sm">
                  <FileText className="w-4 h-4 mr-1" />
                  Nueva Cotización
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="p-12 flex justify-center">
                <Loading message="Cargando..." />
              </div>
            ) : cotizaciones.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-background-dark-tertiary">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Cotización
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Vendedor Asignado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Vencimiento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {cotizaciones.map((cotizacion) => (
                      <tr key={cotizacion.id} className="hover:bg-gray-50 dark:hover:bg-background-dark-tertiary transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {cotizacion.numero_cotizacion}
                          </div>
                          {cotizacion.empresa_cliente && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {cotizacion.empresa_cliente}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          {cotizacion.vendedor_nombre || (
                            <span className="text-gray-400 dark:text-gray-500">Sin asignar</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-primary">
                            S/. {Number(cotizacion.total || 0).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(cotizacion.estado)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          {new Date(cotizacion.created_at).toLocaleDateString('es-PE')}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {cotizacion.fecha_vencimiento ? (
                            <span className={isExpired(cotizacion.fecha_vencimiento) ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-700 dark:text-gray-300'}>
                              {new Date(cotizacion.fecha_vencimiento).toLocaleDateString('es-PE')}
                            </span>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link to={`/${user?.role}/cotizaciones/${cotizacion.id}`}>
                              <button className="p-2 text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                      title="Ver detalles">
                                <Eye className="w-4 h-4" />
                              </button>
                            </Link>
                            {cotizacion.estado === 'borrador' && (
                              <button
                                onClick={() => handleDelete(cotizacion.id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No hay cotizaciones
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {filters.search || filters.estado
                    ? 'No se encontraron cotizaciones con los filtros aplicados'
                    : 'Aún no has creado ninguna cotización'}
                </p>
                <Link to={`/${user?.role}/catalogo`}>
                  <Button variant="primary">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Ver Catálogo
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CotizacionesPage;
