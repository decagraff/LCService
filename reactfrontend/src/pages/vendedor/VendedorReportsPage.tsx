import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, CheckCircle, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cotizacionesService } from '../../services/cotizacionesService';
import { useAuth } from '../../contexts/AuthContext';
import type { Cotizacion } from '../../types';
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

  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchReportData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        // Solicitamos hasta 100 registros para tener estadísticas representativas
        const response = await cotizacionesService.getCotizaciones('vendedor', {
          estado: 'aprobada',
          limit: 100
        });

        const data = response.data || [];

        // Cálculos en frontend basados en la data recibida
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
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [user]);

  // Lógica de Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sales.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sales.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (loading) return <div className="flex justify-center py-20"><Loading message="Generando reporte..." /></div>;

  return (
    <div className="space-y-6">
      <DashboardHeader title="Mis Reportes de Ventas" subtitle="Análisis de rendimiento y ventas aprobadas" />

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
          icon={<Calendar className="w-6 h-6 text-white" />}
          color="yellow"
          subtitle="Máximo histórico"
        />
      </div>

      {/* Tabla de Desglose */}
      <div className="bg-white dark:bg-background-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Historial de Ventas Aprobadas</h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total: {sales.length} registros
          </div>
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
              {currentItems.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
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

        {/* Paginación */}
        {sales.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-background-dark-tertiary rounded-b-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, sales.length)} de {sales.length}
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="ml-2 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-background-dark text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-primary"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white dark:bg-background-dark border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    p = currentPage - 2 + i;
                    if (p > totalPages) p = totalPages - (4 - i);
                  }

                  return (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === p
                        ? 'bg-primary text-white'
                        : 'bg-white dark:bg-background-dark text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white dark:bg-background-dark border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendedorReportsPage;