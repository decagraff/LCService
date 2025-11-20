import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from './StatCard';
import DashboardHeader from './DashboardHeader';
import { userService } from '../../services/userService';
import { inventoryService } from '../../services/inventoryService';
import { cotizacionesService } from '../../services/cotizacionesService';
import { useToast } from '../../contexts/ToastContext';

const AdminDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_usuarios: 0,
    equipos_en_stock: 0,
    cotizaciones_activas: 0,
    ventas_totales: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Ejecutar llamadas en paralelo para eficiencia
        const [userStats, invStats, quoteStats, approvedQuotesResponse] = await Promise.all([
          userService.getUserStats(),
          inventoryService.getInventoryStats(),
          cotizacionesService.getStats('admin'),
          cotizacionesService.getCotizaciones('admin', { estado: 'aprobada', limit: 1000 })
        ]);

        // Calcular ventas totales sumando cotizaciones aprobadas
        // Note: getCotizaciones now returns { data: [], pagination: {} }
        const approvedQuotes = approvedQuotesResponse.data || [];
        const totalVentas = approvedQuotes.reduce((acc, curr) => acc + Number(curr.total), 0);

        setStats({
          total_usuarios: userStats.total,
          equipos_en_stock: invStats.total_stock,
          cotizaciones_activas: quoteStats.enviada + quoteStats.borrador, // Sumamos activas
          ventas_totales: totalVentas
        });

      } catch (error) {
        console.error('Error fetching admin stats:', error);
        showToast('Error al cargar estadísticas', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showToast]);

  return (
    <div className="flex-1 p-5 bg-gray-50 dark:bg-background-dark-secondary">
      <DashboardHeader title="Dashboard Administrativo" />

      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Usuarios"
            value={loading ? "..." : stats.total_usuarios.toString()}
            change="Registrados"
            changeType="neutral"
          />
          <StatCard
            title="Stock Total"
            value={loading ? "..." : stats.equipos_en_stock.toString()}
            change="Unidades disponibles"
            changeType="neutral"
          />
          <StatCard
            title="Cotizaciones Activas"
            value={loading ? "..." : stats.cotizaciones_activas.toString()}
            change="Borrador + Enviadas"
            changeType="neutral"
          />
          <StatCard
            title="Ventas Totales"
            value={loading ? "..." : `S/. ${stats.ventas_totales.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
            change="Acumulado Histórico"
            changeType="positive"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-background-dark rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Acciones Rápidas
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/users"
              className="bg-primary hover:bg-blue-700 text-white text-center py-5 px-6 rounded-lg
                         transition-colors font-medium"
            >
              👥 Gestionar Usuarios
            </Link>
            <Link
              to="/admin/equipment/new"
              className="bg-primary hover:bg-blue-700 text-white text-center py-5 px-6 rounded-lg
                         transition-colors font-medium"
            >
              📦 Agregar Equipo
            </Link>
            <Link
              to="/admin/reportes"
              className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600
                         text-white text-center py-5 px-6 rounded-lg transition-colors font-medium"
            >
              📈 Ver Reportes
            </Link>
            <Link
              to="/admin/configuracion"
              className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600
                         text-white text-center py-5 px-6 rounded-lg transition-colors font-medium"
            >
              ⚙️ Configuración
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
