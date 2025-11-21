import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from './StatCard';
import DashboardHeader from './DashboardHeader';
import { cotizacionesService } from '../../services/cotizacionesService';
import { useAuth } from '../../contexts/AuthContext';

const ClienteDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    cotizaciones_solicitadas: 0,
    cotizaciones_pendientes: 0,
    cotizaciones_aprobadas: 0,
    total_invertido: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const countStats = await cotizacionesService.getStats('cliente');
        // Nota: Usamos limit alto para obtener el total real
        const response = await cotizacionesService.getCotizaciones('cliente', { estado: 'aprobada', limit: 1000 });
        const aprobadas = response.data || [];
        const totalInvertido = aprobadas.reduce((acc, curr) => acc + Number(curr.total), 0);

        setStats({
          cotizaciones_solicitadas: countStats.total,
          cotizaciones_pendientes: countStats.enviada,
          cotizaciones_aprobadas: countStats.aprobada,
          total_invertido: totalInvertido
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Mi Dashboard"
        subtitle="Resumen de tu actividad y cotizaciones"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Solicitadas"
          value={loading ? "..." : stats.cotizaciones_solicitadas.toString()}
          change="Total histórico"
          changeType="neutral"
          color="blue"
        />
        <StatCard
          title="Pendientes"
          value={loading ? "..." : stats.cotizaciones_pendientes.toString()}
          change="En revisión"
          changeType="neutral"
          color="yellow"
        />
        <StatCard
          title="Aprobadas"
          value={loading ? "..." : stats.cotizaciones_aprobadas.toString()}
          change="Listas para compra"
          changeType="positive"
          color="green"
        />
        <StatCard
          title="Total Invertido"
          value={loading ? "..." : `S/. ${stats.total_invertido.toLocaleString('es-PE', { minimumFractionDigits: 0 })}`}
          change="En aprobadas"
          changeType="neutral"
          color="purple"
        />
      </div>

      {/* Welcome Section */}
      <div className="bg-white dark:bg-background-dark rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            ¿Qué necesitas hoy?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-3xl">
            Explora nuestro catálogo de equipos de acero inoxidable para restaurantes y hoteles.
            Solicita cotizaciones fácilmente y recibe respuestas rápidas.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/cliente/catalogo"
              className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 text-primary rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors font-medium"
            >
              📦 Ver Catálogo
            </Link>
            <Link
              to="/cliente/cotizaciones/nueva"
              className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors font-medium"
            >
              💰 Nueva Cotización
            </Link>
            <Link
              to="/cliente/cotizaciones"
              className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              📋 Mis Cotizaciones
            </Link>
            <Link
              to="/cliente/perfil"
              className="flex items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors font-medium"
            >
              👤 Mi Perfil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClienteDashboard;