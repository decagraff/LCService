import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, CheckCircle, Calendar } from 'lucide-react';
import { cotizacionesService } from '../../services/cotizacionesService';
import { useAuth } from '../../contexts/AuthContext';
import type { Cotizacion } from '../../types';
import Sidebar from '../../components/dashboard/Sidebar';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import StatCard from '../../components/dashboard/StatCard';
import Loading from '../../components/common/Loading';

const VendedorReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState<Cotizacion[]>([]);
  const [stats, setStats] = useState({
    totalVendido: 0,
    cantidadVentas: 0,
    ticketPromedio: 0,
    mejorVenta: 0
  });

  useEffect(() => {
    const fetchReportData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        // Traemos SOLO las aprobadas (Ventas reales)
        const data = await cotizacionesService.getCotizaciones('vendedor', { estado: 'aprobada' });
        
        // Cálculos en frontend
        const total = data.reduce((acc, curr) => acc + Number(curr.total), 0);
        const count = data.length;
        const max = data.reduce((max, curr) => Math.max(max, Number(curr.total)), 0);
        const avg = count > 0 ? total / count : 0;

        setSales(data);
        setStats({
          totalVendido: total,
          cantidadVentas: count,
          ticketPromedio: avg,
          mejorVenta: max
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [user]);

  if (loading) return <Loading fullScreen message="Generando reporte..." />;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-background-dark-secondary">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 p-6 overflow-y-auto">
          <DashboardHeader title="Mis Reportes de Ventas" />

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Ventas Totales"
              value={`S/. ${stats.totalVendido.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
              icon={<DollarSign className="w-6 h-6 text-white" />}
              color="green"
              subtitle="Ingresos generados"
            />
            <StatCard
              title="Cotizaciones Cerradas"
              value={stats.cantidadVentas}
              icon={<CheckCircle className="w-6 h-6 text-white" />}
              color="blue"
              subtitle="Clientes convertidos"
            />
            <StatCard
              title="Ticket Promedio"
              value={`S/. ${stats.ticketPromedio.toLocaleString('es-PE', { minimumFractionDigits: 0 })}`}
              icon={<TrendingUp className="w-6 h-6 text-white" />}
              color="purple"
              subtitle="Promedio por venta"
            />
            <StatCard
              title="Mejor Venta"
              value={`S/. ${stats.mejorVenta.toLocaleString('es-PE', { minimumFractionDigits: 0 })}`}
              icon={<Calendar className="w-6 h-6 text-white" />} // Icono referencial
              color="yellow"
              subtitle="Máximo histórico"
            />
          </div>

          {/* Tabla de Desglose */}
          <div className="bg-white dark:bg-background-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Historial de Ventas Aprobadas</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-background-dark-tertiary text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-3">Fecha</th>
                    <th className="px-6 py-3">Cotización</th>
                    <th className="px-6 py-3">Cliente</th>
                    <th className="px-6 py-3 text-right">Monto Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(sale.created_at).toLocaleDateString('es-PE')}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                        {sale.numero_cotizacion}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{sale.cliente_nombre}</p>
                          <p className="text-xs text-gray-500">{sale.empresa_cliente}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-green-600 dark:text-green-400">
                        S/. {Number(sale.total).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {sales.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        Aún no tienes ventas aprobadas. ¡Sigue gestionando tus cotizaciones!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VendedorReportsPage;