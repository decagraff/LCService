import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from './StatCard';
import DashboardHeader from './DashboardHeader';
import { cotizacionesService } from '../../services/cotizacionesService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const VendedorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    mis_cotizaciones: 0,
    ventas_cerradas_count: 0,
    pendientes_count: 0,
    total_ventas_valor: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        // 1. Obtener estadísticas generales
        const countStats = await cotizacionesService.getStats('vendedor');

        // 2. Obtener cotizaciones aprobadas para calcular el valor monetario
        // FIX: Accedemos a .data del objeto paginado
        const response = await cotizacionesService.getCotizaciones('vendedor', { estado: 'aprobada', limit: 1000 });
        const aprobadas = response.data || [];

        const totalVentas = aprobadas.reduce((acc, curr) => acc + Number(curr.total), 0);

        setStats({
          mis_cotizaciones: countStats.total,
          ventas_cerradas_count: countStats.aprobada,
          pendientes_count: countStats.enviada,
          total_ventas_valor: totalVentas
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Sin toast para evitar spam en carga inicial
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  return (
    <div className="flex-1 p-5 bg-gray-50 dark:bg-background-dark-secondary">
      <DashboardHeader title="Dashboard de Ventas" />

      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Mis Cotizaciones"
            value={loading ? "..." : stats.mis_cotizaciones.toString()}
            change="Asignadas"
            changeType="positive"
          />
          <StatCard
            title="Ventas Cerradas"
            value={loading ? "..." : stats.ventas_cerradas_count.toString()}
            change="Aprobadas"
            changeType="positive"
          />
          <StatCard
            title="Pendientes"
            value={loading ? "..." : stats.pendientes_count.toString()}
            change="En seguimiento"
            changeType="neutral"
          />
          <StatCard
            title="Ventas Totales"
            value={loading ? "..." : `S/. ${stats.total_ventas_valor.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
            change="Valor total acumulado"
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
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/vendedor/cotizaciones/nueva"
              className="bg-primary hover:bg-blue-700 text-white text-center py-5 px-6 rounded-lg
                         transition-colors font-medium"
            >
              💰 Nueva Cotización
            </Link>
            <Link
              to="/vendedor/catalogo"
              className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600
                         text-white text-center py-5 px-6 rounded-lg transition-colors font-medium"
            >
              📦 Consultar Catálogo
            </Link>
            <Link
              to="/vendedor/cotizaciones"
              className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600
                         text-white text-center py-5 px-6 rounded-lg transition-colors font-medium"
            >
              📋 Mis Cotizaciones
            </Link>
            <Link
              to="/vendedor/inventario"
              className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600
                         text-white text-center py-5 px-6 rounded-lg transition-colors font-medium"
            >
              📦 Consultar Stock
            </Link>
            <Link
              to="/vendedor/reportes"
              className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600
                         text-white text-center py-5 px-6 rounded-lg transition-colors font-medium"
            >
              📈 Mis Estadísticas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendedorDashboard;