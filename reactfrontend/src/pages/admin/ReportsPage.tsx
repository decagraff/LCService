import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { DollarSign, TrendingUp, ShoppingBag, Users } from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import StatCard from '../../components/dashboard/StatCard';
import Loading from '../../components/common/Loading';
import { cotizacionesService } from '../../services/cotizacionesService';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import type { ReportKPIs, SalesByMonth, SalesBySeller, SalesStatus } from '../../types';

const ReportsPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState<ReportKPIs>({
        totalVentas: 0,
        totalOrdenes: 0,
        ticketPromedio: 0,
        conversionRate: 0
    });
    const [salesByMonth, setSalesByMonth] = useState<SalesByMonth[]>([]);
    const [salesBySeller, setSalesBySeller] = useState<SalesBySeller[]>([]);
    const [salesStatus, setSalesStatus] = useState<SalesStatus[]>([]);

    const { showToast } = useToast();
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                setLoading(true);

                // Fetch reports from backend in parallel
                const [kpisData, monthData, sellerData, statusData] = await Promise.all([
                    cotizacionesService.getReportKPIs('admin'),
                    cotizacionesService.getReportSalesByMonth('admin'),
                    cotizacionesService.getReportSalesBySeller('admin'),
                    cotizacionesService.getReportSalesStatus('admin')
                ]);

                setKpis(kpisData);
                setSalesByMonth(monthData);
                setSalesBySeller(sellerData);
                setSalesStatus(statusData);

            } catch (error) {
                console.error(error);
                showToast('Error al cargar reportes', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) return <Loading fullScreen message="Cargando reportes..." />;

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-background-dark-secondary">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 p-6 overflow-y-auto">
                    <DashboardHeader title="Reportes y Analítica" />

                    {/* KPIS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Ingresos Totales"
                            value={`S/. ${kpis.totalVentas.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
                            icon={<DollarSign className="w-6 h-6 text-white" />}
                            color="green"
                            subtitle="Ventas aprobadas"
                        />
                        <StatCard
                            title="Conversión"
                            value={`${kpis.conversionRate.toFixed(1)}%`}
                            icon={<TrendingUp className="w-6 h-6 text-white" />}
                            color="blue"
                            subtitle="Cotizaciones cerradas"
                        />
                        <StatCard
                            title="Ticket Promedio"
                            value={`S/. ${kpis.ticketPromedio.toLocaleString('es-PE', { minimumFractionDigits: 0 })}`}
                            icon={<ShoppingBag className="w-6 h-6 text-white" />}
                            color="purple"
                            subtitle="Por venta"
                        />
                        <StatCard
                            title="Ventas Totales"
                            value={kpis.totalOrdenes}
                            icon={<Users className="w-6 h-6 text-white" />}
                            color="yellow"
                            subtitle="N° Operaciones"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* GRÁFICO 1: Ventas por Vendedor */}
                        <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">Rendimiento por Vendedor</h3>
                            <div className="h-80 min-h-[320px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={salesBySeller}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                        <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                                        <YAxis stroke="#888888" fontSize={12} tickFormatter={(value) => `S/.${value}`} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value: number) => [`S/. ${value.toLocaleString()}`, 'Ventas']}
                                        />
                                        <Bar dataKey="ventas" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* GRÁFICO 2: Estado de Cotizaciones */}
                        <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">Estado del Pipeline</h3>
                            <div className="h-80 min-h-[320px] flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={salesStatus as any[]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {salesStatus.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* GRÁFICO 3: Evolución de Ventas */}
                    <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">Evolución de Ingresos</h3>
                        <div className="h-80 min-h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={salesByMonth}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="name" stroke="#888888" />
                                    <YAxis stroke="#888888" tickFormatter={(value) => `S/.${value}`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px' }}
                                        formatter={(value: number) => [`S/. ${value.toLocaleString()}`, 'Ingresos']}
                                    />
                                    <Line type="monotone" dataKey="ventas" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
};

export default ReportsPage;