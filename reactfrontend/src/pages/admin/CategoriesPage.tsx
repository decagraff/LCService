import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Search, Plus, RefreshCw, Edit, Trash2, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import { useToast } from '../../contexts/ToastContext';
import type { Categoria } from '../../types';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // 9 para grid de 3x3

  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Error al cargar categorías', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: number, nombre: string, equipmentCount?: number) => {
    if (equipmentCount && equipmentCount > 0) {
      showToast('No se puede eliminar una categoría que tiene equipos asociados', 'warning');
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar la categoría "${nombre}"?`)) {
      return;
    }

    try {
      await inventoryService.deleteCategory(id);
      showToast('Categoría eliminada correctamente', 'success');
      fetchCategories();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Error al eliminar categoría', 'error');
    }
  };

  // Filtrado y Paginación
  const filteredCategories = categories.filter((cat) =>
    cat.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.descripcion && cat.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><Loading message="Cargando categorías..." /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <DashboardHeader title="Gestión de Categorías" subtitle="Organización del catálogo de productos" />
        <Button
          onClick={() => navigate('/admin/categories/new')}
          className="flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nueva Categoría
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar categorías..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark-tertiary text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <Button
            onClick={fetchCategories}
            variant="secondary"
            className="flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>
        </div>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-background-dark-tertiary/30">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No se encontraron categorías
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? `No hay resultados para "${searchTerm}"` : 'Comienza creando tu primera categoría'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCategories.map((categoria) => (
              <div
                key={categoria.id}
                className="group bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md transition-all duration-300 hover:border-primary/50"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-primary rounded-lg group-hover:scale-110 transition-transform">
                    <FolderOpen className="w-6 h-6" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => navigate(`/admin/categories/${categoria.id}/edit`)}
                      className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(categoria.id, categoria.nombre, categoria.equipment_count)}
                      className={`p-1.5 rounded-lg transition-colors ${(categoria.equipment_count || 0) > 0
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                        }`}
                      disabled={(categoria.equipment_count || 0) > 0}
                      title={(categoria.equipment_count || 0) > 0 ? "Tiene equipos asociados" : "Eliminar"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {categoria.nombre}
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2 h-10">
                  {categoria.descripcion || 'Sin descripción disponible.'}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Package className="w-4 h-4" />
                    <span className="font-medium">{categoria.equipment_count || 0}</span>
                    <span className="text-xs text-gray-400">productos</span>
                  </div>

                  <Button
                    onClick={() => navigate(`/admin/equipment?categoria=${categoria.id}`)}
                    variant="secondary"
                    size="sm"
                    className="text-xs h-8"
                  >
                    Ver Inventario
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a <span className="font-medium">{Math.min(indexOfLastItem, filteredCategories.length)}</span> de <span className="font-medium">{filteredCategories.length}</span>
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
        </>
      )}
    </div>
  );
};

export default CategoriesPage;