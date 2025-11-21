import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ChevronLeft, ChevronRight, ArrowUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { catalogService } from '../services/catalogService';
import type { Equipo, Categoria, CatalogFilters as CatalogFiltersType, CatalogStats } from '../types';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import CatalogHero from '../components/catalog/CatalogHero';
import CatalogFilters from '../components/catalog/CatalogFilters';
import CatalogGrid from '../components/catalog/CatalogGrid';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';

const CatalogPage: React.FC = () => {
  const { user } = useAuth();
  const { cart, total } = useCart();
  const navigate = useNavigate();

  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [stats, setStats] = useState<CatalogStats>({
    total_equipos: 0,
    total_categorias: 0,
    precio_min: 0,
    precio_max: 0,
  });

  const [filters, setFilters] = useState<CatalogFiltersType>({});
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 12 });

  useEffect(() => {
    loadCatalogData();
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchEquipos();
    }
  }, [filters, currentPage, user]);

  const loadCatalogData = async () => {
    if (!user) return;
    try {
      const [categoriasData, statsData] = await Promise.all([
        catalogService.getCategorias(user.role),
        catalogService.getStats(user.role),
      ]);
      setCategorias(categoriasData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading catalog init data:', error);
    }
  };

  const fetchEquipos = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await catalogService.getEquipos(user.role, {
        ...filters,
        page: currentPage,
        limit: pagination.limit
      });

      setEquipos(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages
      }));
    } catch (error) {
      console.error('Error loading equipments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: CatalogFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
      // Scroll suave al inicio de la grilla
      const gridElement = document.getElementById('catalog-start');
      if (gridElement) {
        gridElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const hasFilters = Boolean(
    filters.search || filters.categoria_id || filters.min_precio || filters.max_precio
  );

  return (
    <div className="relative space-y-6">
      <DashboardHeader
        title="Catálogo de Productos"
        subtitle="Explora nuestros equipos de acero inoxidable y solicita tu cotización"
      />

      <CatalogHero stats={stats} />

      <div id="catalog-start" className="flex flex-col lg:flex-row gap-6 items-start">

        {/* Sidebar de Filtros */}
        <CatalogFilters
          categorias={categorias}
          onFilterChange={handleFilterChange}
          initialFilters={filters}
          stats={{
            precio_min: stats.precio_min,
            precio_max: stats.precio_max
          }}
        />

        {/* Contenido Principal */}
        <div className="flex-1 flex flex-col w-full min-w-0">
          {loading ? (
            <div className="flex-1 flex items-center justify-center py-32 bg-white dark:bg-background-dark rounded-xl border border-gray-200 dark:border-gray-700">
              <Loading message="Cargando productos..." />
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="bg-white dark:bg-background-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                <CatalogGrid equipos={equipos} hasFilters={hasFilters} />

                {/* Footer de Paginación */}
                {equipos.length > 0 && (
                  <div className="p-6 border-t border-gray-200 dark:border-gray-700 mt-auto">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Página <span className="font-medium text-gray-900 dark:text-gray-100">{currentPage}</span> de <span className="font-medium text-gray-900 dark:text-gray-100">{pagination.totalPages}</span>
                        <span className="hidden sm:inline text-gray-400 mx-2">•</span>
                        <span className="hidden sm:inline">{pagination.total} productos</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="flex items-center gap-1"
                        >
                          <ChevronLeft className="w-4 h-4" /> Anterior
                        </Button>

                        {/* Números de página simplificados */}
                        <div className="hidden sm:flex gap-1">
                          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            let p = i + 1;
                            if (pagination.totalPages > 5 && currentPage > 3) {
                              p = currentPage - 2 + i;
                              if (p > pagination.totalPages) p = pagination.totalPages - (4 - i);
                            }
                            return (
                              <button
                                key={p}
                                onClick={() => handlePageChange(p)}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === p
                                  ? 'bg-primary text-white shadow-sm'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                  }`}
                              >
                                {p}
                              </button>
                            );
                          })}
                        </div>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === pagination.totalPages}
                          className="flex items-center gap-1"
                        >
                          Siguiente <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botón Flotante de Cotización (Si hay items en carrito) */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40 animate-fade-in-up">
          <div className="bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-600 shadow-2xl rounded-2xl p-4 flex items-center gap-6 transition-transform hover:scale-[1.02]">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full relative">
                <ShoppingCart className="w-6 h-6 text-primary" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-background-dark">
                  {cart.length}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Total Estimado</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">S/. {total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={() => navigate(`/${user?.role}/cotizaciones/nueva`)}
              className="shadow-lg shadow-primary/25 px-6"
            >
              Ir a Cotizar <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogPage;