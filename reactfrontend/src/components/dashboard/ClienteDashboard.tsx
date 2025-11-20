import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from './StatCard';
import DashboardHeader from './DashboardHeader';
import { cotizacionesService } from '../../services/cotizacionesService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const ClienteDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
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
        // 1. Obtener contadores de estado
        const countStats = await cotizacionesService.getStats('cliente');

        // 2. Obtener cotizaciones aprobadas (FIX: Desestructurar response.data)
        const response = await cotizacionesService.getCotizaciones('cliente', { estado: 'aprobada' });
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
        // No mostramos toast para evitar ruido en la carga inicial si falla algo menor
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  return (
    <div className="flex-1 p-5 bg-gray-50 dark:bg-background-dark-secondary">
      <DashboardHeader title="Mi Dashboard" />

      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Cotizaciones Solicitadas"
            value={loading ? "..." : stats.cotizaciones_solicitadas.toString()}
            change="En total"
            changeType="neutral"
          />
          <StatCard
            title="Pendientes de Respuesta"
            value={loading ? "..." : stats.cotizaciones_pendientes.toString()}
            change="En proceso"
            changeType="warning"
          />
          <StatCard
            title="Aprobadas"
            value={loading ? "..." : stats.cotizaciones_aprobadas.toString()}
            change="Listas para compra"
            changeType="positive"
          />
          <StatCard
            title="Total Invertido"
            value={loading ? "..." : `S/. ${stats.total_invertido.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
            change="En aprobadas"
            changeType="neutral"
          />
        </div>

        {/* Welcome Section */}
        <div className="bg-white dark:bg-background-dark rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              ¿Qué necesitas hoy?
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="bg-gray-50 dark:bg-background-dark-secondary rounded-lg p-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                🍽️ Equipos de Cocina Industrial
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Explora nuestro catálogo de equipos de acero inoxidable para restaurantes, hoteles y cocinas industriales.
                Solicita cotizaciones fácilmente y recibe respuestas rápidas de nuestros vendedores.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/cliente/catalogo"
                className="bg-primary hover:bg-blue-700 text-white text-center py-5 px-6 rounded-lg transition-colors font-medium"
              >
                📦 Ver Catálogo
              </Link>
              <Link
                to="/cliente/cotizaciones/nueva"
                className="bg-primary hover:bg-blue-700 text-white text-center py-5 px-6 rounded-lg transition-colors font-medium"
              >
                💰 Nueva Cotización
              </Link>
              <Link
                to="/cliente/cotizaciones"
                className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white text-center py-5 px-6 rounded-lg transition-colors font-medium"
              >
                📋 Mis Cotizaciones
              </Link>
              <Link
                to="/cliente/perfil"
                className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white text-center py-5 px-6 rounded-lg transition-colors font-medium"
              >
                👤 Mi Perfil
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Quotes Link */}
        <div className="bg-white dark:bg-background-dark rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Mis Últimas Cotizaciones
            </h2>
            <Link
              to="/cliente/cotizaciones"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary font-medium transition-colors"
            >
              Ver todas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClienteDashboard;