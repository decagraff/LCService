import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Plus, FolderOpen, List, AlertTriangle, BarChart3 } from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import { useToast } from '../../contexts/ToastContext';
import type { InventoryStats, Categoria, Equipo } from '../../types';
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
        setCategories(categoriesData.slice(0, 6)); // Top 6 categorías
        setRecentEquipment(equipmentData.slice(0, 5)); // Top 5 recientes
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
      return <span className="px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Agotado</span>;
    } else if (stock <= 5) {
      return <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Bajo ({stock})</span>;
    }
    return <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">{stock} Unid.</span>;
  };

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><Loading message="Cargando inventario..." /></div>;
  }

  return (
    <div className="space-y-6">
      <DashboardHeader title="Gestión de Inventario" subtitle="Control de stock, productos y categorías" />

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Equipos"
            value={(stats.total_equipos || 0).toString()}
            subtitle="SKUs registrados"
            icon={<Package className="w-6 h-6 text-white" />}
            color="blue"
            changeType="neutral"
          />
          <StatCard
            title="Valor Inventario"
            value={`S/. ${(stats.valor_inventario || 0).toLocaleString('es-PE', { notation: "compact" })}`} // Si el backend no lo manda, mostrará 0
            subtitle="Estimado en almacén"
            icon={<BarChart3 className="w-6 h-6 text-white" />}
            color="purple"
            changeType="neutral"
          />
          <StatCard
            title="Sin Stock"
            value={(stats.equipos_sin_stock || 0).toString()}
            subtitle="Productos agotados"
            icon={<AlertTriangle className="w-6 h-6 text-white" />}
            color="red"
            changeType="negative"
          />
          <StatCard
            title="Stock Bajo"
            value={(stats.equipos_bajo_stock || 0).toString()}
            subtitle="Menos de 5 unidades"
            icon={<AlertTriangle className="w-6 h-6 text-white" />}
            color="yellow"
            changeType="neutral"
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-background-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Button onClick={() => navigate('/admin/equipment/new')} className="h-auto py-4 flex-col gap-2 border-2 border-primary/10 hover:border-primary/30">
            <Plus className="w-6 h-6" />
            <span>Nuevo Equipo</span>
          </Button>
          <Button onClick={() => navigate('/admin/categories/new')} variant="secondary" className="h-auto py-4 flex-col gap-2">
            <FolderOpen className="w-6 h-6" />
            <span>Nueva Categoría</span>
          </Button>
          <Button onClick={() => navigate('/admin/equipment')} variant="secondary" className="h-auto py-4 flex-col gap-2">
            <List className="w-6 h-6" />
            <span>Ver Listado Completo</span>
          </Button>
          <Button onClick={() => navigate('/admin/categories')} variant="secondary" className="h-auto py-4 flex-col gap-2">
            <FolderOpen className="w-6 h-6" />
            <span>Ver Categorías</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Equipment Table */}
        <div className="lg:col-span-2 bg-white dark:bg-background-dark rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-gray-100">Últimos Agregados</h3>
            <Link to="/admin/equipment" className="text-sm text-primary hover:underline">Ver todos</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-background-dark-tertiary text-gray-500 uppercase font-medium">
                <tr>
                  <th className="px-5 py-3">Equipo</th>
                  <th className="px-5 py-3 text-right">Precio</th>
                  <th className="px-5 py-3 text-center">Stock</th>
                  <th className="px-5 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {recentEquipment.map((equipo) => (
                  <tr key={equipo.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {equipo.imagen_url ? (
                            <img src={equipo.imagen_url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <Package className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[150px]">{equipo.nombre}</p>
                          <p className="text-xs text-gray-500 font-mono">{equipo.codigo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-gray-700 dark:text-gray-300">{formatPrice(equipo.precio)}</td>
                    <td className="px-5 py-3 text-center">{getStockBadge(equipo.stock)}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => navigate(`/admin/equipment/${equipo.id}/edit`)}
                        className="text-primary hover:underline text-xs font-medium"
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

        {/* Categories Summary */}
        <div className="bg-white dark:bg-background-dark rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-gray-100">Categorías Principales</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {categories.map((categoria) => (
              <div
                key={categoria.id}
                onClick={() => navigate(`/admin/equipment?categoria=${categoria.id}`)}
                className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-primary">
                    <FolderOpen className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{categoria.nombre}</span>
                </div>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs text-gray-600 dark:text-gray-400 font-medium">
                  {categoria.equipment_count || 0} ítems
                </span>
              </div>
            ))}
            <div className="p-4 text-center">
              <Link to="/admin/categories" className="text-sm text-primary hover:underline">Ver todas las categorías</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboardPage;