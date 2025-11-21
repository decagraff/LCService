import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

// Tipos
interface ThesisData {
    preTest: { tiempo_respuesta_minutos: number; tasa_conversion: number; tasa_error: number; };
    postTest: { tiempo_respuesta_minutos: number; tasa_conversion: number; tasa_error: number; };
}

interface ThesisChartsProps {
    mode: 'commercial' | 'thesis';
    thesisData?: ThesisData;
    salesData?: any[];
    categoryData?: any[];
    statusData?: any[];
}

const ThesisCharts: React.FC<ThesisChartsProps> = ({ mode, thesisData, salesData, categoryData, statusData }) => {

    // -------------------------------------------
    // VISTA TESIS: COMPARATIVA PRE vs POST
    // -------------------------------------------
    if (mode === 'thesis' && thesisData) {

        // Preparar datos para gráficos
        const timeData = [
            { name: 'Manual (Pre)', minutos: thesisData.preTest.tiempo_respuesta_minutos, label: '3 Días' },
            { name: 'Web (Post)', minutos: thesisData.postTest.tiempo_respuesta_minutos, label: `${thesisData.postTest.tiempo_respuesta_minutos} min` }
        ];

        const conversionData = [
            { name: 'Conversión', Pre: thesisData.preTest.tasa_conversion, Post: thesisData.postTest.tasa_conversion },
            { name: 'Tasa Error', Pre: thesisData.preTest.tasa_error, Post: thesisData.postTest.tasa_error }
        ];

        return (
            <div className="space-y-8 animate-fade-in">

                {/* 1. Tarjetas de Impacto (KPIs Diferenciales) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-background-dark border border-red-100 dark:border-red-800 p-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Reducción de Tiempo</p>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Optimización</h3>
                            </div>
                        </div>
                        <div className="flex justify-between items-end border-t border-red-100 dark:border-red-800 pt-4">
                            <div className="text-center">
                                <p className="text-xs uppercase text-gray-400 font-bold">Antes</p>
                                <p className="font-mono text-lg text-gray-600">~3 Días</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs uppercase text-gray-400 font-bold">Ahora</p>
                                <p className="font-mono text-2xl font-bold text-green-600">{Math.round(thesisData.postTest.tiempo_respuesta_minutos)} min</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-background-dark border border-blue-100 dark:border-blue-800 p-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Efectividad de Ventas</p>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Conversión</h3>
                            </div>
                        </div>
                        <div className="flex justify-between items-end border-t border-blue-100 dark:border-blue-800 pt-4">
                            <div className="text-center">
                                <p className="text-xs uppercase text-gray-400 font-bold">Antes</p>
                                <p className="font-mono text-lg text-gray-600">{thesisData.preTest.tasa_conversion}%</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs uppercase text-gray-400 font-bold">Ahora</p>
                                <p className="font-mono text-2xl font-bold text-blue-600">{thesisData.postTest.tasa_conversion}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-background-dark border border-orange-100 dark:border-orange-800 p-6 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Calidad Operativa</p>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Tasa de Error</h3>
                            </div>
                        </div>
                        <div className="flex justify-between items-end border-t border-orange-100 dark:border-orange-800 pt-4">
                            <div className="text-center">
                                <p className="text-xs uppercase text-gray-400 font-bold">Antes</p>
                                <p className="font-mono text-lg text-gray-600">{thesisData.preTest.tasa_error}%</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs uppercase text-gray-400 font-bold">Ahora</p>
                                <p className="font-mono text-2xl font-bold text-green-600">{thesisData.postTest.tasa_error}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Gráficos Comparativos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Eficiencia (Escala Logarítmica simulada visualmente) */}
                    <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
                        <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">Impacto en Tiempo de Respuesta</h4>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={timeData} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#6B7280' }} />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="minutos" radius={[0, 6, 6, 0]} barSize={40}>
                                        {timeData.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#94A3B8' : '#3B82F6'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-xs text-center text-gray-400 mt-2">Comparación de tiempo promedio (Menos es mejor)</p>
                    </div>

                    {/* Calidad y Conversión */}
                    <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
                        <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">Mejora en Indicadores de Negocio</h4>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={conversionData} margin={{ top: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#6B7280' }} />
                                    <YAxis unit="%" />
                                    <Tooltip cursor={{ fill: '#F3F4F6' }} />
                                    <Legend />
                                    <Bar dataKey="Pre" name="Manual (Pre)" fill="#9CA3AF" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Post" name="Web (Post)" fill="#10B981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-xs text-center text-gray-400 mt-2">Comparación porcentual (Más conversión / Menos error es mejor)</p>
                    </div>
                </div>
            </div>
        );
    }

    // -------------------------------------------
    // VISTA COMERCIAL: DASHBOARD OPERATIVO
    // -------------------------------------------
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">

            {/* Ventas en el Tiempo (Area Chart) */}
            <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm lg:col-span-2">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" /> Evolución de Ventas
                    </h3>
                </div>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={salesData}>
                            <defs>
                                <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(val) => `S/.${val}`} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                formatter={(value: number) => [`S/. ${value.toLocaleString()}`, 'Ventas']}
                            />
                            <Area type="monotone" dataKey="ventas" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Estado de Cotizaciones (Pie Chart) */}
            <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">Distribución por Estado</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {statusData?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Categorías (Bar Chart) */}
            <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">Top 5 Categorías</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryData} layout="vertical" margin={{ left: 30 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                            <Tooltip formatter={(val: number) => `S/. ${val.toLocaleString()}`} />
                            <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
};

export default ThesisCharts;