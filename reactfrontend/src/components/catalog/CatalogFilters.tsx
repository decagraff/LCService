import React, { useState, useEffect } from 'react';
import { Search, Folder, FilterX, DollarSign } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { Categoria, CatalogFilters as FilterType } from '../../types';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';

interface CatalogFiltersProps {
  categorias: Categoria[];
  onFilterChange: (filters: FilterType) => void;
  initialFilters?: FilterType;
}

const CatalogFilters: React.FC<CatalogFiltersProps> = ({ categorias, onFilterChange, initialFilters }) => {
  useAuth();
  const [filters, setFilters] = useState<FilterType>(initialFilters || {});

  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
    }
  }, [initialFilters]);

  const handleFilterChange = (key: keyof FilterType, value: string | number | undefined) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  const handleClear = () => {
    setFilters({});
    onFilterChange({});
  };

  const categoriaOptions = categorias.map((cat) => ({
    value: cat.id,
    label: cat.nombre,
  }));

  return (
    // FIX: w-80 fijo y flex-shrink-0 para que no se aplaste. Sticky para que baje con el scroll.
    <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
      <div className="bg-white dark:bg-background-dark rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm sticky top-6">
        
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
             <Search className="w-4 h-4" /> Filtros
          </h3>
          {(filters.search || filters.categoria_id || filters.min_precio) && (
            <button onClick={handleClear} className="text-xs text-red-500 hover:underline flex items-center gap-1">
              <FilterX className="w-3 h-3" /> Limpiar
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Input
              type="text"
              placeholder="Buscar equipo..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              fullWidth
              className="bg-gray-50 dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Categoría</label>
            <Select
              options={categoriaOptions}
              placeholder="Todas las categorías"
              value={filters.categoria_id || ''}
              onChange={(e) => handleFilterChange('categoria_id', e.target.value ? Number(e.target.value) : undefined)}
              fullWidth
              className="bg-gray-50 dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> Rango de Precio
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Mín"
                value={filters.min_precio || ''}
                onChange={(e) => handleFilterChange('min_precio', e.target.value ? Number(e.target.value) : undefined)}
                min={0}
                className="bg-gray-50 dark:bg-gray-800 text-sm"
              />
              <Input
                type="number"
                placeholder="Máx"
                value={filters.max_precio || ''}
                onChange={(e) => handleFilterChange('max_precio', e.target.value ? Number(e.target.value) : undefined)}
                min={0}
                className="bg-gray-50 dark:bg-gray-800 text-sm"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" fullWidth>
            Aplicar Filtros
          </Button>
        </form>

        {/* Lista rápida de categorías */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Acceso Rápido</h4>
          <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
            {categorias.map((categoria) => (
              <button
                key={categoria.id}
                onClick={() => {
                  handleFilterChange('categoria_id', categoria.id);
                  onFilterChange({ ...filters, categoria_id: categoria.id });
                }}
                className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors flex items-center gap-2
                  ${filters.categoria_id === categoria.id 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-primary font-medium' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
              >
                <Folder className="w-3 h-3 opacity-50" />
                <span className="truncate">{categoria.nombre}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default CatalogFilters;