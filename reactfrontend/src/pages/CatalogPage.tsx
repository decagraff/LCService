import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowRight } from 'lucide-react';
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

  useEffect(() => {
    loadCatalogData();
  }, [user]);

  const loadCatalogData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [equiposData, categoriasData, statsData] = await Promise.all([
        catalogService.getEquipos(user.role, filters),
        catalogService.getCategorias(user.role),
        catalogService.getStats(user.role),
      ]);
      setEquipos(equiposData);
      setCategorias(categoriasData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading catalog:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (newFilters: CatalogFiltersType) => {
    if (!user) return;
    setFilters(newFilters);
    try {
      setLoading(true);
      const equiposData = await catalogService.getEquipos(user.role, newFilters);
      setEquipos(equiposData);
    } catch (error) {
      console.error('Error filtering catalog:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasFilters = Boolean(
    filters.search || filters.categoria_id || filters.min_precio || filters.max_precio
  );

  if (loading && equipos.length === 0) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-background-dark-secondary">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loading message="Cargando catálogo..." />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-background-dark-secondary">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <main className="flex-1 p-6 overflow-y-auto pb-24">
          <DashboardHeader title="Catálogo" />
          <CatalogHero stats={stats} />

          <div className="flex flex-col lg:flex-row gap-6">
            <CatalogFilters
              categorias={categorias}
              onFilterChange={handleFilterChange}
              initialFilters={filters}
            />

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loading message="Filtrando equipos..." />
              </div>
            ) : (
              <CatalogGrid equipos={equipos} hasFilters={hasFilters} />
            )}
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
