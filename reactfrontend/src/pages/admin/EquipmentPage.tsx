import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, Plus, RefreshCw, Filter, Edit, Trash2 } from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import { useToast } from '../../contexts/ToastContext';
import type { Equipo, Categoria } from '../../types';
import Sidebar from '../../components/dashboard/Sidebar';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import Button from '../../components/common/Button';

const EquipmentPage: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipo[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const filters = {
        search: searchTerm || undefined,
        categoria_id: categoryFilter ? parseInt(categoryFilter) : undefined,
        min_precio: minPrice ? parseFloat(minPrice) : undefined,
        max_precio: maxPrice ? parseFloat(maxPrice) : undefined,
      };

      const [equipmentData, categoriesData] = await Promise.all([
        inventoryService.getAllEquipment(filters),
        inventoryService.getAllCategories()
      ]);

      setEquipment(equipmentData);
      setCategories(categoriesData);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilter = () => {
    fetchData();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setMinPrice('');
    setMaxPrice('');
    setTimeout(() => fetchData(), 100);
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${nombre}"?`)) {
      return;
    }

    try {
      await inventoryService.deleteEquipment(id);
      showToast('Equipo eliminado correctamente', 'success');
      fetchData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Error al eliminar equipo', 'error');
    }
  };

  const formatPrice = (price: number) => {
    return `S/. ${price.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-background-dark-secondary">
      <Sidebar role="admin" />

      <div className="flex-1 flex flex-col">
        <DashboardHeader title="Gestión de Equipos" role="admin" />

        <main className="flex-1 p-6">
          {/* Filters */}
          <div className="bg-white dark:bg-background-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Equipos de Cocina Industrial</h2>
              <Button
                onClick={() => navigate('/admin/equipment/new')}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nuevo Equipo
              </Button>
            </div>

            {/* Filter Row */}
            <div className="p-6 bg-gray-50 dark:bg-background-dark-tertiary border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Buscar equipos
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Nombre, código o descripción..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoría
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Min Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Precio Mín.
                  </label>
                  <input
                    type="number"
                    placeholder="S/. 0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Max Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Precio Máx.
                  </label>
                  <input
                    type="number"
                    placeholder="S/. 9999"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-3 mt-4">
                <Button onClick={handleFilter} className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filtrar
                </Button>
                <Button onClick={handleClearFilters} variant="secondary" className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Limpiar
                </Button>
              </div>
            </div>
          </div>

          {/* Equipment Grid */}
          <div className="bg-white dark:bg-background-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            {loading ? (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                Cargando equipos...
              </div>
            ) : equipment.length === 0 ? (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                No se encontraron equipos
              </div>
            ) : (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {equipment.map((equipo) => (
                  <div
                    key={equipo.id}
                    className="bg-gray-50 dark:bg-background-dark-tertiary rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Image */}
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      {equipo.imagen_url ? (
                        <img
                          src={equipo.imagen_url}
                          alt={equipo.nombre}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="text-gray-400 text-4xl">📦</div>';
                          }}
                        />
                      ) : (
                        <Package className="w-16 h-16 text-gray-400" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="mb-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{equipo.codigo}</span>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {equipo.nombre}
                        </h3>
                      </div>

                      {equipo.descripcion && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {equipo.descripcion}
                        </p>
                      )}

                      <div className="space-y-1 mb-3 text-sm">
                        {equipo.categoria_nombre && (
                          <p className="text-gray-600 dark:text-gray-400">
                            <strong>Categoría:</strong> {equipo.categoria_nombre}
                          </p>
                        )}
                        {equipo.material && (
                          <p className="text-gray-600 dark:text-gray-400">
                            <strong>Material:</strong> {equipo.material}
                          </p>
                        )}
                        {equipo.dimensiones && (
                          <p className="text-gray-600 dark:text-gray-400">
                            <strong>Dimensiones:</strong> {equipo.dimensiones}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mb-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div>
                          <div className="text-2xl font-bold text-primary">
                            {formatPrice(equipo.precio)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Stock: {equipo.stock} unidades
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${equipo.stock > 0
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                          {equipo.stock > 0 ? 'Disponible' : 'Sin stock'}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => navigate(`/admin/equipment/${equipo.id}/edit`)}
                          variant="secondary"
                          size="sm"
                          className="flex-1 flex items-center justify-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </Button>
                        <Button
                          onClick={() => handleDelete(equipo.id, equipo.nombre)}
                          variant="danger"
                          size="sm"
                          className="flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default EquipmentPage;
