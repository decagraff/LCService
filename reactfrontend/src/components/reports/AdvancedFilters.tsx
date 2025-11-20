import React, { useState, useEffect } from 'react';
import { Filter, X, Calendar } from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import { userService } from '../../services/userService';
import Button from '../common/Button';

export interface ReportFilters {
    startDate?: string;
    endDate?: string;
    vendorId?: string;
    clientId?: string;
    categoryId?: string;
    estado?: string;
    groupBy?: 'day' | 'week' | 'month' | 'year';
}

interface AdvancedFiltersProps {
    filters: ReportFilters;
    onFiltersChange: (filters: ReportFilters) => void;
    onClear: () => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ filters, onFiltersChange, onClear }) => {
    const [vendors, setVendors] = useState<Array<{ id: number; nombre: string }>>([]);
    const [clients, setClients] = useState<Array<{ id: number; nombre: string }>>([]);
    const [categories, setCategories] = useState<Array<{ id: number; nombre: string }>>([]);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const loadFilterOptions = async () => {
            try {
                const [usersData, categoriesData] = await Promise.all([
                    userService.getAllUsers(),
                    inventoryService.getAllCategories()
                ]);

                // Separate vendors and clients
                const vendorsList = usersData.filter((u: any) => u.role === 'vendedor');
                const clientsList = usersData.filter((u: any) => u.role === 'cliente');

                setVendors(vendorsList);
                setClients(clientsList);
                setCategories(categoriesData);
            } catch (error) {
                console.error('Error loading filter options:', error);
            }
        };

        loadFilterOptions();
    }, []);

    const handleFilterChange = (key: keyof ReportFilters, value: string) => {
        onFiltersChange({
            ...filters,
            [key]: value || undefined
        });
    };

    const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '');

    return (
        <div className="bg-white dark:bg-background-dark rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Filtros Avanzados
                    </h2>
                    {hasActiveFilters && (
                        <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">
                            Activo
                        </span>
                    )}
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-sm text-primary hover:text-blue-700 font-medium"
                >
                    {isExpanded ? 'Ocultar' : 'Mostrar'}
                </button>
            </div>

            {isExpanded && (
                <div className="p-6 space-y-4">
                    {/* Date Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Fecha Inicio
                            </label>
                            <input
                                type="date"
                                value={filters.startDate || ''}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-background-dark-tertiary text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Fecha Fin
                            </label>
                            <input
                                type="date"
                                value={filters.endDate || ''}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-background-dark-tertiary text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Vendor, Client, Category */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Vendedor
                            </label>
                            <select
                                value={filters.vendorId || ''}
                                onChange={(e) => handleFilterChange('vendorId', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-background-dark-tertiary text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">Todos los vendedores</option>
                                {vendors.map(v => (
                                    <option key={v.id} value={v.id}>{v.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Cliente
                            </label>
                            <select
                                value={filters.clientId || ''}
                                onChange={(e) => handleFilterChange('clientId', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-background-dark-tertiary text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">Todos los clientes</option>
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>{c.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Categoría
                            </label>
                            <select
                                value={filters.categoryId || ''}
                                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-background-dark-tertiary text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">Todas las categorías</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Estado and GroupBy */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Estado
                            </label>
                            <select
                                value={filters.estado || ''}
                                onChange={(e) => handleFilterChange('estado', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-background-dark-tertiary text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">Todos los estados</option>
                                <option value="borrador">Borrador</option>
                                <option value="enviada">Enviada</option>
                                <option value="aprobada">Aprobada</option>
                                <option value="rechazada">Rechazada</option>
                                <option value="vencida">Vencida</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Agrupar por
                            </label>
                            <select
                                value={filters.groupBy || 'month'}
                                onChange={(e) => handleFilterChange('groupBy', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-background-dark-tertiary text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="day">Día</option>
                                <option value="week">Semana</option>
                                <option value="month">Mes</option>
                                <option value="year">Año</option>
                            </select>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="secondary"
                            size="md"
                            onClick={onClear}
                            className="flex items-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Limpiar Filtros
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedFilters;
