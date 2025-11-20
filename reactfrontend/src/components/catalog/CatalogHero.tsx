import React from 'react';
import { Package, FolderOpen, DollarSign } from 'lucide-react';
import type { CatalogStats } from '../../types';

interface CatalogHeroProps {
  stats: CatalogStats;
}

const CatalogHero: React.FC<CatalogHeroProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white dark:bg-background-dark p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Package className="w-6 h-6 text-primary" />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.total_equipos}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Equipos Disponibles</div>
        </div>
      </div>

      <div className="bg-white dark:bg-background-dark p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <FolderOpen className="w-6 h-6 text-primary" />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.total_categorias}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Categorías</div>
        </div>
      </div>

      <div className="bg-white dark:bg-background-dark p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <DollarSign className="w-6 h-6 text-primary" />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          S/. {(Number(stats.precio_min) || 0).toFixed(0)} - {(Number(stats.precio_max) || 0).toFixed(0)}
        </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Rango de Precios</div>
        </div>
      </div>
    </div>
  );
};

export default CatalogHero;