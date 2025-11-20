import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import ThesisCharts from '../../components/reports/ThesisCharts';
import { cotizacionesService } from '../../services/cotizacionesService';
import Loading from '../../components/common/Loading';

const ReportsPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Traemos todas las cotizaciones aprobadas para generar los gráficos
                const response = await cotizacionesService.getCotizaciones('admin', {
                    estado: 'aprobada',
                    limit: 1000
                });
                setData(response.data || []);
            } catch (error) {
                console.error('Error loading report data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loading message="Generando reportes y gráficos..." />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <DashboardHeader
                title="Reportes Financieros y Operativos"
                subtitle="Análisis detallado de ventas, productos y rendimiento"
            />

            {/* Contenedor de Gráficos */}
            <div className="bg-white dark:bg-background-dark rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                {data.length > 0 ? (
                    <ThesisCharts cotizaciones={data} />
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        No hay suficientes datos de ventas aprobadas para generar los gráficos.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportsPage;