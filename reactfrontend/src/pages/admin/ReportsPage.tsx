import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { DollarSign, TrendingUp, ShoppingBag, Users, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import StatCard from '../../components/dashboard/StatCard';
import Loading from '../../components/common/Loading';
import AdvancedFilters from '../../components/reports/AdvancedFilters';
import type { ReportFilters } from '../../components/reports/AdvancedFilters';
import { cotizacionesService } from '../../services/cotizacionesService';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import type { ReportKPIs, SalesByMonth, SalesBySeller, SalesStatus } from '../../types';
import { ComparisonBarChart, HypothesisRadarChart, TrendLineChart } from '../../components/reports/ThesisCharts';

const ReportsPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'general' | 'pre' | 'post' | 'comparative'>('general');
    const [filters, setFilters] = useState<ReportFilters>({});

    // Real Data State
    const [kpis, setKpis] = useState<ReportKPIs>({
        totalVentas: 0,
        totalOrdenes: 0,
        ticketPromedio: 0,
        conversionRate: 0
    });
    const [salesByMonth, setSalesByMonth] = useState<SalesByMonth[]>([]);
    const [salesBySeller, setSalesBySeller] = useState<SalesBySeller[]>([]);
    const [salesStatus, setSalesStatus] = useState<SalesStatus[]>([]);
    const [salesByCategory, setSalesByCategory] = useState<any[]>([]);

    // Thesis Data State (Inicializado en 0)
    const [preTestData, setPreTestData] = useState<any>({
        avgResponseTime: 0,
        errorRate: 0,
        satisfaction: 0,
        efficiency: 0,
        distribution: [],
        salesByPeriod: []
    });
    const [postTestData, setPostTestData] = useState<any>({
        avgResponseTime: 0,
        errorRate: 0,
        satisfaction: 0,
        efficiency: 0,
        distribution: [],
        salesByPeriod: []
    });

    const { showToast } = useToast();
    const { user } = useAuth();

    useEffect(() => {
        fetchData();
    }, [user, filters, activeTab]);

    const fetchData = async () => {
        if (!user) return;
        try {
            setLoading(true);

            if (activeTab === 'general') {
                const [kpisData, monthData, sellerData, statusData, categoryData] = await Promise.all([
                    cotizacionesService.getFilteredReportKPIs('admin', filters),
                    cotizacionesService.getFilteredSalesByPeriod('admin', filters),
                    cotizacionesService.getReportSalesBySeller('admin'),
                    cotizacionesService.getReportSalesStatus('admin'),
                    cotizacionesService.getSalesByCategory('admin', filters)
                ]);

                setKpis(kpisData);
                setSalesByMonth(monthData);
                setSalesBySeller(sellerData);
                setSalesStatus(statusData);
                setSalesByCategory(categoryData);
            } else if (activeTab === 'pre') {
                const preData = await cotizacionesService.getPreTestDetailed('admin', filters);
                setPreTestData(preData);
            } else if (activeTab === 'post') {
                const postData = await cotizacionesService.getPostTestDetailed('admin', filters);
                setPostTestData(postData);
            } else if (activeTab === 'comparative') {
                const [preData, postData] = await Promise.all([
                    cotizacionesService.getPreTestDetailed('admin', filters),
                    cotizacionesService.getPostTestDetailed('admin', filters)
                ]);
                setPreTestData(preData);
                setPostTestData(postData);
            }

        } catch (error) {
            console.error(error);
            showToast('Error al cargar reportes', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFiltersChange = (newFilters: ReportFilters) => {
        setFilters(newFilters);
    };

    const handleClearFilters = () => {
        setFilters({});
    };

    // Helper para formatear tiempo dinámicamente
    const formatTime = (minutes: number) => {
        if (minutes > 1440) return `${(minutes / 1440).toFixed(1)} días`;
        if (minutes > 60) return `${(minutes / 60).toFixed(1)} hrs`;
        return `${minutes.toFixed(0)} min`;
    };

    // Datos dinámicos para gráfico comparativo (Normalizados a horas para visualización)
    const comparativeData = [
        {
            metric: 'Tiempo Respuesta (hrs)',
            pre: Number((preTestData.avgResponseTime / 60).toFixed(1)),
            post: Number((postTestData.avgResponseTime / 60).toFixed(1)),
            unit: 'hrs'
        },
        {
            metric: 'Tasa de Error (%)',
            pre: Number(preTestData.errorRate.toFixed(2)),
            post: Number(postTestData.errorRate.toFixed(2)),
            unit: '%'
        },
        {
            metric: 'Satisfacción (0-10)',
            pre: preTestData.satisfaction,
            post: postTestData.satisfaction,
            unit: '/10'
        },
        {
            metric: 'Eficiencia (0-10)',
            pre: preTestData.efficiency,
            post: postTestData.efficiency,
            unit: '/10'
        }
    ];

    // Datos para el radar (Normalizados 0-100 para visualización relativa)
    const radarData = [
        {
            subject: 'Tiempo',
            A: Math.max(0, 10 - (preTestData.avgResponseTime / 600)),
            B: Math.max(0, 10 - (postTestData.avgResponseTime / 600)),
            fullMark: 10
        },
        {
            subject: 'Precisión',
            A: (100 - preTestData.errorRate) / 10,
            B: (100 - postTestData.errorRate) / 10,
            fullMark: 10
        },
        {
            subject: 'Satisfacción',
            A: preTestData.satisfaction,
            B: postTestData.satisfaction,
            fullMark: 10
        },
        {
            subject: 'Eficiencia',
            A: preTestData.efficiency,
            B: postTestData.efficiency,
            fullMark: 10
        }
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50 dark:bg-background-dark-secondary">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <Loading />
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-background-dark-secondary overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <DashboardHeader title="Reportes y Análisis" />

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Tabs */}
                    <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                        <nav className="flex space-x-8">
                            {['general', 'pre', 'post', 'comparative'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                        }`}
                                >
                                    {tab === 'general' && '📊 General'}
                                    {tab === 'pre' && '📉 Situación Inicial (Pre-Test)'}
                                    {tab === 'post' && '📈 Situación Actual (Post-Test)'}
                                    {tab === 'comparative' && '🔄 Comparativo Final'}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Advanced Filters */}
                    <div className="mb-6">
                        <AdvancedFilters
                            filters={filters}
                            onFiltersChange={handleFiltersChange}
                            onClear={handleClearFilters}
                        />
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'general' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* KPIs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                                <StatCard
                                    title="Ventas Totales"
                                    value={`S/. ${kpis.totalVentas.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
                                    icon={<DollarSign />}
                                    change="Total acumulado"
                                    changeType="positive"
                                />
                                <StatCard
                                    title="Total Órdenes"
                                    value={kpis.totalOrdenes.toString()}
                                    icon={<ShoppingBag />}
                                    change="Cotizaciones aprobadas"
                                    changeType="neutral"
                                />
                                <StatCard
                                    title="Ticket Promedio"
                                    value={`S/. ${kpis.ticketPromedio.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
                                    icon={<TrendingUp />}
                                    change="Por orden"
                                    changeType="neutral"
                                />
                                <StatCard
                                    title="Tasa de Conversión"
                                    value={`${kpis.conversionRate.toFixed(2)}%`}
                                    icon={<Users />}
                                    change="Aprobadas/Total"
                                    changeType="positive"
                                />
                            </div>

                            {/* Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Sales by Period */}
                                <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                                        Ventas por Período
                                    </h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={salesByMonth}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                            <XAxis dataKey="name" stroke="#9CA3AF" />
                                            <YAxis stroke="#9CA3AF" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    color: '#374151'
                                                }}
                                            />
                                            <Legend />
                                            <Bar dataKey="ventas" fill="#3B82F6" name="Ventas (S/.)" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Sales by Category */}
                                <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                                        Ventas por Categoría
                                    </h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={salesByCategory}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                            <XAxis dataKey="name" stroke="#9CA3AF" />
                                            <YAxis stroke="#9CA3AF" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    color: '#374151'
                                                }}
                                            />
                                            <Legend />
                                            <Bar dataKey="ventas" fill="#10B981" name="Ventas (S/.)" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Sales by Seller */}
                                <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                                        Ventas por Vendedor
                                    </h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={salesBySeller} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                            <XAxis type="number" stroke="#9CA3AF" />
                                            <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={100} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    color: '#374151'
                                                }}
                                            />
                                            <Legend />
                                            <Bar dataKey="ventas" fill="#F59E0B" name="Ventas (S/.)" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Sales Status */}
                                <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                                        Estado de Cotizaciones
                                    </h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={salesStatus}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {salesStatus.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'pre' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Pre-Test KPIs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                                <StatCard
                                    title="Tiempo de Respuesta"
                                    value={formatTime(preTestData.avgResponseTime)}
                                    icon={<Clock />}
                                    change="Promedio histórico"
                                    changeType="negative"
                                    color="red"
                                />
                                <StatCard
                                    title="Tasa de Error"
                                    value={`${preTestData.errorRate.toFixed(2)}%`}
                                    icon={<AlertTriangle />}
                                    change="Rechazo por errores"
                                    changeType="negative"
                                    color="red"
                                />
                                <StatCard
                                    title="Satisfacción Calc."
                                    value={`${preTestData.satisfaction}/10`}
                                    icon={<Users />}
                                    change="Basado en aprobación"
                                    changeType="neutral"
                                    color="yellow"
                                />
                                <StatCard
                                    title="Eficiencia Calc."
                                    value={`${preTestData.efficiency}/10`}
                                    icon={<TrendingUp />}
                                    change="Basado en tiempos"
                                    changeType="neutral"
                                    color="yellow"
                                />
                            </div>

                            {/* Pre-Test Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                                        Dispersión de Tiempos (Muestreo)
                                    </h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <ScatterChart>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                            <XAxis dataKey="id" name="Cotización" stroke="#9CA3AF" />
                                            <YAxis dataKey="hours" name="Horas" stroke="#9CA3AF" />
                                            <ZAxis range={[60, 60]} />
                                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                            <Scatter name="Tiempo (hrs)" data={preTestData.distribution} fill="#EF4444" />
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Sales by Period */}
                                <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                                        Ventas por Período (Pre-Test)
                                    </h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={preTestData.salesByPeriod}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                            <XAxis dataKey="name" stroke="#9CA3AF" />
                                            <YAxis stroke="#9CA3AF" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    color: '#374151'
                                                }}
                                            />
                                            <Legend />
                                            <Line type="monotone" dataKey="ventas" stroke="#EF4444" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'post' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Post-Test KPIs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                                <StatCard
                                    title="Tiempo de Respuesta"
                                    value={formatTime(postTestData.avgResponseTime)}
                                    icon={<Clock />}
                                    change="Optimizado"
                                    changeType="positive"
                                    color="green"
                                />
                                <StatCard
                                    title="Tasa de Error"
                                    value={`${postTestData.errorRate.toFixed(2)}%`}
                                    icon={<CheckCircle />}
                                    change="Minimizado"
                                    changeType="positive"
                                    color="green"
                                />
                                <StatCard
                                    title="Satisfacción Actual"
                                    value={`${postTestData.satisfaction}/10`}
                                    icon={<Users />}
                                    change="Mejora notable"
                                    changeType="positive"
                                    color="green"
                                />
                                <StatCard
                                    title="Eficiencia Actual"
                                    value={`${postTestData.efficiency}/10`}
                                    icon={<TrendingUp />}
                                    change="Alta eficiencia"
                                    changeType="positive"
                                    color="green"
                                />
                            </div>

                            {/* Post-Test Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                                        Dispersión de Tiempos Actuales
                                    </h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <ScatterChart>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                            <XAxis dataKey="id" name="Cotización" stroke="#9CA3AF" />
                                            <YAxis dataKey="hours" name="Horas" stroke="#9CA3AF" />
                                            <ZAxis range={[60, 60]} />
                                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                            <Scatter name="Tiempo (hrs)" data={postTestData.distribution} fill="#10B981" />
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Sales by Period */}
                                <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                                        Ventas por Período (Post-Test)
                                    </h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={postTestData.salesByPeriod}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                            <XAxis dataKey="name" stroke="#9CA3AF" />
                                            <YAxis stroke="#9CA3AF" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    color: '#374151'
                                                }}
                                            />
                                            <Legend />
                                            <Line type="monotone" dataKey="ventas" stroke="#10B981" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'comparative' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <ComparisonBarChart
                                    data={comparativeData}
                                    title="Pre-Test vs Post-Test"
                                    description="Comparativa de indicadores clave de rendimiento"
                                />
                                <HypothesisRadarChart
                                    data={radarData}
                                    title="Análisis Multidimensional"
                                />
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <TrendLineChart
                                    data={preTestData.salesByPeriod}
                                    title="Tendencia Inicial"
                                    dataKey="ventas"
                                    color="#EF4444"
                                />
                                <TrendLineChart
                                    data={postTestData.salesByPeriod}
                                    title="Tendencia Actual"
                                    dataKey="ventas"
                                    color="#10B981"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;