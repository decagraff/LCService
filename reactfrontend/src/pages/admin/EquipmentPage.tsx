import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, Plus, RefreshCw, Filter, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import { useToast } from '../../contexts/ToastContext';
import type { Equipo, Categoria } from '../../types';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

const EquipmentPage: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipo[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12); // 12 para grid de 3x4

  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      // Solicitamos todos (sin paginación de backend) para filtrar/paginar en cliente rápido
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
      setCurrentPage(1); // Reset page on filter change from backend
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

  // --- Lógica de Paginación Cliente ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = equipment.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(equipment.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatPrice = (price: number) => {
    return `S/. ${price.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Loading message="Cargando catálogo..." /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <DashboardHeader title="Gestión de Equipos" subtitle="Administración del catálogo de productos" />
        <Button
          onClick={() => navigate('/admin/equipment/new')}
          className="flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nuevo Equipo
        </Button>
      </div>

      {/* Filters Panel */}
      <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Nombre, código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
                className="pl-10 pr-4 py-2 w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark-tertiary focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Categoría</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark-tertiary focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Todas</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Min</label>
              <input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark-tertiary"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Max</label>
              <input
                type="number"
                placeholder="9999"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark-tertiary"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleFilter} className="flex-1 flex items-center justify-center gap-2 h-[38px]">
              <Filter className="w-4 h-4" />
            </Button>
            <Button onClick={handleClearFilters} variant="secondary" className="flex-1 flex items-center justify-center gap-2 h-[38px]">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Equipment Grid */}
      {equipment.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No se encontraron equipos</h3>
          <p className="text-gray-500 mt-1">Intenta ajustar los filtros de búsqueda.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentItems.map((equipo) => (
              <div
                key={equipo.id}
                className="group bg-white dark:bg-background-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-300"
              >
                {/* Image */}
                <div className="h-48 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                  {equipo.imagen_url ? (
                    <img
                      src={equipo.imagen_url}
                      alt={equipo.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="flex h-full items-center justify-center text-gray-300"><span class="text-4xl">📦</span></div>';
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-300">
                      <Package className="w-12 h-12" />
                    </div>
                  )}

                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold shadow-sm ${equipo.stock > 0
                        ? 'bg-white/90 text-green-700 dark:bg-black/60 dark:text-green-400 backdrop-blur-sm'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/80 dark:text-white'
                      }`}>
                      {equipo.stock > 0 ? `${equipo.stock} unid.` : 'Agotado'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="mb-1 flex justify-between items-start">
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                      {equipo.codigo}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1 truncate" title={equipo.nombre}>
                    {equipo.nombre}
                  </h3>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 truncate">
                    {equipo.categoria_nombre || 'Sin categoría'}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(equipo.precio)}
                    </span>

                    <div className="flex gap-1">
                      <button
                        onClick={() => navigate(`/admin/equipment/${equipo.id}/edit`)}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(equipo.id, equipo.nombre)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {equipment.length > 0 && (
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a <span className="font-medium">{Math.min(indexOfLastItem, equipment.length)}</span> de <span className="font-medium">{equipment.length}</span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Siguiente <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EquipmentPage;