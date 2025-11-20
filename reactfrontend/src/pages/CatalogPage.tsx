import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { catalogService } from '../services/catalogService';
import type { Equipo, Categoria, CatalogFilters as CatalogFiltersType, CatalogStats } from '../types';
import Sidebar from '../components/dashboard/Sidebar';
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
      document.getElementById('catalog-grid-top')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const hasFilters = Boolean(
    filters.search || filters.categoria_id || filters.min_precio || filters.max_precio
  );

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-background-dark-secondary">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <main className="flex-1 p-6 overflow-y-auto pb-24 scroll-smooth">
          <DashboardHeader title="Catálogo" />
          <CatalogHero stats={stats} />

          <div id="catalog-grid-top" className="flex flex-col lg:flex-row gap-6 items-start">
            <CatalogFilters
              categorias={categorias}
              onFilterChange={handleFilterChange}
              initialFilters={filters}
            />

            <div className="flex-1 flex flex-col w-full">
              {loading ? (
                <div className="flex-1 flex items-center justify-center py-20">
                  <Loading message="Cargando productos..." />
                </div>
              ) : (
                <>
                  <CatalogGrid equipos={equipos} hasFilters={hasFilters} />

                  {equipos.length > 0 && (
                    <div className="mt-8 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-6">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Mostrando página <span className="font-medium">{currentPage}</span> de <span className="font-medium">{pagination.totalPages}</span>
                        <span className="hidden sm:inline"> ({pagination.total} productos en total)</span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="flex items-center gap-1"
                        >
                          <ChevronLeft className="w-4 h-4" /> Anterior
                        </Button>

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
                                    ? 'bg-primary text-white'
                                    : 'bg-white dark:bg-background-dark-tertiary text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
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
                  )}
                </>
              )}
            </div>
          </div>
        </main>

        {cart.length > 0 && (
          <div className="fixed bottom-6 right-6 left-auto md:left-[280px] z-40 animate-fade-in-up">
            <div className="bg-white dark:bg-background-dark-tertiary border border-gray-200 dark:border-gray-600 shadow-2xl rounded-xl p-4 flex items-center justify-between gap-6 max-w-3xl mx-auto">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <ShoppingCart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Estimado</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">S/. {total.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">{cart.length} productos</p>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate(`/${user?.role}/cotizaciones/nueva`)}
                className="shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
              >
                Generar Cotización <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;