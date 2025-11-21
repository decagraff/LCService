import React, { useState, useEffect } from 'react';
import { PieChart, Activity, RefreshCw, TrendingUp, CheckCircle, DollarSign, ShoppingBag } from 'lucide-react';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import StatCard from '../../components/dashboard/StatCard';
import ThesisCharts from '../../components/reports/ThesisCharts';
import AdvancedFilters, { type ReportFilters } from '../../components/reports/AdvancedFilters';
import { cotizacionesService } from '../../services/cotizacionesService';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { useToast } from '../../contexts/ToastContext';

const ReportsPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'commercial' | 'thesis'>('commercial');
    const [filters, setFilters] = useState<ReportFilters>({ groupBy: 'month' });
    const { showToast } = useToast();

    // Estados de Datos
    const [kpis, setKpis] = useState<any>(null);
    const [thesisData, setThesisData] = useState<any>(null);
    const [salesData, setSalesData] = useState<any[]>([]);
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [statusData, setStatusData] = useState<any[]>([]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Datos para la Tesis (Pre vs Post) - Siempre se cargan para tenerlos disponibles o por si se cambia de tab
            if (viewMode === 'thesis' || !thesisData) {
                const tData = await cotizacionesService.getThesisKPIs('admin');
                setThesisData(tData);
            }

            // 2. Datos Comerciales (Dependen de los filtros)
            if (viewMode === 'commercial') {
                // Usamos el nuevo endpoint getFilteredReportKPIs que conecta con getKPIs en backend
                const kpisData = await cotizacionesService.getFilteredReportKPIs('admin', filters);
                setKpis(kpisData);

                const [sales, cats, status] = await Promise.all([
                    cotizacionesService.getFilteredSalesByPeriod('admin', filters),
                    cotizacionesService.getSalesByCategory('admin', filters), // Asegúrate de añadir este método al service si no está
                    cotizacionesService.getReportSalesStatus('admin')
                ]);
                setSalesData(sales);
                setCategoryData(cats);
                setStatusData(status);
            }

        } catch (error) {
            console.error('Error loading report data:', error);
            showToast('Error cargando reportes', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [viewMode, filters]);

    return (
        <div className="space-y-6">
            <DashboardHeader
                title={viewMode === 'commercial' ? "Gestión Comercial" : "Validación de Hipótesis (Tesis)"}
                subtitle={viewMode === 'commercial' ? "Monitoreo de indicadores operativos" : "Comparativo: Proceso Manual vs Sistema Web"}
            />

            {/* Barra de Control */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-background-dark p-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-full sm:w-auto">
                    <button
                        onClick={() => setViewMode('commercial')}
                        className={`flex-1 sm:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${viewMode === 'commercial'
                                ? 'bg-white dark:bg-gray-700 text-primary shadow-sm ring-1 ring-black/5'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                    >
                        <PieChart className="w-4 h-4" /> Dashboard
                    </button>
                    <button
                        onClick={() => setViewMode('thesis')}
                        className={`flex-1 sm:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${viewMode === 'thesis'
                                ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm ring-1 ring-black/5'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                    >
                        <Activity className="w-4 h-4" /> Análisis Tesis
                    </button>
                </div>

                <Button variant="secondary" size="sm" onClick={fetchData} className="w-full sm:w-auto">
                    <RefreshCw className="w-4 h-4 mr-2" /> Actualizar Datos
                </Button>
            </div>

            {/* VISTA COMERCIAL: Filtros y KPIs */}
            {viewMode === 'commercial' && (
                <>
                    <AdvancedFilters
                        filters={filters}
                        onFiltersChange={setFilters}
                        onClear={() => setFilters({ groupBy: 'month' })}
                    />

                    {/* KPIs Dinámicos */}
                    {kpis && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 animate-fade-in">
                            <StatCard
                                title="Ventas Totales"
                                value={`S/. ${Number(kpis.totalVentas).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
                                icon={<TrendingUp className="w-6 h-6 text-white" />}
                                color="green"
                                subtitle="Periodo seleccionado"
                                changeType="positive"
                            />
                            <StatCard
                                title="Cotizaciones"
                                value={kpis.totalOrdenes.toString()}
                                icon={<CheckCircle className="w-6 h-6 text-white" />}
                                color="blue"
                                subtitle="Generadas"
                                changeType="neutral"
                            />
                            <StatCard
                                title="Ticket Promedio"
                                value={`S/. ${Number(kpis.ticketPromedio).toLocaleString('es-PE', { maximumFractionDigits: 0 })}`}
                                icon={<DollarSign className="w-6 h-6 text-white" />}
                                color="purple"
                                subtitle="Por cotización"
                                changeType="neutral"
                            />
                            <StatCard
                                title="Tasa Conversión"
                                value={`${Number(kpis.conversionRate).toFixed(1)}%`}
                                icon={<ShoppingBag className="w-6 h-6 text-white" />}
                                color="yellow"
                                subtitle="Aprobadas vs Total"
                                changeType="positive"
                            />
                        </div>
                    )}
                </>
            )}

            {/* GRÁFICOS */}
            {loading ? (
                <div className="flex h-96 items-center justify-center bg-white dark:bg-background-dark rounded-xl border border-gray-200 dark:border-gray-700">
                    <Loading message="Procesando datos..." />
                </div>
            ) : (
                <ThesisCharts
                    mode={viewMode}
                    thesisData={thesisData}
                    salesData={salesData}
                    categoryData={categoryData}
                    statusData={statusData}
                />
            )}
        </div>
    );
};

export default ReportsPage;