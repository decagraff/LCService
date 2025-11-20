import React, { useState } from 'react';
import { Grid3x3, List, Search } from 'lucide-react';
import type { Equipo } from '../../types';
import EquipmentCard from './EquipmentCard';

interface CatalogGridProps {
  equipos: Equipo[];
  hasFilters: boolean;
}

type ViewMode = 'grid' | 'list';

const CatalogGrid: React.FC<CatalogGridProps> = ({ equipos, hasFilters }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('catalog-view', mode);
  };

  React.useEffect(() => {
    const savedView = localStorage.getItem('catalog-view') as ViewMode;
    if (savedView) {
      setViewMode(savedView);
    }
  }, []);

  return (
    <main className="flex-1 p-6">
      {/* Results header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {hasFilters ? `Resultados de búsqueda (${equipos.length})` : `Todos los Equipos (${equipos.length})`}
        </h2>

        <div className="flex gap-2">
          <button
            onClick={() => handleViewChange('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title="Vista de cuadrícula"
          >
            <Grid3x3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleViewChange('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title="Vista de lista"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Equipment grid */}
      <div className={`grid gap-6 ${viewMode === 'list' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {equipos.length > 0 ? (
          equipos.map((equipo) => <EquipmentCard key={equipo.id} equipo={equipo} viewMode={viewMode} />)
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <Search className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No se encontraron equipos
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {hasFilters ? 'Intenta ajustar los filtros de búsqueda' : 'Aún no hay equipos disponibles en el catálogo'}
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default CatalogGrid;
