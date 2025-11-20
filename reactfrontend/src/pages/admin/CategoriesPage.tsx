import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FolderOpen, Search, Plus, RefreshCw, Edit, Trash2, Package } from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import { useToast } from '../../contexts/ToastContext';
import type { Categoria } from '../../types';
import Sidebar from '../../components/dashboard/Sidebar';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import Button from '../../components/common/Button';

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredCategories = categories.filter((cat) =>
    cat.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.descripcion && cat.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-background-dark-secondary">
      <Sidebar role="admin" />

      <div className="flex-1 flex flex-col">
        <DashboardHeader title="Gestión de Categorías" role="admin" />

        <main className="flex-1 p-6">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link to="/admin/equipment" className="text-primary hover:underline">
              Inventario
            </Link>
            <span>/</span>
            <span>Categorías</span>
          </div>

          {/* Header */}
          <div className="bg-white dark:bg-background-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Categorías de Equipos</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar categorías..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark-tertiary text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-64"
                  />
                </div>
                <Button
                  onClick={() => navigate('/admin/categories/new')}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Categoría
                </Button>
              </div>
            </div>

            {/* Categories Grid */}
            {loading ? (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                Cargando categorías...
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="p-12 text-center">
                {categories.length === 0 ? (
                  <>
                    <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      No hay categorías creadas
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Crea la primera categoría para organizar tus equipos
                    </p>
                    <Button
                      onClick={() => navigate('/admin/categories/new')}
                      className="flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Crear Primera Categoría
                    </Button>
                  </>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    No se encontraron categorías con "{searchTerm}"
                  </p>
                )}
              </div>
            ) : (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((categoria) => (
                  <div
                    key={categoria.id}
                    className="bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-lg transition-all"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
                          <FolderOpen className="w-5 h-5 text-primary" />
                          {categoria.nombre}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {categoria.descripcion || 'Sin descripción'}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-gray-50 dark:bg-background-dark-tertiary rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-primary">
                            {categoria.equipment_count || 0}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Total Equipos
                          </div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                            {categoria.equipment_count || 0}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Activos
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => navigate(`/admin/equipment?categoria=${categoria.id}`)}
                        variant="secondary"
                        size="sm"
                        className="flex-1 flex items-center justify-center gap-1"
                      >
                        <Package className="w-4 h-4" />
                        Ver Equipos
                      </Button>
                      <Button
                        onClick={() => navigate(`/admin/categories/${categoria.id}/edit`)}
                        variant="primary"
                        size="sm"
                        className="flex items-center justify-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(categoria.id, categoria.nombre, categoria.equipment_count)}
                        variant="danger"
                        size="sm"
                        className="flex items-center justify-center gap-1"
                        disabled={(categoria.equipment_count || 0) > 0}
                        title={
                          (categoria.equipment_count || 0) > 0
                            ? 'No se puede eliminar (tiene equipos)'
                            : 'Eliminar categoría'
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Info message if can't delete */}
                    {(categoria.equipment_count || 0) > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                        No se puede eliminar (tiene equipos)
                      </p>
                    )}
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

export default CategoriesPage;
