import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { catalogService } from '../../services/catalogService';
import { useToast } from '../../contexts/ToastContext';
import type { Equipo, Categoria } from '../../types';
import Sidebar from '../../components/dashboard/Sidebar';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

const VendedorInventoryPage: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipo[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { showToast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [equiposData, categoriesData] = await Promise.all([
        catalogService.getEquipos('vendedor', {
          search: searchTerm,
          categoria_id: categoryFilter ? parseInt(categoryFilter) : undefined
        }),
        catalogService.getCategorias('vendedor')
      ]);

      setEquipment(equiposData);
      setCategories(categoriesData);
      setCurrentPage(1); // Resetear a página 1 al filtrar
    } catch (error) {
      console.error(error);
      showToast('Error al cargar el inventario', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  // Lógica de Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = equipment.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(equipment.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (stock <= 5) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-background-dark-secondary">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 p-6 overflow-y-auto">
          <DashboardHeader title="Consulta de Stock" />

          {/* Filtros */}
          <div className="bg-white dark:bg-background-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Buscar Equipo</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Código o nombre..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark-tertiary focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="w-full md:w-64">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark-tertiary focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="">Todas</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  <Filter className="w-4 h-4 mr-2" /> Filtrar
                </Button>
                <Button type="button" variant="secondary" onClick={() => { setSearchTerm(''); setCategoryFilter(''); setTimeout(fetchData, 100); }}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>

          {/* Tabla de Inventario */}
          <div className="bg-white dark:bg-background-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Resultados</h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">{equipment.length} equipos encontrados</span>
            </div>

            {loading ? (
              <div className="p-12 flex justify-center"><Loading /></div>
            ) : equipment.length === 0 ? (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">No se encontraron equipos con los filtros seleccionados.</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-background-dark-tertiary border-b border-gray-200 dark:border-gray-700 font-medium text-gray-600 dark:text-gray-300">
                      <tr>
                        <th className="px-6 py-3">Código</th>
                        <th className="px-6 py-3">Equipo</th>
                        <th className="px-6 py-3">Categoría</th>
                        <th className="px-6 py-3 text-right">Precio</th>
                        <th className="px-6 py-3 text-center">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {currentItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-6 py-3 font-mono text-gray-500 dark:text-gray-400">{item.codigo}</td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              {item.imagen_url ? (
                                <img src={item.imagen_url} alt="" className="w-10 h-10 rounded object-cover bg-gray-200" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                              ) : (
                                <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                  <Package className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                              <span className="font-medium text-gray-900 dark:text-gray-100">{item.nombre}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-gray-600 dark:text-gray-400">{item.categoria_nombre}</td>
                          <td className="px-6 py-3 text-right font-medium text-primary">
                            S/. {Number(item.precio).toFixed(2)}
                          </td>
                          <td className="px-6 py-3 text-center">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${getStockColor(item.stock)}`}>
                              {item.stock}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-background-dark-tertiary rounded-b-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, equipment.length)} de {equipment.length}
                    </span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="ml-2 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-background-dark text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-primary"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-white dark:bg-background-dark border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let p = i + 1;
                        if (totalPages > 5 && currentPage > 3) {
                          p = currentPage - 2 + i;
                          if (p > totalPages) p = totalPages - (4 - i);
                        }

                        return (
                          <button
                            key={p}
                            onClick={() => handlePageChange(p)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === p
                                ? 'bg-primary text-white'
                                : 'bg-white dark:bg-background-dark text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100'
                              }`}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-white dark:bg-background-dark border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default VendedorInventoryPage;