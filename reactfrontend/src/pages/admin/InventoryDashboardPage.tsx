import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Plus, FolderOpen, List, AlertTriangle } from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import { useToast } from '../../contexts/ToastContext';
import type { InventoryStats, Categoria, Equipo } from '../../types';
import Sidebar from '../../components/dashboard/Sidebar';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import StatCard from '../../components/dashboard/StatCard';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

const InventoryDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [recentEquipment, setRecentEquipment] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, categoriesData, equipmentData] = await Promise.all([
          inventoryService.getInventoryStats(),
          inventoryService.getAllCategories(),
          inventoryService.getAllEquipment()
        ]);

        setStats(statsData);
        // Mostrar solo las primeras 6 categorías
        setCategories(categoriesData.slice(0, 6));
        // Mostrar los últimos 8 equipos agregados
        setRecentEquipment(equipmentData.slice(0, 8));
      } catch (error) {
        console.error(error);
        showToast('Error al cargar datos del inventario', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showToast]);

  const formatPrice = (price: number | string) => {
    return `S/. ${Number(price).toFixed(2)}`;
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Agotado</span>;
    } else if (stock <= 5) {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">{stock} (Bajo)</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{stock} unid.</span>;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-background-dark-secondary">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loading message="Cargando inventario..." />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-background-dark-secondary">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 p-6 overflow-y-auto">
          <DashboardHeader title="Gestión de Inventario" />

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatCard
                title="Total Equipos"
                value={(stats.total_equipos || 0).toString()}
                subtitle="En catálogo"
                icon={<Package className="w-6 h-6" />}
                color="blue"
              />
              <StatCard
                title="Stock Total"
                value={(stats.total_stock || 0).toString()}
                subtitle="Unidades físicas"
                icon={<span className="text-2xl">📦</span>}
                color="green"
              />
              <StatCard
                title="Sin Stock"
                value={(stats.equipos_sin_stock || 0).toString()}
                subtitle="Requieren atención"
                icon={<AlertTriangle className="w-6 h-6" />}
                color="red"
              />
              <StatCard
                title="Stock Bajo"
                value={(stats.equipos_bajo_stock || 0).toString()}
                subtitle="Menos de 5 unid."
                icon={<span className="text-2xl">⚠️</span>}
                color="yellow"
              />
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white dark:bg-background-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6 p-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Acciones Rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button onClick={() => navigate('/admin/equipment/new')} className="h-auto py-3 flex-col gap-2">
                <Plus className="w-5 h-5" />
                <span>Nuevo Equipo</span>
              </Button>
              <Button onClick={() => navigate('/admin/categories/new')} variant="secondary" className="h-auto py-3 flex-col gap-2">
                <FolderOpen className="w-5 h-5" />
                <span>Nueva Categoría</span>
              </Button>
              <Button onClick={() => navigate('/admin/equipment')} variant="secondary" className="h-auto py-3 flex-col gap-2">
                <List className="w-5 h-5" />
                <span>Ver Inventario</span>
              </Button>
              <Button onClick={() => navigate('/admin/categories')} variant="secondary" className="h-auto py-3 flex-col gap-2">
                <FolderOpen className="w-5 h-5" />
                <span>Ver Categorías</span>
              </Button>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Categorías Principales</h2>
              <Link to="/admin/categories" className="text-primary text-sm hover:underline">Ver todas</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categories.map((categoria) => (
                <div key={categoria.id} className="bg-white dark:bg-background-dark p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/admin/equipment?categoria=${categoria.id}`)}>
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-primary">
                      <FolderOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{categoria.nombre}</h4>
                      <p className="text-xs text-gray-500">{categoria.equipment_count || 0} equipos</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Equipment Table */}
          <div className="bg-white dark:bg-background-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Últimos Equipos Agregados</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-background-dark-tertiary text-gray-500 uppercase font-medium">
                  <tr>
                    <th className="px-6 py-3">Equipo</th>
                    <th className="px-6 py-3">Categoría</th>
                    <th className="px-6 py-3 text-right">Precio</th>
                    <th className="px-6 py-3 text-center">Stock</th>
                    <th className="px-6 py-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {recentEquipment.map((equipo) => (
                    <tr key={equipo.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {equipo.imagen_url ? (
                            <img src={equipo.imagen_url} className="w-8 h-8 rounded object-cover bg-gray-200" alt="" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400"><Package className="w-4 h-4" /></div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{equipo.nombre}</p>
                            <p className="text-xs text-gray-500 font-mono">{equipo.codigo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{equipo.categoria_nombre}</td>
                      <td className="px-6 py-4 text-right font-medium">{formatPrice(equipo.precio)}</td>
                      <td className="px-6 py-4 text-center">{getStockBadge(equipo.stock)}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/admin/equipment/${equipo.id}/edit`); }}
                          className="text-primary hover:underline"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InventoryDashboardPage;