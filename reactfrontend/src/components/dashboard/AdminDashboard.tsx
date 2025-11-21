import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, AlertTriangle, TrendingUp, Package, Settings } from 'lucide-react';
import StatCard from './StatCard';
import DashboardHeader from './DashboardHeader';
import { cotizacionesService } from '../../services/cotizacionesService';
import { userService } from '../../services/userService';
import { inventoryService } from '../../services/inventoryService';
import Loading from '../common/Loading';

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    ventas_totales: 0,
    usuarios_total: 0,
    cotizaciones_pendientes: 0,
    productos_bajo_stock: 0
  });

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);

        // Carga paralela de todos los servicios clave para un dashboard rápido
        const [cotizacionesStats, userStats, inventoryStats, reportKPIs] = await Promise.all([
          cotizacionesService.getStats('admin'),           // Estado de cotizaciones
          userService.getUserStats(),                      // Conteo de usuarios
          inventoryService.getInventoryStats(),            // Alertas de inventario
          cotizacionesService.getReportKPIs('admin')       // Datos financieros
        ]);

        setStats({
          ventas_totales: reportKPIs.totalVentas || 0,
          usuarios_total: userStats.total || 0,
          cotizaciones_pendientes: cotizacionesStats.enviada || 0,
          productos_bajo_stock: (inventoryStats.equipos_bajo_stock || 0) + (inventoryStats.equipos_sin_stock || 0)
        });

      } catch (error) {
        console.error('Error cargando datos del dashboard admin:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><Loading message="Cargando panel administrativo..." /></div>;
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Panel de Administración"
        subtitle="Visión general del rendimiento y operaciones"
      />

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Ingresos Totales"
          value={`S/. ${stats.ventas_totales.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          color="green"
          subtitle="Ventas aprobadas"
          changeType="positive"
        />
        <StatCard
          title="Usuarios Activos"
          value={stats.usuarios_total.toString()}
          icon={<Users className="w-6 h-6 text-white" />}
          color="blue"
          subtitle="Clientes y Vendedores"
          changeType="neutral"
        />
        <StatCard
          title="Pendientes"
          value={stats.cotizaciones_pendientes.toString()}
          icon={<FileText className="w-6 h-6 text-white" />}
          color="yellow"
          subtitle="Cotizaciones por revisar"
          changeType="neutral"
        />
        <StatCard
          title="Alertas Stock"
          value={stats.productos_bajo_stock.toString()}
          icon={<AlertTriangle className="w-6 h-6 text-white" />}
          color="red"
          subtitle="Productos críticos"
          changeType="negative"
        />
      </div>

      {/* Sección de Accesos Rápidos y Gestión */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Columna Izquierda: Operaciones Principales */}
        <div className="lg:col-span-2 bg-white dark:bg-background-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-gray-100">Gestión Operativa</h3>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/admin/cotizaciones" className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800 hover:shadow-md transition-all group">
              <div className="p-3 bg-blue-500 rounded-lg text-white mr-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100">Gestionar Cotizaciones</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Revisar y aprobar solicitudes</p>
              </div>
            </Link>

            <Link to="/admin/inventory" className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-800 hover:shadow-md transition-all group">
              <div className="p-3 bg-purple-500 rounded-lg text-white mr-4 group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100">Control de Inventario</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ajustar stock y precios</p>
              </div>
            </Link>

            <Link to="/admin/users" className="flex items-center p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-800 hover:shadow-md transition-all group">
              <div className="p-3 bg-orange-500 rounded-lg text-white mr-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100">Directorio de Usuarios</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Administrar roles y accesos</p>
              </div>
            </Link>

            <Link to="/admin/reportes" className="flex items-center p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-800 hover:shadow-md transition-all group">
              <div className="p-3 bg-green-600 rounded-lg text-white mr-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100">Reportes Financieros</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ver métricas y KPIs</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Columna Derecha: Resumen Rápido / Configuración */}
        <div className="space-y-6">
          {/* Estado del Sistema */}
          <div className="bg-white dark:bg-background-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Estado del Sistema</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Base de Datos</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">Conectado</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Versión API</span>
                <span className="text-sm font-mono">v1.0.0</span>
              </div>
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <Link to="/admin/configuracion">
                  <button className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    <Settings className="w-4 h-4" />
                    Ir a Configuración
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Banner Informativo */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg p-6 text-white">
            <h3 className="font-bold text-lg mb-2">¿Necesitas ayuda?</h3>
            <p className="text-blue-100 text-sm mb-4">
              Revisa la documentación técnica para gestionar los parámetros avanzados del sistema.
            </p>
            <button className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded transition-colors">
              Ver Documentación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;