import React from 'react';
import { TrendingUp, BarChart2 } from 'lucide-react';
import type { Cotizacion } from '../../types';

interface ThesisChartsProps {
    cotizaciones: Cotizacion[];
}

const ThesisCharts: React.FC<ThesisChartsProps> = ({ cotizaciones }) => {

    // 1. Procesar datos para Gráfico de Barras (Ventas por Mes)
    const salesByMonth = cotizaciones.reduce((acc, curr) => {
        const date = new Date(curr.created_at);
        const key = `${date.getMonth() + 1}/${date.getFullYear()}`; // Formato MM/YYYY
        acc[key] = (acc[key] || 0) + Number(curr.total);
        return acc;
    }, {} as Record<string, number>);

    // Ordenar cronológicamente (simplificado para últimos 6 meses o claves existentes)
    const sortedMonths = Object.keys(salesByMonth).slice(-6); // Últimos 6 periodos
    const maxSale = Math.max(...Object.values(salesByMonth), 100);

    // 2. Procesar datos para Top Productos (Horizontal Bars)
    const productsCount: Record<string, number> = {};
    cotizaciones.forEach(cot => {
        cot.items?.forEach(item => {
            productsCount[item.equipo_nombre] = (productsCount[item.equipo_nombre] || 0) + item.cantidad;
        });
    });

    const topProducts = Object.entries(productsCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    const maxProductCount = Math.max(...Object.values(productsCount), 10);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* GRÁFICO 1: Ventas Mensuales (Barras Verticales) */}
            <div className="bg-white dark:bg-background-dark rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        Ingresos por Periodo
                    </h3>
                </div>

                <div className="h-64 flex items-end justify-around gap-2 pt-4 border-b border-gray-200 dark:border-gray-700">
                    {sortedMonths.map((month) => {
                        const value = salesByMonth[month];
                        const heightPercentage = (value / maxSale) * 100;

                        return (
                            <div key={month} className="flex flex-col items-center group w-full">
                                <div className="relative w-full max-w-[40px] flex flex-col justify-end h-full">
                                    <div
                                        className="w-full bg-primary/80 hover:bg-primary rounded-t-md transition-all duration-500 relative group-hover:shadow-lg"
                                        style={{ height: `${heightPercentage}%` }}
                                    >
                                        {/* Tooltip */}
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            S/. {value.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500 mt-2 font-medium">{month}</span>
                            </div>
                        );
                    })}
                    {sortedMonths.length === 0 && (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                            No hay datos suficientes
                        </div>
                    )}
                </div>
            </div>

            {/* GRÁFICO 2: Productos Más Vendidos (Barras Horizontales) */}
            <div className="bg-white dark:bg-background-dark rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-purple-500" />
                        Top Productos (Unidades)
                    </h3>
                </div>

                <div className="space-y-4">
                    {topProducts.map(([name, count], index) => {
                        const widthPercentage = (count / maxProductCount) * 100;

                        return (
                            <div key={index} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px]" title={name}>
                                        {name}
                                    </span>
                                    <span className="text-gray-500 font-mono">{count} un.</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-purple-500 rounded-full transition-all duration-700 ease-out"
                                        style={{ width: `${widthPercentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                    {topProducts.length === 0 && (
                        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                            No hay productos vendidos
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ThesisCharts;